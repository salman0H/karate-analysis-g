import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Gender, Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import records from "./athlete-import-data.json";

type ImportRecord = (typeof records)[number];

type AthleteProfile = {
  gender: Gender;
  birthDateJalali: string;
  age: number;
};

const athleteProfiles: Record<string, AthleteProfile> = {
  Oghbaee: { gender: "MALE", birthDateJalali: "1342/01/01", age: 63 },
  Reza: { gender: "MALE", birthDateJalali: "1342/01/01", age: 63 },
  Maleki: { gender: "MALE", birthDateJalali: "1350/01/01", age: 55 },
  Adrian: { gender: "MALE", birthDateJalali: "1395/01/01", age: 10 },
  Arsam: { gender: "MALE", birthDateJalali: "1395/01/01", age: 10 },
  Amirali: { gender: "MALE", birthDateJalali: "1390/01/01", age: 15 },
  Yousef: { gender: "MALE", birthDateJalali: "1391/01/01", age: 14 },
  Mahyar: { gender: "MALE", birthDateJalali: "1390/01/01", age: 15 },
  Homayon: { gender: "MALE", birthDateJalali: "1395/01/01", age: 10 },
  Amin: { gender: "MALE", birthDateJalali: "1390/01/01", age: 15 },
  Alireza: { gender: "MALE", birthDateJalali: "1389/01/01", age: 16 },
  Ghafari: { gender: "MALE", birthDateJalali: "1365/01/01", age: 40 },
};

function requireProfile(name: ImportRecord["name"]): AthleteProfile {
  const profile = athleteProfiles[name];
  if (!profile) {
    throw new Error(
      `Missing verified profile for "${name}". Add gender, birthDateJalali, and age to athleteProfiles in scripts/import-data.ts.`
    );
  }
  return profile;
}

function toMetrics(record: ImportRecord): Prisma.InputJsonObject {
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
  };
}

function validateRecords(): void {
  const errors: string[] = [];
  const seenNames = new Set<string>();

  for (const record of records) {
    if (seenNames.has(record.name)) {
      errors.push(`Duplicate athlete name in import data: "${record.name}".`);
    }
    seenNames.add(record.name);

    if (Number.isNaN(Date.parse(record.measuredAt))) {
      errors.push(`Invalid measuredAt for "${record.name}": "${record.measuredAt}".`);
    }

    const profile = athleteProfiles[record.name];
    if (
      !profile ||
      !profile.birthDateJalali.trim() ||
      !Number.isInteger(profile.age) ||
      profile.age < 0
    ) {
      errors.push(
        `Missing or invalid profile for "${record.name}" (gender, birthDateJalali, and non-negative integer age are required).`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Import data validation failed:\n- ${errors.join("\n- ")}`);
  }
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  validateRecords();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or provide it in the process environment."
    );
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    await prisma.$connect();

    let created = 0;
    let updated = 0;

    for (const record of records) {
      const profile = requireProfile(record.name);
      const measuredAt = new Date(record.measuredAt);

      const result = await prisma.$transaction(async (transaction) => {
        const matchingAthletes = await transaction.athlete.findMany({
          where: { fullName: record.name },
          select: { id: true },
          take: 2,
        });

        if (matchingAthletes.length > 1) {
          throw new Error(
            `More than one athlete has the name "${record.name}". Resolve duplicates before importing.`
          );
        }

        const athlete =
          matchingAthletes[0] ??
          (await transaction.athlete.create({
            data: {
              fullName: record.name,
              ...profile,
            },
            select: { id: true },
          }));

        const existingAssessment = await transaction.assessment.findFirst({
          where: {
            athleteId: athlete.id,
            measuredAt,
          },
          select: { id: true },
        });

        if (existingAssessment) {
          await transaction.assessment.update({
            where: { id: existingAssessment.id },
            data: { metrics: toMetrics(record) },
          });
          return "updated" as const;
        }

        await transaction.assessment.create({
          data: {
            athleteId: athlete.id,
            measuredAt,
            metrics: toMetrics(record),
            deviceModel: "Xiaomi S400",
          },
        });
        return "created" as const;
      });

      if (result === "created") {
        created += 1;
      } else {
        updated += 1;
      }

      console.info(`[${result}] ${record.name} — ${record.measuredAt}`);
    }

    console.info(
      `Import complete: ${records.length} records processed (${created} created, ${updated} updated).`
    );
  } finally {
    try {
      await prisma.$disconnect();
    } finally {
      await pool.end();
    }
  }
}

main().catch((error: unknown) => {
  console.error("Data import failed:", error);
  process.exitCode = 1;
});
