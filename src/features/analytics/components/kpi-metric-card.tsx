"use client";

import React, { memo } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { KpiMetricDTO } from "../api/schemas";
import { Skeleton } from "@/shared/components/skeleton";
import { WidgetErrorBoundary } from "@/core/error/error-boundary";
import { formatNumber, formatPercent } from "@/shared/lib/formatters";

export interface KpiMetricCardProps {
  metric?: KpiMetricDTO;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Pure SVG Sparkline with fixed aspect ratio to eliminate layout shift (CLS < 0.1)
 */
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y =
        height -
        padding -
        ((val - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const fillColor = isPositive ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";

  // Area under line
  const firstX = padding;
  const lastX = width - padding;
  const areaPoints = `${firstX},${height} ${points} ${lastX},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polygon points={areaPoints} fill={fillColor} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * Loading skeleton strictly sized to guarantee zero CLS
 */
function KpiMetricSkeleton() {
  return (
    <div className="flex h-[132px] w-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

/**
 * Pure presentation component for executive KPI cards
 */
export const KpiMetricCardPure = memo(function KpiMetricCardPure({
  metric,
  isLoading = false,
  className = "",
  onClick,
}: KpiMetricCardProps) {
  if (isLoading || !metric) {
    return <KpiMetricSkeleton />;
  }

  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";
  const isGood = metric.isPositiveImprovement;

  return (
    <div
      role="region"
      aria-label={metric.titleFa}
      onClick={onClick}
      className={`group relative flex h-[132px] flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-all duration-200 hover:border-[var(--border-muted)] hover:bg-[var(--bg-surface-elevated)] hover:shadow-lg ${
        onClick ? "cursor-pointer active:scale-[0.99]" : ""
      } ${className}`}
    >
      {/* Header: Title and Trend Delta Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
            {metric.titleFa}
          </span>
          {metric.descriptionFa && (
            <span title={metric.descriptionFa} className="cursor-help text-[var(--text-muted)] hover:text-emerald-400">
              <Info className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Trend delta pill */}
        <div
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
            isGood
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {isUp && <TrendingUp className="h-3 w-3" />}
          {isDown && <TrendingDown className="h-3 w-3" />}
          {!isUp && !isDown && <Minus className="h-3 w-3" />}
          <span>{formatPercent(metric.changePercent)}</span>
        </div>
      </div>

      {/* Main Metric Value & Unit with Tabular Numbers */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
          {formatNumber(metric.value, metric.value % 1 !== 0 ? 1 : 0)}
        </span>
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {metric.unit}
        </span>
        {metric.target && (
          <span className="mr-auto font-mono text-[10px] text-[var(--text-muted)]">
            هدف: {metric.target}
          </span>
        )}
      </div>

      {/* Footer: Sparkline & Secondary Metric Detail */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
        <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[140px]">
          {metric.titleEn}
        </span>
        <div className="shrink-0">
          <Sparkline data={metric.sparkline} isPositive={metric.isPositiveImprovement} />
        </div>
      </div>
    </div>
  );
});

/**
 * High-performance enterprise KPI Card with resilient error boundary
 */
export function KpiMetricCard(props: KpiMetricCardProps) {
  return (
    <WidgetErrorBoundary
      widgetName={props.metric?.titleEn ?? "KpiMetricCard"}
      fallbackTitle="عدم امکان دریافت شاخص"
    >
      <KpiMetricCardPure {...props} />
    </WidgetErrorBoundary>
  );
}
