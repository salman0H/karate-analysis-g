"use client";

import { useState, useMemo } from "react";
import type { AssessmentRecord, AthleteWithAssessments } from "@/types/athlete";
import { formatJalaliDisplay } from "@/lib/jalali";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Flame,
  Droplets,
  Dumbbell,
  HeartPulse,
} from "lucide-react";

interface AthleteProgressChartProps {
  athlete: AthleteWithAssessments;
  selectedAssessmentId?: string;
  onSelectAssessment?: (assessment: AssessmentRecord) => void;
  onRunComparativeAnalysis?: (prevAssessment: AssessmentRecord, currentAssessment: AssessmentRecord) => void;
  isAnalyzing?: boolean;
}

interface TrackedMetric {
  key: string;
  labelFa: string;
  labelEn: string;
  unit: string;
  icon: typeof Activity;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  goodDirection: "up" | "down" | "neutral";
}

const TRACKED_METRICS: TrackedMetric[] = [
  {
    key: "weight",
    labelFa: "وزن کل بدنی",
    labelEn: "Total Body Weight",
    unit: "کیلوگرم",
    icon: Scale,
    color: "#10b981", // emerald
    gradientFrom: "rgba(16, 185, 129, 0.35)",
    gradientTo: "rgba(16, 185, 129, 0.0)",
    goodDirection: "neutral",
  },
  {
    key: "muscleMass",
    labelFa: "توده عضلانی",
    labelEn: "Muscle Mass",
    unit: "کیلوگرم",
    icon: Dumbbell,
    color: "#06b6d4", // cyan
    gradientFrom: "rgba(6, 182, 212, 0.35)",
    gradientTo: "rgba(6, 182, 212, 0.0)",
    goodDirection: "up",
  },
  {
    key: "bodyFatPercentage",
    labelFa: "درصد چربی بدن",
    labelEn: "Body Fat %",
    unit: "%",
    icon: Flame,
    color: "#f59e0b", // amber
    gradientFrom: "rgba(245, 158, 11, 0.35)",
    gradientTo: "rgba(245, 158, 11, 0.0)",
    goodDirection: "down",
  },
  {
    key: "bodyWaterPercentage",
    labelFa: "درصد آب بدن",
    labelEn: "Body Water %",
    unit: "%",
    icon: Droplets,
    color: "#3b82f6", // blue
    gradientFrom: "rgba(59, 130, 246, 0.35)",
    gradientTo: "rgba(59, 130, 246, 0.0)",
    goodDirection: "up",
  },
  {
    key: "bodyScore",
    labelFa: "امتیاز سلامت کل",
    labelEn: "Overall Body Score",
    unit: "از ۱۰۰",
    icon: HeartPulse,
    color: "#8b5cf6", // purple
    gradientFrom: "rgba(139, 92, 246, 0.35)",
    gradientTo: "rgba(139, 92, 246, 0.0)",
    goodDirection: "up",
  },
  {
    key: "bmi",
    labelFa: "شاخص توده بدنی (BMI)",
    labelEn: "Body Mass Index",
    unit: "kg/m²",
    icon: Activity,
    color: "#ec4899", // pink
    gradientFrom: "rgba(236, 72, 153, 0.35)",
    gradientTo: "rgba(236, 72, 153, 0.0)",
    goodDirection: "neutral",
  },
];

