"use client";

import React from "react";
import { KpiMetricCard } from "./kpi-metric-card";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";
import { WidgetErrorBoundary } from "@/core/error/error-boundary";

export function HighDensityKpiGrid() {
  const { kpiData, isLoading } = useKpiMetrics();

  return (
    <WidgetErrorBoundary widgetName="HighDensityKpiGrid" fallbackTitle="خطا در شبکه شاخص‌های اجرایی">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <KpiMetricCard key={`skeleton-${idx}`} isLoading={true} />
            ))
          : kpiData.map((metric) => (
              <KpiMetricCard key={metric.id} metric={metric} />
            ))}
      </div>
    </WidgetErrorBoundary>
  );
}
