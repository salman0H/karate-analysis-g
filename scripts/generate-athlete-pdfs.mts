import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface AthleteRecord {
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

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(process.cwd(), "generated-reports");
const baseUrl = (process.env.PDF_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

function toMetrics(record: AthleteRecord): Record<string, number | null> {
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

async function main(): Promise<void> {
  const recordsPath = path.join(scriptDirectory, "athlete-import-data.json");
  const records = JSON.parse(await readFile(recordsPath, "utf8")) as AthleteRecord[];
  await mkdir(outputDirectory, { recursive: true });

  const failures: string[] = [];

  for (const record of records) {
    const safeName = record.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputPath = path.join(outputDirectory, `Report-${safeName}.pdf`);

    try {
      const metrics = toMetrics(record);
      const analysisResponse = await fetch(`${baseUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: record.name,
          gender: null,
          age: null,
          birthDateJalali: null,
          measuredAt: record.measuredAt,
          metrics,
          requireGroq: true,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(
          `Groq analysis returned ${analysisResponse.status}: ${await analysisResponse.text()}`
        );
      }

      const analysis = (await analysisResponse.json()) as {
        report?: string;
        source?: string;
      };
      if (!analysis.report || analysis.source !== "groq-llama-3") {
        throw new Error("Analysis endpoint did not return a Groq-generated report.");
      }

      const pdfResponse = await fetch(`${baseUrl}/api/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: record.name,
          gender: null,
          age: null,
          birthDateJalali: null,
          metrics,
          report: analysis.report,
          dataOnly: false,
        }),
      });
      if (!pdfResponse.ok) {
        throw new Error(`PDF API returned ${pdfResponse.status}: ${await pdfResponse.text()}`);
      }

      await writeFile(outputPath, new Uint8Array(await pdfResponse.arrayBuffer()));
      console.info(`Generated ${path.relative(process.cwd(), outputPath)}`);
    } catch (error) {
      failures.push(record.name);
      console.error(`Failed to generate PDF for ${record.name}:`, error);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `PDF generation failed for: ${failures.join(", ")}. Ensure Next.js is running at ${baseUrl} and GROQ_API_KEY is configured.`
    );
  }

  console.info(`Generated ${records.length} athlete PDFs in ${outputDirectory}`);
}

main().catch((error: unknown) => {
  console.error("Athlete PDF generation failed:", error);
  process.exitCode = 1;
});
