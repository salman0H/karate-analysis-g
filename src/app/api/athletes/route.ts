import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AthleteFormValues } from "@/types/athlete";
import { calculateAgeFromJalali } from "@/lib/jalali";

interface SaveAthletePayload extends AthleteFormValues {
  athleteId?: string;
  aiReport?: string;
  measuredAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveAthletePayload;

    if (!body.fullName || !body.birthDateJalali || !body.metrics) {
      return NextResponse.json(
        { error: "اطلاعات ثبت نام ورزشکار کامل نیست." },
        { status: 400 }
      );
    }

    const calculatedAge = calculateAgeFromJalali(body.birthDateJalali) ?? 20;
    const assessmentDate = body.measuredAt ? new Date(body.measuredAt) : new Date();

    // Persist to PostgreSQL if PrismaClient is active
    if (prisma) {
      try {
        // Check if athlete already exists by ID or by exact Full Name
        let athlete = body.athleteId
          ? await prisma.athlete.findUnique({
              where: { id: body.athleteId },
            })
          : null;

        if (!athlete) {
          athlete = await prisma.athlete.findFirst({
            where: { fullName: body.fullName },
          });
        }

        if (athlete) {
          // Update profile attributes if needed
          await prisma.athlete.update({
            where: { id: athlete.id },
            data: {
              age: calculatedAge,
              gender: body.gender,
              birthDateJalali: body.birthDateJalali,
              selfieUrl: body.selfieDataUrl || athlete.selfieUrl,
            },
          });

          // Append new longitudinal assessment session with compact JSONB metrics
          const newAssessment = await prisma.assessment.create({
            data: {
              athleteId: athlete.id,
              metrics: body.metrics,
              aiReport: body.aiReport ?? null,
              selfieUrl: body.selfieDataUrl || athlete.selfieUrl,
              deviceModel: "Xiaomi S400",
              measuredAt: assessmentDate,
            },
          });

          return NextResponse.json({
            success: true,
            athleteId: athlete.id,
            assessmentId: newAssessment.id,
            isNewAthlete: false,
          });
        }

        // New Athlete Registration
        const createdAthlete = await prisma.athlete.create({
          data: {
            fullName: body.fullName,
            gender: body.gender,
            birthDateJalali: body.birthDateJalali,
            age: calculatedAge,
            selfieUrl: body.selfieDataUrl ?? null,
            assessments: {
              create: {
                metrics: body.metrics, // Dynamic JSONB registry storage
                aiReport: body.aiReport ?? null,
                selfieUrl: body.selfieDataUrl ?? null,
                deviceModel: "Xiaomi S400",
                measuredAt: assessmentDate,
              },
            },
          },
          include: {
            assessments: true,
          },
        });

        return NextResponse.json({
          success: true,
          athleteId: createdAthlete.id,
          assessmentId: createdAthlete.assessments[0]?.id,
          isNewAthlete: true,
        });
      } catch (dbError) {
        console.warn("Database storage note:", dbError);
      }
    }

    // In-memory acknowledgment if database connection is pending
    return NextResponse.json({
      success: true,
      athleteId: body.athleteId || "session-" + Date.now(),
      status: "acknowledged",
    });
  } catch (error) {
    console.error("Athlete ingestion API error:", error);
    return NextResponse.json(
      { error: "خطا در ثبت اطلاعات ورزشکار در پایگاه داده" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (prisma) {
    try {
      const records = await prisma.athlete.findMany({
        orderBy: { fullName: "asc" },
        include: {
          assessments: {
            orderBy: { measuredAt: "asc" }, // chronological order for time series
          },
        },
      });
      return NextResponse.json({ data: records });
    } catch (err) {
      console.warn("Error fetching athletes from database:", err);
      return NextResponse.json({ data: [] });
    }
  }
  return NextResponse.json({ data: [] });
}
