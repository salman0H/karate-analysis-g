import { z } from "zod";

export const KpiMetricSchema = z.object({
  id: z.string(),
  titleFa: z.string(),
  titleEn: z.string(),
  value: z.number(),
  unit: z.string(),
  changePercent: z.number(),
  trend: z.enum(["up", "down", "neutral"]),
  isPositiveImprovement: z.boolean(),
  sparkline: z.array(z.number()),
  status: z.enum(["optimal", "warning", "critical"]),
  target: z.number().optional(),
  descriptionFa: z.string().optional(),
});

export type KpiMetricDTO = z.infer<typeof KpiMetricSchema>;

export const TimeSeriesPointSchema = z.object({
  timestamp: z.string(),
  dateJalali: z.string(),
  kumiteScore: z.number(),
  kataScore: z.number(),
  muscleMassKg: z.number(),
  bodyFatPct: z.number(),
});

export type TimeSeriesPointDTO = z.infer<typeof TimeSeriesPointSchema>;

export const TelemetryStatusSchema = z.object({
  s400Connected: z.boolean(),
  s400BatteryPct: z.number(),
  groqLatencyMs: z.number(),
  dbStatus: z.enum(["healthy", "degraded", "down"]),
  totalAssessmentsRecorded: z.number(),
  lastSyncTimestamp: z.string(),
});

export type TelemetryStatusDTO = z.infer<typeof TelemetryStatusSchema>;
