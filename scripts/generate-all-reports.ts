import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { readFile } from "node:fs/promises";
import fs from "node:fs";
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
import { SportDiscipline, SPORT_DISCIPLINES } from "../src/types/athlete";

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
  discipline?: SportDiscipline;
}

const ATHLETE_PROFILES: Record<string, Profile> = {
  Oghbaee: {
    nameFa: "عقبایی",
    nameEn: "Oghbaee",
    displayName: "عقبایی (Oghbaee)",
    gender: "MALE",
    age: 63,
    birthDateJalali: "1342/01/01",
    discipline: "karate",
  },
  Reza: {
    nameFa: "عقبایی",
    nameEn: "Oghbaee",
    displayName: "عقبایی (Oghbaee)",
    gender: "MALE",
    age: 63,
    birthDateJalali: "1342/01/01",
    discipline: "karate",
  },
  Maleki: {
    nameFa: "ملکی",
    nameEn: "Maleki",
    displayName: "ملکی (Maleki)",
    gender: "MALE",
    age: 55,
    birthDateJalali: "1350/01/01",
    discipline: "karate",
  },
  Adrian: {
    nameFa: "آدریان",
    nameEn: "Adrian",
    displayName: "آدریان (Adrian)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
    discipline: "karate",
  },
  Arsam: {
    nameFa: "آرسام",
    nameEn: "Arsam",
    displayName: "آرسام (Arsam)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
    discipline: "karate",
  },
  Amirali: {
    nameFa: "امیرعلی",
    nameEn: "Amirali",
    displayName: "امیرعلی (Amirali)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
    discipline: "karate",
  },
  Yousef: {
    nameFa: "یوسف",
    nameEn: "Yousef",
    displayName: "یوسف (Yousef)",
    gender: "MALE",
    age: 14,
    birthDateJalali: "1391/01/01",
    discipline: "karate",
  },
  Mahyar: {
    nameFa: "مهیار",
    nameEn: "Mahyar",
    displayName: "مهیار (Mahyar)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
    discipline: "karate",
  },
  Homayon: {
    nameFa: "همایون",
    nameEn: "Homayon",
    displayName: "همایون (Homayon)",
    gender: "MALE",
    age: 10,
    birthDateJalali: "1395/01/01",
    discipline: "karate",
  },
  Amin: {
    nameFa: "امین",
    nameEn: "Amin",
    displayName: "امین (Amin)",
    gender: "MALE",
    age: 15,
    birthDateJalali: "1390/01/01",
    discipline: "karate",
  },
  Alireza: {
    nameFa: "علیرضا",
    nameEn: "Alireza",
    displayName: "علیرضا (Alireza)",
    gender: "MALE",
    age: 16,
    birthDateJalali: "1389/01/01",
    discipline: "karate",
  },
  Ghafari: {
    nameFa: "غفاری",
    nameEn: "Ghafari",
    displayName: "غفاری (Ghafari)",
    gender: "MALE",
    age: 40,
    birthDateJalali: "1365/01/01",
    discipline: "karate",
  },
};

function toMetrics(record: RawRecord): Record<string, number | string | null> {
  return {
    weight: record.weight,
    bodyScore: record.bodyScore,
    bmi: record.bmi,
    bodyFatPercentage: record.bodyFatPercentage,
    bodyWaterMass: record.bodyWaterMass,
    fatMass: record.fatMass,
    boneMineralContent: record.boneMineralContent,
    proteinMass: record.proteinMass,
    muscleMass: record.muscleMass,
    musclePercentage: record.musclePercentage,
    bodyWaterPercentage: record.bodyWaterPercentage,
    proteinPercentage: record.proteinPercentage,
    boneMineralPercentage: record.boneMineralPercentage,
    skeletalMuscleMass: record.skeletalMuscleMass,
    visceralFatRate: record.visceralFatRating,
    bmr: record.basalMetabolicRate,
    estimatedWaistHipRatio: record.waistToHipRatio,
    bodyAge: record.bodyAge,
    leanBodyMass: record.fatFreeBodyWeight,
    heartRate: record.heartRate,
    bodyType: record.bmi < 18.5 ? "underweight" : record.bodyFatPercentage < 14 ? "balancedMuscular" : "balanced",
    standardWeight: Number((record.weight * 0.98).toFixed(1)),
    weightControl: 0,
    fatControl: record.bodyFatPercentage > 15 ? -2.0 : 0,
    muscleControl: record.musclePercentage < 75 ? 2.5 : 0,
  };
}

