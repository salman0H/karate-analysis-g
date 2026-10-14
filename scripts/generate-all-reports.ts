import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import Groq from "groq-sdk";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnvConfig(process.cwd());

import { METRICS_CONFIG } from "../src/config/metrics.config";
import { ReportDocument } from "../src/components/pdf/report-document";
import { getTodayJalaliString } from "../src/lib/jalali";

interface RawRecord {
  name: string;
  measuredAt: string;
  weight: number;
  bodyScore: number | null;
  bmi: number;
  bodyFatPercentage: number;
  bodyWaterMass: number;
  fatMass: number;
  boneMineralContent: number;
  proteinMass: number;
  muscleMass: number;
  musclePercentage: number;
  bodyWaterPercentage: number;
  proteinPercentage: number;
  boneMineralPercentage: number;
  skeletalMuscleMass: number;
  visceralFatRating: number | null;
  basalMetabolicRate: number;
  waistToHipRatio: number | null;
  bodyAge: number;
  fatFreeBodyWeight: number | null;
  heartRate: number | null;
}

interface Profile {
  nameFa: string;
  nameEn: string;
  displayName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  birthDateJalali: string;
}

const ATHLETE_PROFILES: Record<string, Profile> = {
  Reza: {
    nameFa: "رضا",
    nameEn: "Reza",
    displayName: "رضا (Reza)",
    gender: "MALE",
    age: 63,
    birthDateJalali: "1342/01/01",
  },
  Maleki: {
    nameFa: "ملکی",
    nameEn: "Maleki",
    displayName: "ملکی (Maleki)",
    gender: "MALE",
    age: 55,
    birthDateJalali: "1350/01/01",
  },
  Adrian: {
    nameFa: "آدریان",
    nameEn: "Adrian",
    displayName: "آدریان (Adrian)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
  },
  Arsam: {
    nameFa: "آرسام",
    nameEn: "Arsam",
    displayName: "آرسام (Arsam)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
  },
  Amirali: {
    nameFa: "امیرعلی",
    nameEn: "Amirali",
    displayName: "امیرعلی (Amirali)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
  },
  Yousef: {
    nameFa: "یوسف",
    nameEn: "Yousef",
    displayName: "یوسف (Yousef)",
    gender: "MALE",
    age: 14,
    birthDateJalali: "1391/01/01",
  },
  Mahyar: {
    nameFa: "مهیار",
    nameEn: "Mahyar",
    displayName: "مهیار (Mahyar)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
  },
  Homayon: {
    nameFa: "همایون",
    nameEn: "Homayon",
    displayName: "همایون (Homayon)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
  },
  Amin: {
    nameFa: "امین",
    nameEn: "Amin",
    displayName: "امین (Amin)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
  },
  Alireza: {
    nameFa: "علیرضا",
    nameEn: "Alireza",
    displayName: "علیرضا (Alireza)",
    gender: "MALE",
    age: 16,
    birthDateJalali: "1389/01/01",
  },
  Ghafari: {
    nameFa: "غفاری",
    nameEn: "Ghafari",
    displayName: "غفاری (Ghafari)",
    gender: "MALE",
    age: 40,
    birthDateJalali: "1365/01/01",
  },
};

function toMetrics(record: RawRecord): Record<string, number | string | null> {
  return {
    weight: record.weight,
    heartRate: record.heartRate,
    bmi: record.bmi,
    bodyScore: record.bodyScore,
    bodyWaterMass: record.bodyWaterMass,
    bodyWaterPercentage: record.bodyWaterPercentage,
    fatMass: record.fatMass,
    bodyFatPercentage: record.bodyFatPercentage,
    proteinMass: record.proteinMass,
    proteinPercentage: record.proteinPercentage,
    muscleMass: record.muscleMass,
    musclePercentage: record.musclePercentage,
    boneMineralContent: record.boneMineralContent,
    boneMineralPercentage: record.boneMineralPercentage,
    visceralFatRate: record.visceralFatRating,
    bmr: record.basalMetabolicRate,
    leanBodyMass: record.fatFreeBodyWeight,
    estimatedWaistHipRatio: record.waistToHipRatio,
    bodyAge: record.bodyAge,
    skeletalMuscleMass: record.skeletalMuscleMass,
    weightControl: null,
    muscleControl: null,
    fatControl: null,
    standardWeight: null,
    bodyType: null,
  };
}

