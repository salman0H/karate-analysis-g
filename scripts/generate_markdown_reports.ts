import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnvConfig(process.cwd());

import { METRICS_CONFIG } from "../src/config/metrics.config";
import { parseMarkdownToReportBlocks } from "../src/lib/markdown-cleaner";
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

const ATHLETE_PROFILES: Record<string, { nameFa: string; nameEn: string; displayName: string; gender: "MALE" | "FEMALE"; age: number; birthDateJalali: string }> = {
  Oghbaee: { nameFa: "عقبایی", nameEn: "Oghbaee", displayName: "عقبایی (Oghbaee)", gender: "MALE", age: 63, birthDateJalali: "1342/01/01" },
  Reza: { nameFa: "عقبایی", nameEn: "Oghbaee", displayName: "عقبایی (Oghbaee)", gender: "MALE", age: 63, birthDateJalali: "1342/01/01" },
  Maleki: { nameFa: "ملکی", nameEn: "Maleki", displayName: "ملکی (Maleki)", gender: "MALE", age: 55, birthDateJalali: "1350/01/01" },
  Adrian: { nameFa: "آدریان", nameEn: "Adrian", displayName: "آدریان (Adrian)", gender: "MALE", age: 10, birthDateJalali: "1395/01/01" },
  Arsam: { nameFa: "آرسام", nameEn: "Arsam", displayName: "آرسام (Arsam)", gender: "MALE", age: 10, birthDateJalali: "1395/01/01" },
  Amirali: { nameFa: "امیرعلی", nameEn: "Amirali", displayName: "امیرعلی (Amirali)", gender: "MALE", age: 15, birthDateJalali: "1390/01/01" },
  Yousef: { nameFa: "یوسف", nameEn: "Yousef", displayName: "یوسف (Yousef)", gender: "MALE", age: 14, birthDateJalali: "1391/01/01" },
  Mahyar: { nameFa: "مهیار", nameEn: "Mahyar", displayName: "مهیار (Mahyar)", gender: "MALE", age: 15, birthDateJalali: "1390/01/01" },
  Homayon: { nameFa: "همایون", nameEn: "Homayon", displayName: "همایون (Homayon)", gender: "MALE", age: 10, birthDateJalali: "1395/01/01" },
  Amin: { nameFa: "امین", nameEn: "Amin", displayName: "امین (Amin)", gender: "MALE", age: 15, birthDateJalali: "1390/01/01" },
  Alireza: { nameFa: "علیرضا", nameEn: "Alireza", displayName: "علیرضا (Alireza)", gender: "MALE", age: 16, birthDateJalali: "1389/01/01" },
  Ghafari: { nameFa: "غفاری", nameEn: "Ghafari", displayName: "غفاری (Ghafari)", gender: "MALE", age: 40, birthDateJalali: "1365/01/01" },
};

function formatPersianDigits(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "-";
  return String(n);
}

function getMetricValue(record: RawRecord, key: string): any {
  if (key === "visceralFatRate") return record.visceralFatRating;
  if (key === "bmr") return record.basalMetabolicRate;
  if (key === "estimatedWaistHipRatio") return record.waistToHipRatio;
  if (key === "leanBodyMass") return record.fatFreeBodyWeight;
  return (record as any)[key];
}