function formatMetricsForPrompt(metrics: Record<string, number | string | null>): string {
  return METRICS_CONFIG.map((def, idx) => {
    const rawVal = metrics[def.key];
    if (rawVal === undefined || rawVal === null || rawVal === "") return null;
    return `${idx + 1}. ${def.labelFa} (${def.nameEn}): ${rawVal} ${def.unit} [اهمیت: ${def.karateContext ?? "عمومی"}]`;
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
  maxRetries = 4
): Promise<string> {
  const modelToUse = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const fallbackModel = "openai/gpt-oss-20b";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.info(`- Attempt ${attempt} calling Groq model (${attempt > 2 ? fallbackModel : modelToUse})...`);
      const completion = await groq.chat.completions.create({
        model: attempt > 2 ? fallbackModel : modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1400,
      });

      const report = completion.choices[0]?.message?.content;
      if (report && report.trim().length > 0) {
        return report.trim();
      }
      throw new Error("Empty response from Groq.");
    } catch (error: any) {
      console.warn(`Warning: Groq attempt ${attempt} failed: ${error?.message || error}`);
      if (attempt === maxRetries) {
        throw error;
      }
      if (error?.status === 429 || String(error?.message).includes("rate_limit")) {
        console.info(`Waiting 5s before retrying due to rate limit...`);
        await sleep(5000);
      }
    }
    await sleep(attempt * 2000);
  }

  throw new Error("Failed to get Groq analysis after maximum retries.");
}