export function AthleteProgressChart({
  athlete,
  selectedAssessmentId,
  onSelectAssessment,
  onRunComparativeAnalysis,
  isAnalyzing = false,
}: AthleteProgressChartProps) {
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>("muscleMass");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Sort chronological order (oldest to newest)
  const sortedAssessments = useMemo(() => {
    if (!athlete.assessments || athlete.assessments.length === 0) return [];
    return [...athlete.assessments].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );
  }, [athlete.assessments]);

  const activeMetric = useMemo(() => {
    return (
      TRACKED_METRICS.find((m) => m.key === selectedMetricKey) ??
      TRACKED_METRICS[0]
    );
  }, [selectedMetricKey]);

  // Extract time series points for active metric
  const dataPoints = useMemo(() => {
    return sortedAssessments.map((ass, index) => {
      const metrics = (ass.metrics || {}) as Record<string, unknown>;
      let val: number | null = null;
      const raw = metrics[activeMetric.key];
      if (raw !== undefined && raw !== null && raw !== "") {
        const num = Number(raw);
        if (!isNaN(num)) val = num;
      }

      return {
        id: ass.id,
        index,
        measuredAt: ass.measuredAt,
        dateDisplay: formatJalaliDisplay(ass.measuredAt),
        value: val,
        rawMetrics: metrics,
        aiReport: ass.aiReport,
      };
    });
  }, [sortedAssessments, activeMetric.key]);

  // Valid non-null points for chart calculation
  const validPoints = useMemo(() => {
    return dataPoints.filter((p) => p.value !== null) as Array<{
      id: string;
      index: number;
      measuredAt: string;
      dateDisplay: string;
      value: number;
      rawMetrics: Record<string, unknown>;
      aiReport?: string | null;
    }>;
  }, [dataPoints]);

  // Calculate delta statistics
  const stats = useMemo(() => {
    if (validPoints.length === 0) {
      return {
        firstVal: null,
        latestVal: null,
        totalDiff: null,
        totalPct: null,
        lastDiff: null,
        trend: "neutral" as const,
      };
    }

    const first = validPoints[0].value;
    const latest = validPoints[validPoints.length - 1].value;
    const totalDiff = Number((latest - first).toFixed(2));
    const totalPct = first !== 0 ? Number(((totalDiff / first) * 100).toFixed(1)) : 0;

    let lastDiff = 0;
    if (validPoints.length >= 2) {
      const prev = validPoints[validPoints.length - 2].value;
      lastDiff = Number((latest - prev).toFixed(2));
    }

    let trend: "improved" | "regressed" | "neutral" = "neutral";
    if (Math.abs(totalDiff) < 0.1) {
      trend = "neutral";
    } else if (activeMetric.goodDirection === "up") {
      trend = totalDiff > 0 ? "improved" : "regressed";
    } else if (activeMetric.goodDirection === "down") {
      trend = totalDiff < 0 ? "improved" : "regressed";
    } else {
      trend = "neutral";
    }

    return {
      firstVal: first,
      latestVal: latest,
      totalDiff,
      totalPct,
      lastDiff,
      trend,
    };
  }, [validPoints, activeMetric]);

  // Chart SVG Coordinate Mapping
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 45;
  const paddingY = 30;

  const { minVal, maxVal, coordinates, svgPath, areaPath } = useMemo(() => {
    if (validPoints.length === 0) {
      return { minVal: 0, maxVal: 100, coordinates: [], svgPath: "", areaPath: "" };
    }

    const values = validPoints.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);

    // Give margin so points don't hit the border
    if (min === max) {
      min = Math.max(0, min - 5);
      max = max + 5;
    } else {
      const span = max - min;
      min = Math.max(0, Number((min - span * 0.15).toFixed(1)));
      max = Number((max + span * 0.15).toFixed(1));
    }

    const valSpan = max - min || 1;
    const usableW = chartWidth - paddingX * 2;
    const usableH = chartHeight - paddingY * 2;

    const coords = validPoints.map((p, idx) => {
      const x =
        validPoints.length === 1
          ? chartWidth / 2
          : paddingX + (idx / (validPoints.length - 1)) * usableW;
      const normY = (p.value - min) / valSpan;
      // Invert Y because SVG 0 is top
      const y = paddingY + (1 - normY) * usableH;
      return { x, y, ...p };
    });

    // Build SVG Path with smooth lines
    let d = "";
    if (coords.length === 1) {
      d = `M ${coords[0].x} ${coords[0].y}`;
    } else {
      d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        // smooth bezier or line
        const prev = coords[i - 1];
        const curr = coords[i];
        const cpX = (prev.x + curr.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
      }
    }

    // Area closed path
    let aD = "";
    if (coords.length > 1) {
      const bottomY = chartHeight - paddingY;
      const firstX = coords[0].x;
      const lastX = coords[coords.length - 1].x;
      aD = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }

    return { minVal: min, maxVal: max, coordinates: coords, svgPath: d, areaPath: aD };
  }, [validPoints, chartHeight, chartWidth, paddingX, paddingY]);

  // Baseline and latest assessments for comparison trigger
  const canCompare = validPoints.length >= 2;
  const baselineAssessment = sortedAssessments[0];
  const latestAssessment = sortedAssessments[sortedAssessments.length - 1];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              نمودار تحلیلی و روند پیشرفت ورزشکار در طول زمان
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            پایش زمان‌مند تغییرات بیومتریک • {athlete.fullName} (تعداد جلسات پایش:{" "}
            <span className="font-bold text-emerald-400">{sortedAssessments.length} جلسه</span>)
          </p>
        </div>

        {/* Action: Trigger Comparative AI Analysis */}
        {canCompare && onRunComparativeAnalysis && (
          <button
            type="button"
            onClick={() => onRunComparativeAnalysis(baselineAssessment, latestAssessment)}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>
              {isAnalyzing
                ? "در حال تحلیل تطبیقی با هوش مصنوعی..."
                : "اجرای تحلیل مقایسه‌ای پیشرفت با Groq AI"}
            </span>
          </button>
        )}
      </div>

      {/* KPI Delta Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-[11px] text-slate-400">آخرین رکورد ثبتی</div>
          <div className="mt-1 text-lg font-black text-white">
            {stats.latestVal !== null ? `${stats.latestVal} ${activeMetric.unit}` : "ثبت نشده"}
          </div>
          <div className="text-[10px] text-slate-500">
            {validPoints.length > 0 ? validPoints[validPoints.length - 1].dateDisplay : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-[11px] text-slate-400">تغییر کل (از آزمون مبنا)</div>
          {validPoints.length <= 1 ? (
            <div>
              <div className="mt-1 text-base font-bold text-emerald-400">نقطه مبنا</div>
              <div className="text-[10px] text-slate-500">اولین خروجی ثبت‌شده</div>
            </div>
          ) : (
            <div>
              <div
                className={`mt-1 text-lg font-black flex items-center gap-1 ${
                  stats.totalDiff && stats.totalDiff > 0
                    ? stats.trend === "improved"
                      ? "text-emerald-400"
                      : "text-amber-400"
                    : stats.totalDiff && stats.totalDiff < 0
                    ? stats.trend === "improved"
                      ? "text-emerald-400"
                      : "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {stats.totalDiff !== null ? (
                  <>
                    {stats.totalDiff > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : stats.totalDiff < 0 ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    <span>
                      {stats.totalDiff > 0 ? `+${stats.totalDiff}` : stats.totalDiff}{" "}
                      {activeMetric.unit}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-[10px] text-slate-500">
                {stats.totalPct !== null ? `${stats.totalPct > 0 ? `+${stats.totalPct}` : stats.totalPct}٪ تغییر نسبی` : "—"}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-[11px] text-slate-400">تغییر نسبت به جلسه قبل</div>
          {validPoints.length <= 1 ? (
            <div>
              <div className="mt-1 text-base font-bold text-slate-300">جلسه اول</div>
              <div className="text-[10px] text-slate-500">در انتظار نوبت ۲ جهت مقایسه</div>
            </div>
          ) : (
            <div>
              <div className="mt-1 text-lg font-black text-white">
                {stats.lastDiff !== null ? (
                  <span
                    className={
                      stats.lastDiff > 0
                        ? "text-emerald-400"
                        : stats.lastDiff < 0
                        ? "text-amber-400"
                        : "text-slate-400"
                    }
                  >
                    {stats.lastDiff > 0 ? `+${stats.lastDiff}` : stats.lastDiff}{" "}
                    {activeMetric.unit}
                  </span>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-[10px] text-slate-500">در مقایسه نوبت قبل</div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="text-[11px] text-slate-400">ارزیابی وضعیت روند</div>
          {validPoints.length <= 1 ? (
            <div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-cyan-400">
                <Activity className="h-4 w-4" />
                <span>سنجش مرجع اولیه</span>
              </div>
              <div className="text-[10px] text-slate-500">خروجی ترازوی شیائومی S400</div>
            </div>
          ) : (
            <div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                {stats.trend === "improved" ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">روند صعودی و مطلوب</span>
                  </>
                ) : stats.trend === "regressed" ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                    <span className="text-rose-400">نیازمند بازنگری تمرینی</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">پایدار و تثبیت‌شده</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-500">تحلیل شاخص {activeMetric.labelFa}</div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        <span className="text-xs font-semibold text-slate-400 ml-1">شاخص جهت نمایش:</span>
        {TRACKED_METRICS.map((metric) => {
          const isSelected = metric.key === selectedMetricKey;
          const IconComponent = metric.icon;
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => setSelectedMetricKey(metric.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span>{metric.labelFa}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 space-y-3">
        {validPoints.length === 1 && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 text-xs text-slate-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              ۱
            </span>
            <span>
              این نقطه تنها خروجی واقعی ترازوی شیائومی (آزمون مبنا در تاریخ{" "}
              <strong className="text-white font-mono">{validPoints[0]?.dateDisplay}</strong>) است. با ثبت نوبت ارزیابی جدید، خط روند پیشرفت و تحلیل مقایسه‌ای خودکار فعال می‌گردد.
            </span>
          </div>
        )}
        {validPoints.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center text-slate-500 text-sm">
            <Activity className="h-8 w-8 mb-2 opacity-40 text-slate-400" />
            <span>اطلاعاتی برای شاخص {activeMetric.labelFa} در جلسات پایش ثبت نشده است.</span>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 min-w-[500px]"
            >
              <defs>
                <linearGradient id={`gradient-${activeMetric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeMetric.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={activeMetric.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="0.75"
              />
              <line
                x1={paddingX}
                y1={chartHeight / 2}
                x2={chartWidth - paddingX}
                y2={chartHeight / 2}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="0.75"
              />
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Y Axis Labels */}
              <text
                x={paddingX - 8}
                y={paddingY + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {maxVal}
              </text>
              <text
                x={paddingX - 8}
                y={chartHeight / 2 + 3}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {Number(((maxVal + minVal) / 2).toFixed(1))}
              </text>
              <text
                x={paddingX - 8}
                y={chartHeight - paddingY + 2}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {minVal}
              </text>

              {/* Area Fill */}
              {areaPath && (
                <path d={areaPath} fill={`url(#gradient-${activeMetric.key})`} />
              )}

              {/* Line Curve */}
              {svgPath && (
                <path
                  d={svgPath}
                  fill="none"
                  stroke={activeMetric.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Node Circles */}
              {coordinates.map((pt, idx) => {
                const isHovered = hoveredPointIndex === idx;
                const isSelected = selectedAssessmentId === pt.id;
                return (
                  <g key={pt.id} className="cursor-pointer">
                    {/* Pulsing ring on hover/selection */}
                    {(isHovered || isSelected) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="none"
                        stroke={activeMetric.color}
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? "6" : isHovered ? "5.5" : "4"}
                      fill="#0f172a"
                      stroke={activeMetric.color}
                      strokeWidth={isSelected ? "3" : "2"}
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                      onClick={() => onSelectAssessment && onSelectAssessment(sortedAssessments[pt.index])}
                    />

                    {/* Value Badge above node */}
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className={`text-[11px] font-bold ${
                        isHovered || isSelected ? "fill-white font-extrabold" : "fill-slate-300"
                      }`}
                    >
                      {pt.value}
                    </text>

                    {/* Date label on X-axis */}
                    <text
                      x={pt.x}
                      y={chartHeight - paddingY + 16}
                      textAnchor="middle"
                      className="fill-slate-400 text-[9.5px] font-sans"
                    >
                      {pt.dateDisplay}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover info panel */}
        {hoveredPointIndex !== null && validPoints[hoveredPointIndex] && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300">
                تاریخ جلسه {hoveredPointIndex + 1}:{" "}
                <strong className="text-white">
                  {validPoints[hoveredPointIndex].dateDisplay}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{activeMetric.labelFa}:</span>
              <strong className="text-emerald-400 text-sm">
                {validPoints[hoveredPointIndex].value} {activeMetric.unit}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Historical Assessment Session Timeline Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            جلسات ارزیابی ثبت‌شده در تاریخچه ({sortedAssessments.length} جلسه):
          </span>
          <span className="text-[11px] text-slate-500">
            روی هر جلسه کلیک کنید تا جزئیات تله‌متری آن بارگذاری شود
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {sortedAssessments.map((ass, idx) => {
            const isSelected = selectedAssessmentId === ass.id;
            const m = (ass.metrics || {}) as Record<string, unknown>;
            const w = m.weight ? `${m.weight} kg` : "—";
            const fat = m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : "—";
            const muscle = m.muscleMass ? `${m.muscleMass} kg` : "—";
            const isLatest = idx === sortedAssessments.length - 1;
            const isFirst = idx === 0;

            return (
              <div
                key={ass.id}
                onClick={() => onSelectAssessment && onSelectAssessment(ass)}
                className={`relative rounded-xl border p-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/50"
                    : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      جلسه {idx + 1}
                    </span>
                    {isFirst && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">
                        مبنا
                      </span>
                    )}
                    {isLatest && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                        آخرین آزمون
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatJalaliDisplay(ass.measuredAt)}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-1 text-[11px] border-t border-slate-800/60 pt-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">وزن</span>
                    <span className="font-semibold text-slate-200">{w}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">عضله</span>
                    <span className="font-semibold text-cyan-300">{muscle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">چربی</span>
                    <span className="font-semibold text-amber-300">{fat}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