function buildAthleteMarkdown(
  record: RawRecord,
  aiReport: string,
  profile: (typeof ATHLETE_PROFILES)[string]
): string {
  const chartRelativePath = `../charts/chart_${record.name}.png`;
  const reportBlocks = parseMarkdownToReportBlocks(aiReport);

  // Group metrics by categories
  const generalKeys = ["weight", "bmi", "bodyScore", "heartRate", "bodyAge", "estimatedWaistHipRatio"];
  const compositionKeys = ["muscleMass", "musclePercentage", "skeletalMuscleMass", "fatMass", "bodyFatPercentage", "visceralFatRate", "leanBodyMass", "proteinMass", "proteinPercentage"];
  const hydrationBoneKeys = ["bodyWaterMass", "bodyWaterPercentage", "boneMineralContent", "boneMineralPercentage"];
  const metabolicKeys = ["bmr"];

  const buildCategoryRows = (keys: string[]) => {
    return keys
      .map((k) => {
        const def = METRICS_CONFIG.find((m) => m.key === k);
        if (!def) return null;
        const val = getMetricValue(record, k) ?? "-";
        return `| **${def.labelFa}** (${def.nameEn}) | \`${val} ${def.unit}\` | ${def.karateContext ?? "شاخص عمومی"} |`;
      })
      .filter(Boolean)
      .join("\n");
  };

  const formattedBlocksMd = reportBlocks
    .map((b) => {
      if (b.type === "heading") {
        return `\n#### 📌 ${b.text}\n`;
      }
      if (b.type === "bullet") {
        return `- ${b.text.replace(/^[•\-*]\s*/, "")}`;
      }
      return `\n${b.text}\n`;
    })
    .join("\n");

  return `<div dir="rtl" style="text-align: right; font-family: Vazirmatn, Tahoma, 'IRANSans', sans-serif; line-height: 1.8;">

# 🥋 شناسنامه تحلیلی ترکیب بدنی و فیزیولوژی کاراته
### باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان (KREC)
**سامانه پایش هوشمند تله‌متری Xiaomi S400 • هوش مصنوعی تحلیلی Groq**

---

> [!NOTE]
> **اساتید تیم و کادر فنی:** شیهان کریمی و شیهان غفاری (اساتید تیم کاراته شرکت برق منطقه‌ای خراسان)  
> **کد پرونده ورزشی:** \`KBAS-1405-${record.name.toUpperCase()}\` • **تاریخ صدور:** ${getTodayJalaliString()}

---

## 👤 مشخصات ورزشکار
| مشخصه | مقدار ثبت شده |
|:---|:---|
| **نام و نام خانوادگی** | **${profile.displayName}** |
| **جنسیت** | ${profile.gender === "MALE" ? "مرد (بخش آقایان)" : "زن (بخش بانوان)"} |
| **سن شناسنامه‌ای / تقویمی** | **${profile.age} سال** (متولد ${profile.birthDateJalali}) |
| **سن بیولوژیکی دستگاه** | **${record.bodyAge} سال** |
| **زمان اندازه‌گیری تله‌متری** | \`${record.measuredAt}\` |
| **مدل سخت‌افزار آنالیزور** | Xiaomi S400 Dual-Frequency BIA |

---

## 📊 داشبورد تصویری بیومتریک و رادار ۶ فاکتور کاراته
این نمودار به صورت خودکار توسط موتور پایتون بر اساس داده‌های بیومتریک دستگاه شیائومی و استانداردهای فدراسیون جهانی کاراته (WKF) تولید شده است:

![داشبورد تحلیلی و رادار ۶ فاکتور کاراته](${chartRelativePath})

---

## 📋 جدول تفکیکی شاخص‌های بدنی (Xiaomi S400 Telemetry)

### ۱. ساختار عمومی و فیزیکی
| شاخص | مقدار اندازه‌گیری شده | کاربرد در آمادگی کاراته |
|:---|:---|:---|
${buildCategoryRows(generalKeys)}

### ۲. ترکیب بافتی، توده‌های عضلانی و چربی
| شاخص | مقدار اندازه‌گیری شده | کاربرد در آمادگی کاراته |
|:---|:---|:---|
${buildCategoryRows(compositionKeys)}

### ۳. هیدراتاسیون و استحکام اسکلتی
| شاخص | مقدار اندازه‌گیری شده | کاربرد در آمادگی کاراته |
|:---|:---|:---|
${buildCategoryRows(hydrationBoneKeys)}

### ۴. متابولیسم و راندمان زیستی
| شاخص | مقدار اندازه‌گیری شده | کاربرد در آمادگی کاراته |
|:---|:---|:---|
${buildCategoryRows(metabolicKeys)}

---

## 🧠 تحلیل تخصصی مربی ارشد و کارشناس فیزیولوژی کاراته
> [!IMPORTANT]
> تحلیل زیر توسط مدل هوش مصنوعی Groq با استاندارد مربیگری درجه ۱ کاراته کومیته و کاتا تهیه شده است:

${formattedBlocksMd}

---

> [!TIP]
> **توصیه اجرایی:** کلیه فاکتورهای فوق باید مبنای تنظیم تغذیه ورزشی و طراحی سیکل‌های تمرینی درون‌فصلی قرار گیرند. برای اجرای تغییرات در وزن دسته مسابقاتی، حتماً با سرمربی تیم هماهنگ شود.

---
<sub>باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان • واحد سنجش و ارتقای عملکرد قهرمانی</sub>
</div>
`;
}