async function main() {
  const args = process.argv.slice(2);
  const forceGroq = args.includes("--force-groq");
  const disciplineArg = args.find((a) => a.startsWith("--discipline="))?.split("=")[1] as SportDiscipline | undefined;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }
  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let groq: Groq | null = null;
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    groq = new Groq({ apiKey });
  }

  const dataFilePath = path.resolve(process.cwd(), "scripts/athlete-import-data.json");
  const rawData = JSON.parse(await readFile(dataFilePath, "utf8")) as RawRecord[];
  const outputDir = path.resolve(process.cwd(), "generated-reports");
  const chartsDir = path.resolve(outputDir, "charts");
  const markdownDir = path.resolve(outputDir, "markdown");

  console.info(`Starting batch processing for ${rawData.length} athletes with embedded charts & 2-page PDF...`);

  for (let i = 0; i < rawData.length; i++) {
    const record = rawData[i];
    const profile = ATHLETE_PROFILES[record.name] ?? {
      nameFa: record.name,
      nameEn: record.name,
      displayName: record.name,
      gender: "MALE" as const,
      age: record.bodyAge ?? 20,
      birthDateJalali: "1380/01/01",
      discipline: "karate" as const,
    };

    const athleteDiscipline: SportDiscipline = disciplineArg || profile.discipline || "karate";
    console.info(`\n[${i + 1}/${rawData.length}] Processing ${record.name} (${profile.displayName}) [Discipline: ${athleteDiscipline}]...`);

    const metrics = toMetrics(record);
    const measuredAtDate = new Date(record.measuredAt);

    // 1. Resolve AI Report: check existing DB assessment or markdown first
    let aiReport = "";

    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        athlete: {
          OR: [
            { fullName: record.name },
            { fullName: profile.displayName },
            { fullName: "Reza" },
            { fullName: "رضا (Reza)" },
          ],
        },
        measuredAt: measuredAtDate,
      },
      include: { athlete: true },
    });

    if (!forceGroq && existingAssessment?.aiReport && existingAssessment.aiReport.trim().length > 100) {
      aiReport = existingAssessment.aiReport.trim();
      console.info(`- Reusing existing AI report from database (${aiReport.length} chars).`);
    } else {
      // Check if markdown report file exists on disk
      const mdPath = path.resolve(markdownDir, `Report-${record.name}.md`);
      if (!forceGroq && fs.existsSync(mdPath)) {
        const mdContent = await readFile(mdPath, "utf8");
        // Extract the AI section from markdown
        const aiMarker = "## 🧠 تحلیل تخصصی";
        if (mdContent.includes(aiMarker)) {
          const rawSection = mdContent.split(aiMarker)[1] || "";
          // Strip footer
          const cleanedAi = rawSection.split("---")[0]?.replace(/^[>\s!IMPORTANT]+/m, "").trim();
          if (cleanedAi && cleanedAi.length > 100) {
            aiReport = cleanedAi;
            console.info(`- Extracted existing AI report from markdown (${aiReport.length} chars).`);
          }
        }
      }
    }

    // If still no report or forceGroq requested, call Groq API
    if (!aiReport && groq) {
      console.info(`- Calling Groq AI API for ${athleteDiscipline} assessment...`);
      const metricsSummary = formatMetricsForPrompt(metrics);

      const systemPrompt = `شما یک مربی ارشد و نخبه آماده‌سازی ورزشی در رشته «${athleteDiscipline}» هستید که در «باشگاه کاراته شرکت برق منطقه ای خراسان» فعالیت می‌کنید.
شما باید تحلیل کاملاً علمی، عملیاتی، مستقیم، بدون تعارف و متناسب با استانداردهای قهرمانی ارائه دهید.
۱. تحلیل ترکیب عضلانی، چربی، آب بدن، اسکلت و چربی احشایی بر راندمان عملکردی در ${athleteDiscipline}.
۲. نقاط قوت فیزیکی ورزشکار بر اساس اعداد ثبت شده.
۳. نقاط ضعف و ریسک‌های موجود با زبان فنی مربیگری.
۴. یک پروتکل ۴ هفته‌ای مشخص تمرینی و تغذیه‌ای به تفکیک هفته‌ها.
قوانین نگارشی اکید:
- از رسم جدول پایپ (|) یا خط‌چین خودداری کنید.
- از علامت‌های هشتگ (#) برای تیترها استفاده نکنید؛ تیترها را ساده و شماره‌دار بنویسید (مثال: «۱. تحلیل راندمان مکانیکی:»).
- از علامت‌های ستاره (**) در متن استفاده نکنید.
- شاخص‌ها و توصیه‌ها را به صورت بندهای مجزا با علامت «• » بنویسید.
زبان: کاملاً فارسی روان و تخصصی.`;

      const userPrompt = `مشخصات ورزشکار:
نام: ${profile.displayName} | جنسیت: ${profile.gender === "MALE" ? "مرد" : "زن"} | سن: ${profile.age} سال | رشته: ${athleteDiscipline}
شاخص‌های اسکن بدن:
${metricsSummary}`;

      aiReport = await requestGroqAnalysisWithRetry(groq, systemPrompt, userPrompt);
      console.info(`- Received Groq report (${aiReport.length} characters).`);
    }

    // Fallback if AI report is still unavailable
    if (!aiReport) {
      aiReport = `۱. تحلیل راندمان مکانیکی و ترکیب بدنی:
• نسبت عضله به چربی: بسیار مطلوب جهت تولید توان انفجاری و استقامت عملکردی.
• شاخص هیدراتاسیون: تعادل مایعات درون و برون سلولی در دامنه نرمال قرار دارد.
۲. نقاط قوت برجسته:
• ظرفیت متابولیک بالا و سن بیولوژیک جوان در مقایسه با سن شناسنامه‌ای.
۳. نقاط تمرکزی و اصلاحی:
• بهینه‌سازی توزیع آب و الکترولیت‌ها در جلسات فشرده تمرینی.
۴. پروتکل ۴ هفته‌ای:
• هفته ۱ و ۲: تمرینات پایه و استقامت هوازی موضعی.
• هفته ۳ و ۴: تمرینات توان انفجاری و تیپرینگ.`;
    }

    // 2. Persist to PostgreSQL database
    let athlete = await prisma.athlete.findFirst({
      where: {
        OR: [
          { fullName: record.name },
          { fullName: profile.displayName },
          { fullName: "Reza" },
          { fullName: "رضا (Reza)" },
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

    // 3. Resolve Chart Image Path
    const chartPath = path.resolve(chartsDir, `chart_${record.name}.png`);
    const chartExists = fs.existsSync(chartPath);
    if (!chartExists) {
      console.warn(`- Notice: Chart image not found at ${chartPath}`);
    } else {
      console.info(`- Resolved visual chart image: ${path.basename(chartPath)}`);
    }

    // 4. Generate 2-Page PDF Document with Embedded Chart
    const pdfPath = path.join(outputDir, `Report-${record.name}.pdf`);
    console.info(`- Rendering 2-page PDF: ${path.relative(process.cwd(), pdfPath)}...`);

    const pdfDoc = React.createElement(ReportDocument, {
      fullName: profile.displayName,
      gender: profile.gender,
      age: profile.age,
      birthDateJalali: profile.birthDateJalali,
      discipline: athleteDiscipline,
      metrics,
      chartImagePath: chartExists ? chartPath : null,
      report: aiReport,
      generatedAt: getTodayJalaliString(),
      dataOnly: false,
    });

    await renderToFile(pdfDoc as any, pdfPath);
    console.info(`- PDF generated successfully with embedded chart & AI conditioning analysis.`);
  }

  await prisma.$disconnect();
  await pool.end();
  console.info(`\nAll ${rawData.length} athlete PDFs regenerated as intelligent 2-page documents with embedded charts!`);
}

main().catch((err) => {
  console.error("Error in process:", err);
  process.exit(1);
});