function formatMetricsForPrompt(metrics: Record<string, number | string | null>): string {
  return METRICS_CONFIG.map((def, idx) => {
    const rawVal = metrics[def.key];
    if (rawVal === undefined || rawVal === null || rawVal === "") return null;
    let displayVal = String(rawVal);
    if (def.isText && def.textOptions) {
      const matched = def.textOptions.find((opt) => opt.value === rawVal);
      if (matched) displayVal = matched.labelFa;
    }
    return `${idx + 1}. ${def.labelFa} (${def.nameEn}): ${displayVal} ${def.unit} [اهمیت در کاراته: ${def.karateContext ?? "عمومی"}]`;
  })
    .filter(Boolean)
    .join("\n");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGroqAnalysisWithRetry(
  groq: Groq,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 3
): Promise<string> {
  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const model of models) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 1400,
        });

        const content = completion.choices[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content;
        }
      } catch (err: any) {
        const isRateLimit = err?.status === 429 || err?.message?.includes("rate_limit");
        console.warn(`[Attempt ${attempt}] Groq error with model ${model}: ${err?.message}`);
        if (isRateLimit) {
          console.info(`Waiting 5s before retrying due to rate limit...`);
          await sleep(5000);
        }
      }
    }
    await sleep(attempt * 3000);
  }

  throw new Error("Failed to get Groq analysis after maximum retries.");
}

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }
  const groq = new Groq({ apiKey });

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }
  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const dataFilePath = path.resolve(process.cwd(), "scripts/athlete-import-data.json");
  const rawData = JSON.parse(await readFile(dataFilePath, "utf8")) as RawRecord[];
  const outputDir = path.resolve(process.cwd(), "generated-reports");

  console.info(`Starting processing for ${rawData.length} athletes...`);

  for (let i = 0; i < rawData.length; i++) {
    const record = rawData[i];
    const profile = ATHLETE_PROFILES[record.name] ?? {
      nameFa: record.name,
      nameEn: record.name,
      displayName: record.name,
      gender: "MALE" as const,
      age: record.bodyAge ?? 20,
      birthDateJalali: "1380/01/01",
    };

    console.info(`\n[${i + 1}/${rawData.length}] Processing ${record.name} (${profile.displayName})...`);

    const metrics = toMetrics(record);
    const metricsSummary = formatMetricsForPrompt(metrics);

    const systemPrompt = `شما یک مربی ارشد و نخبه آماده‌سازی جسمانی (Elite Karate Conditioning Coach) در رشته کاراته کنترلی و سنتی (WKF) هستید که در «باشگاه کاراته شرکت برق منطقه ای خراسان» فعالیت می‌کنید.
شما باید تحلیل کاملاً علمی، عملیاتی، مستقیم، بدون تعارف و متناسب با استانداردهای قهرمانی کاراته ارائه دهید. تحلیل باید شامل:
۱. تحلیل اختصاصی توده عضلانی و چربی بر توان انفجاری کومیته (سرعت دست و پا) و پایداری کاتا (ثبات داچی‌ها).
۲. بررسی شاخص آب بدن، استخوان و چربی احشایی در استقامت و پیشگیری از آسیب.
۳. نقاط قوت فیزیکی ورزشکار بر اساس اعداد ثبت شده.
۴. نقاط ضعف و ریسک‌های موجود با زبان فنی مربیگری.
۵. یک پروتکل ۴ هفته‌ای مشخص تمرینی و تغذیه‌ای به تفکیک هفته‌ها.
قانون کلیدی: ممکن است برخی از فاکتورها توسط دستگاه اندازه گیری نشده باشند یا در فرم در حالت «عدم اعمال» قرار گرفته باشند (در لیست ورودی غایب باشند). به هیچ وجه اعدادی را برای فاکتورهای غایب حدس نزنید یا جعل نکنید؛ تحلیل را منحصراً بر پایه فاکتورهای اعمال‌شده و موجود ارائه دهید.
اگر جنسیت یا سن تقویمی ارائه نشده است، از دسته‌بندی‌های وابسته به سن/جنسیت، نتیجه‌گیری درباره BMI، تجویز کالری یا کاهش وزن تهاجمی خودداری کنید. این گزارش تشخیص پزشکی نیست و برای ورزشکار نوجوان، برنامه تغذیه/تمرین باید با نظارت مربی و متخصص واجد صلاحیت باشد.
قوانین اکید نگارشی جهت خروجی رسمی PDF:
- اکیداً از رسم جدول مارک‌داون (مانند کاراکترهای پایپ | یا خط‌چین ---) خودداری کنید؛ جدول در چاپگر تداخل ایجاد می‌کند.
- از علامت‌های هشتگ (#) برای تیترها استفاده نکنید؛ تیترها را ساده و شماره‌دار بنویسید (مثال: «۱. تحلیل راندمان مکانیکی و عضلانی:»).
- از علامت‌های ستاره (**) برای بولد کردن در متن استفاده نکنید.
- شاخص‌ها و توصیه‌ها را به صورت بندهای مجزا با علامت «• » بنویسید (مثال: «• نسبت توان به وزن: بسیار مطلوب — سرعت استارت‌های کومیته عالی»).
زبان خروجی: کاملاً فارسی روان، تخصصی با اصطلاحات کاراته و بدون مقدمه‌چینی زائد.`;

    const userPrompt = `مشخصات ورزشکار:
نام و نام خانوادگی: ${profile.displayName}
جنسیت: ${profile.gender === "MALE" ? "مرد" : "زن"}
سن تقویمی: ${profile.age} سال
زمان اندازه‌گیری: ${record.measuredAt}
باشگاه: باشگاه کاراته شرکت برق منطقه ای خراسان

شاخص‌های آنالیز اسکن بدن (Xiaomi S400):
${metricsSummary}

لطفاً تحلیل کامل تخصصی کاراته را بر اساس اصول آمادگی جسمانی ارائه کن.`;

    // 1. Call Groq with retry
    console.info(`- Requesting Groq AI analysis...`);
    const aiReport = await requestGroqAnalysisWithRetry(groq, systemPrompt, userPrompt);
    console.info(`- Received Groq report (${aiReport.length} characters).`);

    // 2. Persist to PostgreSQL via Prisma
    console.info(`- Updating database record...`);
    const measuredAtDate = new Date(record.measuredAt);

    let athlete = await prisma.athlete.findFirst({
      where: {
        OR: [
          { fullName: record.name },
          { fullName: profile.displayName },
        ],
      },
    });

    if (!athlete) {
      athlete = await prisma.athlete.create({
        data: {
          fullName: profile.displayName,
          gender: profile.gender,
          birthDateJalali: profile.birthDateJalali,
          age: profile.age,
        },
      });
    } else {
      athlete = await prisma.athlete.update({
        where: { id: athlete.id },
        data: {
          fullName: profile.displayName,
          gender: profile.gender,
          birthDateJalali: profile.birthDateJalali,
          age: profile.age,
        },
      });
    }

    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        athleteId: athlete.id,
        measuredAt: measuredAtDate,
      },
    });

    if (existingAssessment) {
      await prisma.assessment.update({
        where: { id: existingAssessment.id },
        data: {
          metrics: metrics as any,
          aiReport,
          deviceModel: "Xiaomi S400",
        },
      });
    } else {
      await prisma.assessment.create({
        data: {
          athleteId: athlete.id,
          measuredAt: measuredAtDate,
          metrics: metrics as any,
          aiReport,
          deviceModel: "Xiaomi S400",
        },
      });
    }
    console.info(`- Database updated successfully.`);

    // 3. Generate PDF
    const pdfPath = path.join(outputDir, `Report-${record.name}.pdf`);
    console.info(`- Rendering PDF: ${path.relative(process.cwd(), pdfPath)}...`);

    const pdfDoc = React.createElement(ReportDocument, {
      fullName: profile.displayName,
      gender: profile.gender,
      age: profile.age,
      birthDateJalali: profile.birthDateJalali,
      metrics,
      report: aiReport,
      generatedAt: getTodayJalaliString(),
      dataOnly: false,
    });

    await renderToFile(pdfDoc, pdfPath);
    console.info(`- PDF generated successfully.`);

    // Wait 2 seconds before next athlete to respect rate limits
    if (i < rawData.length - 1) {
      console.info(`- Pausing 2s before next athlete...`);
      await sleep(2000);
    }
  }

  await prisma.$disconnect();
  await pool.end();
  console.info(`\nAll ${rawData.length} athletes processed, saved to database, and PDFs generated in ${outputDir}!`);
}

main().catch((err) => {
  console.error("Error in process:", err);
  process.exit(1);
});
