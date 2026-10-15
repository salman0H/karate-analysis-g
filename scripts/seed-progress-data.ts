import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.$connect();
  const athletes = await prisma.athlete.findMany({
    include: { assessments: { orderBy: { measuredAt: "asc" } } },
  });

  console.log(`Found ${athletes.length} athletes. Checking assessment history...`);

  for (const athlete of athletes) {
    if (athlete.assessments.length === 0) continue;

    const baseAss = athlete.assessments[0];
    const baseMetrics = (baseAss.metrics || {}) as Record<string, number>;
    const baseDate = new Date(baseAss.measuredAt);

    // If athlete only has 1 assessment, add 2 historical/progression assessments
    if (athlete.assessments.length === 1) {
      // 1. Baseline Assessment (6 weeks ago)
      const date1 = new Date(baseDate.getTime() - 42 * 24 * 60 * 60 * 1000);
      const metrics1 = {
        ...baseMetrics,
        weight: Number(((baseMetrics.weight || 70) + 1.8).toFixed(1)),
        bodyFatPercentage: Number(((baseMetrics.bodyFatPercentage || 18) + 2.4).toFixed(1)),
        muscleMass: Number(((baseMetrics.muscleMass || 50) - 1.2).toFixed(1)),
        bodyWaterPercentage: Number(((baseMetrics.bodyWaterPercentage || 58) - 2.1).toFixed(1)),
        bodyScore: Math.max(60, (baseMetrics.bodyScore || 78) - 6),
        visceralFatRate: (baseMetrics.visceralFatRate || 6) + 1,
      };

      // 2. Midterm Assessment (3 weeks ago)
      const date2 = new Date(baseDate.getTime() - 21 * 24 * 60 * 60 * 1000);
      const metrics2 = {
        ...baseMetrics,
        weight: Number(((baseMetrics.weight || 70) + 0.8).toFixed(1)),
        bodyFatPercentage: Number(((baseMetrics.bodyFatPercentage || 18) + 1.1).toFixed(1)),
        muscleMass: Number(((baseMetrics.muscleMass || 50) - 0.5).toFixed(1)),
        bodyWaterPercentage: Number(((baseMetrics.bodyWaterPercentage || 58) - 0.8).toFixed(1)),
        bodyScore: Math.max(65, (baseMetrics.bodyScore || 78) - 2),
      };

      await prisma.assessment.createMany({
        data: [
          {
            athleteId: athlete.id,
            measuredAt: date1,
            metrics: metrics1,
            deviceModel: "Xiaomi S400",
            aiReport: `گزارش ارزیابی دوره پایه (۶ هفته قبل) برای ${athlete.fullName}. تمرکز اولیه بر کاهش بافت چربی و افزایش استقامت عمومی داچی‌ها.`,
          },
          {
            athleteId: athlete.id,
            measuredAt: date2,
            metrics: metrics2,
            deviceModel: "Xiaomi S400",
            aiReport: `گزارش ارزیابی میان‌دوره (۳ هفته قبل) برای ${athlete.fullName}. شروع سازگاری عضلانی و بهبود نسبت توان به وزن.`,
          },
        ],
      });

      console.log(`+ Added 2 historical progression sessions for: ${athlete.fullName}`);
    }
  }

  const updatedAthletes = await prisma.athlete.findMany({
    include: { assessments: true },
  });
  console.log(`Complete! Total athletes: ${updatedAthletes.length}, total assessments: ${updatedAthletes.reduce((sum, a) => sum + a.assessments.length, 0)}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
