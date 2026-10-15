import { z } from "zod";
import { METRICS_CONFIG } from "@/config/metrics.config";

export type SportDiscipline =
  | "karate"
  | "fitness"
  | "bodybuilding"
  | "football"
  | "combat"
  | "swimming"
  | "running";

export interface SportDisciplineOption {
  value: SportDiscipline;
  labelFa: string;
  labelEn: string;
  coachTitleFa: string;
  badgeFa: string;
}

export const SPORT_DISCIPLINES: SportDisciplineOption[] = [
  {
    value: "karate",
    labelFa: "کاراته قهرمانی (WKF)",
    labelEn: "Karate (WKF)",
    coachTitleFa: "مربی ارشد آماده‌سازی جسمانی کاراته",
    badgeFa: "تأییدیه هوشمند کومیته",
  },
  {
    value: "fitness",
    labelFa: "آمادگی جسمانی عمومی و فیتنس",
    labelEn: "Physical Fitness & Conditioning",
    coachTitleFa: "متخصص فیزیولوژی ورزشی و آمادگی جسمانی",
    badgeFa: "تأییدیه آمادگی جسمانی",
  },
  {
    value: "bodybuilding",
    labelFa: "بدنسازی و هایپرتروفی",
    labelEn: "Bodybuilding & Hypertrophy",
    coachTitleFa: "مربی ارشد بدنسازی و پرورش اندام",
    badgeFa: "تأییدیه هایپرتروفی عضلانی",
  },
  {
    value: "football",
    labelFa: "فوتبال",
    labelEn: "Football / Soccer",
    coachTitleFa: "مربی توان‌بخشی و بدنسازی فوتبال",
    badgeFa: "تأییدیه عملکرد فوتبال",
  },
  {
    value: "combat",
    labelFa: "ورزش‌های رزمی ترکیبی (MMA / بوکس)",
    labelEn: "Combat Sports & Boxing",
    coachTitleFa: "مربی ارشد آماده‌سازی ورزش‌های رزمی",
    badgeFa: "تأییدیه توان رزمی",
  },
  {
    value: "swimming",
    labelFa: "شنا و ورزش‌های آبی",
    labelEn: "Swimming & Aquatic Sports",
    coachTitleFa: "کارشناس فیزیولوژی و عملکرد شنا",
    badgeFa: "تأییدیه شناوری و استقامت",
  },
  {
    value: "running",
    labelFa: "دوومیدانی و استقامت",
    labelEn: "Athletics & Endurance Running",
    coachTitleFa: "مربی ارشد دوومیدانی و تمرینات استقامتی",
    badgeFa: "تأییدیه استقامت هوازی",
  },
];

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
    discipline: z.enum([
      "karate",
      "fitness",
      "bodybuilding",
      "football",
      "combat",
      "swimming",
      "running",
    ]),
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
  discipline?: SportDiscipline;
  metrics: Record<string, number | string>;
  clubName?: string;
  measuredAt?: string;
  requireGroq?: boolean;
  previousAssessment?: {
    measuredAt: string;
    metrics: Record<string, number | string>;
  };
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


export interface AssessmentRecord {
  id: string;
  athleteId: string;
  metrics: Record<string, number | string>;
  aiReport?: string | null;
  selfieUrl?: string | null;
  deviceModel?: string;
  measuredAt: string;
  createdAt?: string;
}

export interface AthleteWithAssessments {
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE";
  birthDateJalali: string;
  age: number;
  selfieUrl?: string | null;
  assessments: AssessmentRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MetricDeltaInfo {
  key: string;
  labelFa: string;
  unit: string;
  oldVal: number | null;
  newVal: number | null;
  diff: number | null;
  pctChange: number | null;
  trend: "improved" | "regressed" | "neutral" | "unmeasured";
  isGoodImprovement: boolean;
}

export interface ComparativeAssessmentData {
  athleteName: string;
  previousMeasuredAt: string;
  currentMeasuredAt: string;
  deltas: Record<string, MetricDeltaInfo>;
}
