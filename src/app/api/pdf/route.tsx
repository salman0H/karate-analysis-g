import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { ReportDocument } from "@/components/pdf/report-document";
import { getTodayJalaliString } from "@/lib/jalali";
import { SportDiscipline } from "@/types/athlete";

interface PdfRequestBody {
  fullName: string;
  gender: "MALE" | "FEMALE" | null;
  age: number | null;
  birthDateJalali: string | null;
  discipline?: SportDiscipline | string | null;
  metrics: Record<string, number | string | null>;
  selfieDataUrl?: string | null;
  chartImagePath?: string | null;
  chartDataUrl?: string | null;
  report: string;
  dataOnly?: boolean;
}

function resolveChartImagePath(fullName: string, customPath?: string | null): string | null {
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  const cleanName = fullName.split(/[\s(]/)[0].trim();
  const englishMatch = fullName.match(/\((.*?)\)/)?.[1]?.trim();
  const candidateNames = [
    fullName.trim(),
    cleanName,
    englishMatch,
  ].filter(Boolean) as string[];

  const chartsDir = path.join(process.cwd(), "generated-reports", "charts");
  for (const c of candidateNames) {
    const candidatePath = path.join(chartsDir, `chart_${c}.png`);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
}

function createReportDocument(body: PdfRequestBody) {
  const chartImagePath = resolveChartImagePath(body.fullName, body.chartImagePath);

  return (
    <ReportDocument
      fullName={body.fullName}
      gender={body.gender ?? null}
      age={body.age ?? null}
      birthDateJalali={body.birthDateJalali ?? null}
      discipline={body.discipline ?? "karate"}
      metrics={body.metrics}
      selfieDataUrl={body.selfieDataUrl}
      chartImagePath={chartImagePath}
      chartDataUrl={body.chartDataUrl}
      report={body.report}
      generatedAt={getTodayJalaliString()}
      dataOnly={body.dataOnly ?? false}
    />
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PdfRequestBody;

    if (!body.fullName || !body.metrics || !body.report) {
      return NextResponse.json(
        { error: "داده‌های ضروری جهت صدور شناسنامه PDF کامل نیستند." },
        { status: 400 }
      );
    }

    const pdfBuffer = await renderToBuffer(createReportDocument(body));

    const safeFilename = encodeURIComponent(
      `شناسنامه-آنالیز-${body.fullName.replace(/\s+/g, "_")}.pdf`
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PDF generation server error:", error);
    return NextResponse.json(
      { error: "خطا در تولید فایل PDF گزارش آنالیز بدنی" },
      { status: 500 }
    );
  }
}
