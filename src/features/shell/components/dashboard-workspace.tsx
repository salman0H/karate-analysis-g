"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/core/store/use-app-store";
import { EnterpriseShell } from "./enterprise-shell";
import { HighDensityKpiGrid } from "@/features/analytics/components/high-density-kpi-grid";
import { PerformanceChartCard } from "@/features/analytics/components/performance-chart-card";
import { EnterpriseDataTable } from "@/features/athletes/components/enterprise-data-table";
import { TeamAnalysisView } from "@/features/team-analysis/components/team-analysis-view";
import { TechniquesView } from "@/features/techniques/components/techniques-view";
import { ConditioningStandardsView } from "@/features/standards/components/conditioning-standards-view";
import { Skeleton } from "@/shared/components/skeleton";
import { ChevronLeft, Plus } from "lucide-react";

// Code splitting: dynamically import heavy assessment form & comparative chart
const AthleteForm = dynamic(
  () => import("@/components/athlete-form").then((mod) => mod.AthleteForm),
  {
    loading: () => (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

const AthleteProgressChart = dynamic(
  () =>
    import("@/components/athlete-progress-chart").then(
      (mod) => mod.AthleteProgressChart
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export function DashboardWorkspace() {
  const {
    activeView,
    setActiveView,
    selectedAthlete,
    setSelectedAthlete,
    setIsNewAssessmentMode,
  } = useAppStore();

  return (
    <EnterpriseShell>
      {/* 1. Analytics & Executive Overview */}
      {activeView === "analytics" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                داشبورد تحلیلی و شاخص‌های آمادگی
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                پایش ترکیب بدنی، توده عضلانی و وضعیت کومیته و کاتا بر مبنای ارزیابی‌های دستگاه Xiaomi S400
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewAssessmentMode(false);
                  setActiveView("assessment");
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ثبت ارزیابی جدید</span>
              </button>
            </div>
          </div>

          <HighDensityKpiGrid />
          <PerformanceChartCard />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                وضعیت بیومتریک اعضای تیم
              </h2>
              <button
                type="button"
                onClick={() => setActiveView("roster")}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                <span>مشاهده پرونده تمام اعضا</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            <EnterpriseDataTable
              onSelectAthlete={(athlete) => {
                setSelectedAthlete(athlete);
                setActiveView("comparative");
              }}
              onNewAssessment={(athlete) => {
                setSelectedAthlete(athlete);
                setIsNewAssessmentMode(true);
                setActiveView("assessment");
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Team Comprehensive Analysis */}
      {activeView === "team" && (
        <div className="space-y-4">
          <TeamAnalysisView />
        </div>
      )}

      {/* 3. Japanese Biomechanics Atlas & Techniques */}
      {activeView === "techniques" && (
        <div className="space-y-4">
          <TechniquesView />
        </div>
      )}

      {/* 4. Conditioning Normative Standards (8 to 70 years) */}
      {activeView === "standards" && (
        <div className="space-y-4">
          <ConditioningStandardsView />
        </div>
      )}

      {/* 5. Biometric Assessment Form (S400) */}
      {activeView === "assessment" && (
        <div className="space-y-4">
          <AthleteForm />
        </div>
      )}

      {/* 6. Athletes Roster & Records */}
      {activeView === "roster" && (
        <div className="space-y-4">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              لیست ورزشکاران و پرونده‌های سنجش بدنی
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              مدیریت مشخصات فردی، رده‌های سنی (۸ تا ۷۰ سال)، سوابق ارزیابی بیومتریک و صدور شناسنامه ورزشی
            </p>
          </div>

          <EnterpriseDataTable
            onSelectAthlete={(athlete) => {
              setSelectedAthlete(athlete);
              setActiveView("comparative");
            }}
            onNewAssessment={(athlete) => {
              setSelectedAthlete(athlete);
              setIsNewAssessmentMode(true);
              setActiveView("assessment");
            }}
          />
        </div>
      )}

      {/* 7. Comparative Longitudinal Analysis */}
      {activeView === "comparative" && (
        <div className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              تحلیل مقایسه‌ای پیشرفت ورزشکاران
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              بررسی تغییرات توده عضلانی، درصد چربی و شاخص‌های توان انفجاری در طول دوره تمرینی
            </p>
          </div>

          <PerformanceChartCard />

          {selectedAthlete ? (
            <AthleteProgressChart athlete={selectedAthlete} />
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-xs text-[var(--text-secondary)]">
              جهت مشاهده آنالیز مقایسه‌ای تفصیلی، یک ورزشکار را از لیست اعضا انتخاب کنید.
            </div>
          )}
        </div>
      )}
    </EnterpriseShell>
  );
}
