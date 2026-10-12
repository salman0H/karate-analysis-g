import { z } from "zod";
import { METRICS_CONFIG } from "@/config/metrics.config";

// Dynamic metrics schema validated against METRICS_CONFIG
export const metricsSchema = z
  .record(z.string(), z.union([z.number(), z.string()]))
  .superRefine((data, ctx) => {
    for (const metric of METRICS_CONFIG) {
      const val = data[metric.key];
      if (metric.isText) {
        if (typeof val !== "string" || !val.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [metric.key],
            message: `انتخاب ${metric.labelFa} الزامی است`,
          });
        }
        continue;
      }

      if (typeof val !== "number" || Number.isNaN(val)) {
        ctx.addIssue({
          code: "custom",
          path: [metric.key],
          message: `مقدار عددی معتبر برای ${metric.labelFa} وارد کنید`,
        });
        continue;
      }

      if (metric.min !== undefined && val < metric.min) {
        ctx.addIssue({
          code: "custom",
          path: [metric.key],
          message: `حداقل مقدار مجاز ${metric.min} ${metric.unit}`,
        });
      }

      if (metric.max !== undefined && val > metric.max) {
        ctx.addIssue({
          code: "custom",
          path: [metric.key],
          message: `حداکثر مقدار مجاز ${metric.max} ${metric.unit}`,
        });
      }
    }
  });

export const athleteFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ حرف باشد")
    .max(80, "نام بیش از حد طولانی است"),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "لطفاً جنسیت را انتخاب کنید",
  }),
  birthDateJalali: z
    .string()
    .regex(/^\d{4}\/\d{1,2}\/\d{1,2}$/, "فرمت معتبر تاریخ شمسی: مثلاً ۱۳۸۲/۰۵/۱۴"),
  selfieDataUrl: z.string().nullable().optional(),
  metrics: metricsSchema,
});

export type AthleteFormValues = z.infer<typeof athleteFormSchema>;
export type MetricsValues = Record<string, number | string>;

export interface AnalyzeRequestPayload {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  birthDateJalali: string;
  metrics: Record<string, number | string>;
  clubName?: string;
}

export interface AnalyzeResponsePayload {
  report: string;
  summary: {
    bmiCategory: string;
    bodyFatCategory: string;
    kumiteReadiness: number; // 0 - 100
    kataStability: number;   // 0 - 100
    recoveryScore: number;   // 0 - 100
  };
  generatedAt: string;
}
