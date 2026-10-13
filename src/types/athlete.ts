import { z } from "zod";
import { METRICS_CONFIG } from "@/config/metrics.config";

// Dynamic metrics schema validated against METRICS_CONFIG and enabled toggles
export const athleteFormSchema = z
  .object({
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
    metrics: z.record(
      z.string(),
      z.union([z.number(), z.string(), z.null(), z.undefined()])
    ),
    enabledMetrics: z.record(z.string(), z.boolean()).optional(),
  })
  .superRefine((data, ctx) => {
    const enabledMap = data.enabledMetrics ?? {};
    for (const metric of METRICS_CONFIG) {
      // If factor is explicitly disabled (false), skip validation completely
      const isEnabled = enabledMap[metric.key] !== false;
      if (!isEnabled) {
        continue;
      }

      const val = data.metrics[metric.key];
      if (val === undefined || val === null || val === "") {
        ctx.addIssue({
          code: "custom",
          path: ["metrics", metric.key],
          message: `مقدار ${metric.labelFa} را وارد کنید یا آن را در حالت «عدم اعمال» قرار دهید`,
        });
        continue;
      }

      if (metric.isText) {
        if (typeof val !== "string" || !val.trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["metrics", metric.key],
            message: `انتخاب ${metric.labelFa} الزامی است`,
          });
        }
        continue;
      }

      const numVal = typeof val === "number" ? val : parseFloat(String(val));
      if (Number.isNaN(numVal)) {
        ctx.addIssue({
          code: "custom",
          path: ["metrics", metric.key],
          message: `مقدار عددی معتبر برای ${metric.labelFa} وارد کنید`,
        });
        continue;
      }

      if (metric.min !== undefined && numVal < metric.min) {
        ctx.addIssue({
          code: "custom",
          path: ["metrics", metric.key],
          message: `حداقل مقدار مجاز ${metric.min} ${metric.unit}`,
        });
      }

      if (metric.max !== undefined && numVal > metric.max) {
        ctx.addIssue({
          code: "custom",
          path: ["metrics", metric.key],
          message: `حداکثر مقدار مجاز ${metric.max} ${metric.unit}`,
        });
      }
    }
  });

export const metricsSchema = z.record(
  z.string(),
  z.union([z.number(), z.string(), z.null(), z.undefined()])
);

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
