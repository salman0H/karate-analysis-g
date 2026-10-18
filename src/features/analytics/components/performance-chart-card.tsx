"use client";

import React, { useState, useMemo } from "react";
import { LineChart, Activity, Zap, Shield, Flame, Droplets } from "lucide-react";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";
import { WidgetErrorBoundary } from "@/core/error/error-boundary";
import { Skeleton } from "@/shared/components/skeleton";

type MetricSeries = "kumite" | "kata" | "muscle" | "fat";

interface MetricSeriesOption {
  key: MetricSeries;
  labelFa: string;
  labelEn: string;
  unit: string;
  color: string;
  gradientId: string;
}

const SERIES_CONFIG: MetricSeriesOption[] = [
  {
    key: "kumite",
    labelFa: "شاخص توان انفجاری کومیته (WKF)",
    labelEn: "Kumite Explosiveness",
    unit: "٪",
    color: "#10b981",
    gradientId: "gradKumite",
  },
  {
    key: "kata",
    labelFa: "شاخص تعادل و پایداری کاتا",
    labelEn: "Kata Stability Index",
    unit: "٪",
    color: "#06b6d4",
    gradientId: "gradKata",
  },
  {
    key: "muscle",
    labelFa: "توده عضلانی اسکلتی",
    labelEn: "Skeletal Muscle Mass",
    unit: "kg",
    color: "#8b5cf6",
    gradientId: "gradMuscle",
  },
  {
    key: "fat",
    labelFa: "درصد چربی کل بدن",
    labelEn: "Body Fat Percentage",
    unit: "٪",
    color: "#f59e0b",
    gradientId: "gradFat",
  },
];

export function PerformanceChartCard() {
  const { timeSeriesData, isLoading } = useKpiMetrics();
  const [activeSeries, setActiveSeries] = useState<MetricSeries>("kumite");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const currentConfig = SERIES_CONFIG.find((s) => s.key === activeSeries)!;

  // Extract values for active series
  const points = useMemo(() => {
    return timeSeriesData.map((d) => {
      let val = d.kumiteScore;
      if (activeSeries === "kata") val = d.kataScore;
      if (activeSeries === "muscle") val = d.muscleMassKg;
      if (activeSeries === "fat") val = d.bodyFatPct;
      return {
        date: d.dateJalali,
        value: val,
      };
    });
  }, [timeSeriesData, activeSeries]);

  const minVal = useMemo(
    () => Math.min(...points.map((p) => p.value)) * 0.95,
    [points]
  );
  const maxVal = useMemo(
    () => Math.max(...points.map((p) => p.value)) * 1.05,
    [points]
  );
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartPoints = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((p, idx) => {
      const divisor = points.length > 1 ? points.length - 1 : 1;
      const x = paddingX + (idx / divisor) * (width - 2 * paddingX);
      const y =
        height -
        paddingBottom -
        ((p.value - minVal) / range) * (height - paddingTop - paddingBottom);
      return { x, y, ...p };
    });
  }, [points, minVal, range, width, height, paddingX, paddingTop, paddingBottom]);

  const polylineStr = chartPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPolygonStr = chartPoints.length > 0
    ? `${chartPoints[0].x},${height - paddingBottom} ${polylineStr} ${chartPoints[chartPoints.length - 1].x},${height - paddingBottom}`
    : "";

  const activePoint = hoverIndex !== null ? chartPoints[hoverIndex] : chartPoints[chartPoints.length - 1];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <WidgetErrorBoundary widgetName="PerformanceChartCard" fallbackTitle="خطا در رسم نمودار سری زمانی">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-[var(--border-muted)]">
        {/* Card Header & Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                روند طولی شاخص‌های فیزیولوژیک تیم
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              پایش دینامیک تطابق تمرینی کاراته‌کاها طی ماه‌های آماده‌سازی کومیته و کاتا
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-1">
            {SERIES_CONFIG.map((cfg) => {
              const isSelected = activeSeries === cfg.key;
              return (
                <button
                  key={cfg.key}
                  type="button"
                  onClick={() => {
                    setActiveSeries(cfg.key);
                    setHoverIndex(null);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {cfg.labelFa.split(" ")[0]} {cfg.labelFa.split(" ")[1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Hover Info Strip */}
        <div className="mt-3 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-secondary)]">
              {currentConfig.labelFa}:
            </span>
            {activePoint && (
              <span className="font-mono text-base font-bold tabular-nums text-[var(--text-primary)]">
                {activePoint.value.toFixed(1)} {currentConfig.unit}
              </span>
            )}
          </div>
          {activePoint && (
            <div className="font-mono text-[11px] text-[var(--text-muted)]">
              تاریخ ارزیابی: {activePoint.date}
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="relative mt-2 w-full overflow-hidden">
          {chartPoints.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-[var(--text-muted)]">
              هیچ آزمون بیومتریکی برای رسم نمودار در پایگاه ثبت نشده است.
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Subtle Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingTop + pct * (height - paddingTop - paddingBottom);
                return (
                  <line
                    key={`grid-${idx}`}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="var(--border-default)"
                    strokeOpacity="0.6"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Fill */}
              {areaPolygonStr && (
                <polygon points={areaPolygonStr} fill="url(#chartGradient)" />
              )}

              {/* Main Polyline Curve */}
              {polylineStr && (
                <polyline
                  fill="none"
                  stroke={currentConfig.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineStr}
                />
              )}

              {/* Data Points & Interactive Hover Circles */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoverIndex === idx;
                return (
                  <g key={`pt-${idx}`}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3.5}
                      fill={isHovered ? "var(--bg-surface)" : currentConfig.color}
                      stroke={currentConfig.color}
                      strokeWidth="2"
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                    />
                    {/* Date label at bottom */}
                    <text
                      x={pt.x}
                      y={height - 12}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </WidgetErrorBoundary>
  );
}