function buildIndexMarkdown(records: RawRecord[]): string {
  const rows = records
    .map((r, idx) => {
      const p = ATHLETE_PROFILES[r.name] ?? { nameFa: r.name, age: r.bodyAge, birthDateJalali: "-" };
      const reportLink = `./Report-${r.name}.md`;
      const pdfLink = `../Report-${r.name}.pdf`;
      const chartThumb = `../charts/chart_${r.name}.png`;
      return `| ${idx + 1} | [**${p.nameFa} (${r.name})**](${reportLink}) | ${p.age} سال | ${r.weight} kg | ${r.bodyFatPercentage}% | ${r.musclePercentage}% | [📄 مشاهده مارک‌داون](${reportLink}) • [📥 دانلود PDF](${pdfLink}) |`;
    })
    .join("\n");

  return `<div dir="rtl" style="text-align: right; font-family: Vazirmatn, Tahoma, sans-serif; line-height: 1.8;">

# 🥋 پایگاه داده و گزارش‌های تحلیلی بیومتریک ورزشکاران کاراته
### باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان (KREC)
**سامانه پایش هوشمند ترکیب بدنی • تحلیل فیزیولوژی و صدور شناسنامه ورزشی**

---

> [!NOTE]
> تمامی ۱۱ گزارش به صورت کاملاً **راست‌چین (RTL)** همراه با نمودارهای بصری تولیدشده توسط اسکریپت‌های پایتون و تحلیل‌های مربیگری Groq تدوین شده‌اند و آماده اجرا بر روی سرور یا مشاهده در هر بستر نمایش مارک‌داون می‌باشند.

---

## 📑 فهرست شناسنامه‌های تحلیلی ورزشکاران

| ردیف | نام ورزشکار | سن | وزن | درصد چربی | درصد عضله | دسترسی به گزارش‌ها |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
${rows}

---

## 🛠️ دستورات خط فرمان سرور (Server CLI Architecture)
برای اجرای مجدد پردازش‌ها بر روی سرور، دستورات زیر در مخزن پیکربندی شده‌اند:

\`\`\`bash
# ۱. تولید نمودارهای پایتون برای تمامی ورزشکاران (Headless / Agg):
npm run generate:charts
# یا مستقیماً با پایتون:
python3 scripts/generate_charts.py

# ۲. تولید گزارش‌های مارک‌داون راست‌چین:
npm run generate:markdown

# ۳. اجرای چرخه کامل (پایگاه‌داده + تحلیل گراک + نمودار پایتون + PDF + مارک‌داون):
npm run process:all
\`\`\`

---
<sub>باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان • واحد سنجش و ارتقای عملکرد قهرمانی</sub>
</div>
`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }
  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const dataFilePath = path.resolve(process.cwd(), "scripts/athlete-import-data.json");
  const rawData = JSON.parse(await readFile(dataFilePath, "utf8")) as RawRecord[];
  const mdOutputDir = path.resolve(process.cwd(), "generated-reports", "markdown");

  await mkdir(mdOutputDir, { recursive: true });

  console.info(`Generating RTL Markdown reports for ${rawData.length} athletes...`);

  // Fetch AI reports from DB
  const athletesFromDb = await prisma.athlete.findMany({
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  for (const record of rawData) {
    const profile = ATHLETE_PROFILES[record.name] ?? {
      nameFa: record.name,
      nameEn: record.name,
      displayName: record.name,
      gender: "MALE" as const,
      age: record.bodyAge ?? 20,
      birthDateJalali: "1380/01/01",
    };

    const dbAthlete = athletesFromDb.find(
      (a) => a.fullName === record.name || a.fullName === profile.displayName
    );
    const aiReport = dbAthlete?.assessments[0]?.aiReport ?? "تحلیل مربی در دسترس نیست.";

    const mdContent = buildAthleteMarkdown(record, aiReport, profile);
    const mdPath = path.join(mdOutputDir, `Report-${record.name}.md`);

    await writeFile(mdPath, mdContent, "utf8");
    console.info(`- Generated Markdown: ${path.relative(process.cwd(), mdPath)}`);
  }

  // Generate Index / README.md
  const indexMdContent = buildIndexMarkdown(rawData);
  const indexPath = path.join(mdOutputDir, "README.md");
  await writeFile(indexPath, indexMdContent, "utf8");
  console.info(`- Generated Index: ${path.relative(process.cwd(), indexPath)}`);

  await prisma.$disconnect();
  await pool.end();

  console.info(`\nAll Markdown reports with embedded charts and RTL alignment successfully created in ${mdOutputDir}`);
}

main().catch((err) => {
  console.error("Error generating markdown reports:", err);
  process.exit(1);
});
