import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/pdf/report-document";
import { getTodayJalaliString } from "@/lib/jalali";

interface PdfRequestBody {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  birthDateJalali: string;
  metrics: Record<string, number | string>;
  selfieDataUrl?: string | null;
  report: string;
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

    const generatedAt = getTodayJalaliString();

    const documentElement = (
      <ReportDocument
        fullName={body.fullName}
        gender={body.gender}
        age={body.age}
        birthDateJalali={body.birthDateJalali}
        metrics={body.metrics}
        selfieDataUrl={body.selfieDataUrl}
        report={body.report}
        generatedAt={generatedAt}
      />
    );

    const pdfBuffer = await renderToBuffer(documentElement);

    const safeFilename = encodeURIComponent(
      `گزارش-آنالیز-${body.fullName.replace(/\s+/g, "_")}.pdf`
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
