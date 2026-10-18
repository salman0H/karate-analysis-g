"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/core/store/use-app-store";
import { EnterpriseShell } from "./enterprise-shell";
import { EnterpriseDataTable } from "@/features/athletes/components/enterprise-data-table";
import { TeamAnalysisView } from "@/features/team-analysis/components/team-analysis-view";
import { TechniquesView } from "@/features/techniques/components/techniques-view";
import { ConditioningStandardsView } from "@/features/standards/components/conditioning-standards-view";
import { Skeleton } from "@/shared/components/skeleton";
import { ChevronLeft } from "lucide-react";

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
      {/* 1. Team Comprehensive Analysis & Age Bracket Comparison */}
      {(activeView === "team" || activeView === "analytics") && (
        <div className="space-y-4">
          <TeamAnalysisView />
        </div>
      )}

      {/* 2. Biometric Assessment Form (S400) */}
      {activeView === "assessment" && (
        <div className="space-y-4">
          <AthleteForm />
        </div>
      )}

      {/* 3. Athletes Roster & Records */}
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

      {/* 4. Japanese Biomechanics Atlas & Techniques */}
      {activeView === "techniques" && (
        <div className="space-y-4">
          <TechniquesView />
        </div>
      )}

      {/* 5. Conditioning Normative Standards (8 to 70 years) */}
      {activeView === "standards" && (
        <div className="space-y-4">
          <ConditioningStandardsView />
        </div>
      )}

      {/* 6. Individual Athlete Longitudinal Progress (Personal History Only) */}
      {activeView === "comparative" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                پرونده و روند پیشرفت طولی ورزشکار
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                مقایسه آزمون‌های دوره‌ای هر ورزشکار نسبت به جلسات قبلی خود (بدون مقایسه غیرعلمی افراد غیرهم‌رده)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView("roster")}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
            >
              <span>بازگشت به لیست ورزشکاران</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {selectedAthlete ? (
            <AthleteProgressChart athlete={selectedAthlete} />
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-xs text-[var(--text-secondary)]">
              جهت مشاهده پرونده، یک ورزشکار را از لیست اعضا انتخاب کنید.
            </div>
          )}
        </div>
      )}
    </EnterpriseShell>
  );
}
