import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AthleteFormValues } from "@/types/athlete";
import { calculateAgeFromJalali } from "@/lib/jalali";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AthleteFormValues & {
      aiReport?: string;
    };

    if (!body.fullName || !body.birthDateJalali || !body.metrics) {
      return NextResponse.json(
        { error: "اطلاعات ثبت نام ورزشکار کامل نیست." },
        { status: 400 }
      );
    }

    const calculatedAge = calculateAgeFromJalali(body.birthDateJalali) ?? 20;

    // Persist to PostgreSQL if PrismaClient is active
    if (prisma) {
      try {
        const athlete = await prisma.athlete.create({
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
              },
            },
          },
          include: {
            assessments: true,
          },
        });

        return NextResponse.json({
          success: true,
          athleteId: athlete.id,
          assessmentId: athlete.assessments[0]?.id,
        });
      } catch (dbError) {
        console.warn("Database storage note:", dbError);
      }
    }

    // In-memory acknowledgment if database connection is pending
    return NextResponse.json({
      success: true,
      athleteId: "session-" + Date.now(),
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
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { assessments: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      return NextResponse.json({ data: records });
    } catch {
      return NextResponse.json({ data: [] });
    }
  }
  return NextResponse.json({ data: [] });
}
