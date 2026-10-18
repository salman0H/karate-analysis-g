"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithAssessments } from "@/types/athlete";
import { MarkdownRenderer } from "@/features/markdown/components/markdown-renderer";
import { useAppStore } from "@/core/store/use-app-store";
import { formatJalaliDisplay } from "@/lib/jalali";
import {
  KARATE_INJURIES_DB,
  KARATE_EMG_PROFILES,
  KARATE_JOINT_KINEMATICS,
  KARATE_TACTICAL_MAAI,
  KARATE_MATCH_TELEMETRY,
} from "@/features/science/data/karate-biomechanics-db";
import {
  Users,
  Shield,
  Sparkles,
  Award,
  Zap,
  Activity,
  Droplets,
  Scale,
  RefreshCw,
  BookOpen,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertOctagon,
  Copy,
  Check,
  ChevronLeft,
  UserCheck,
  UserPlus,
  Eye,
} from "lucide-react";

type BenchmarkTabKey = "loturco" | "benosmane" | "camomilla" | "injuries" | "tactics" | "json";
type AgeCategoryKey = "u16" | "u21" | "seniors" | "masters";

export function TeamAnalysisView() {
  const { setSelectedAthlete, setActiveView, setIsNewAssessmentMode } = useAppStore();
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [activeBenchmarkTab, setActiveBenchmarkTab] = useState<BenchmarkTabKey>("loturco");
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<AgeCategoryKey>("u16");
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  const { data: athletes = [], isLoading } = useQuery<AthleteWithAssessments[]>({
    queryKey: ["athletes-team-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/athletes");
      if (!res.ok) throw new Error("Failed to load athletes");
      const json = await res.json();
      return (json.data ?? []) as AthleteWithAssessments[];
    },
    staleTime: 60 * 1000,
  });

  // Calculate real squad statistics
  const stats = useMemo(() => {
    const total = athletes.length;
    let sumAge = 0;
    let sumMuscle = 0;
    let sumFat = 0;
    let sumWater = 0;
    let evaluatedCount = 0;

    let u16Count = 0;
    let u21Count = 0;
    let seniorCount = 0;
    let mastersCount = 0;

    athletes.forEach((a) => {
      sumAge += a.age;
      if (a.age <= 15) u16Count++;
      else if (a.age <= 21) u21Count++;
      else if (a.age <= 35) seniorCount++;
      else mastersCount++;

      const latest = a.assessments?.[0];
      if (latest?.metrics) {
        const muscle = Number(latest.metrics.muscleMass ?? latest.metrics.skeletalMuscleMass);
        const fat = Number(latest.metrics.bodyFatPercentage ?? latest.metrics.bodyFatRate);
        const water = Number(latest.metrics.bodyWaterPercentage ?? latest.metrics.bodyWaterRate);
        if (!isNaN(muscle) && muscle > 0) sumMuscle += muscle;
        if (!isNaN(fat) && fat > 0) sumFat += fat;
        if (!isNaN(water) && water > 0) sumWater += water;
        evaluatedCount++;
      }
    });

    const avgAge = total > 0 ? (sumAge / total).toFixed(1) : "0.0";
    const avgMuscle = evaluatedCount > 0 ? (sumMuscle / evaluatedCount).toFixed(1) : "0.0";
    const avgFat = evaluatedCount > 0 ? (sumFat / evaluatedCount).toFixed(1) : "0.0";
    const avgWater = evaluatedCount > 0 ? (sumWater / evaluatedCount).toFixed(1) : "0.0";

    return {
      total,
      avgAge,
      avgMuscle,
      avgFat,
      avgWater,
      u16Count,
      u21Count,
      seniorCount,
      mastersCount,
    };
  }, [athletes]);

  // Group and compare athletes strictly within their specific biological age brackets
  const categoryGroups = useMemo(() => {
    const u16List = athletes.filter((a) => a.age <= 15);
    const u21List = athletes.filter((a) => a.age >= 16 && a.age <= 21);
    const seniorList = athletes.filter((a) => a.age >= 22 && a.age <= 35);
    const mastersList = athletes.filter((a) => a.age >= 36);

    const computeCatAverages = (list: AthleteWithAssessments[]) => {
      let sumWeight = 0;
      let sumMuscle = 0;
      let sumFat = 0;
      let sumWater = 0;
      let validCount = 0;

      for (const a of list) {
        const latest = a.assessments?.[0]?.metrics;
        if (latest) {
          const w = Number(latest.weight) || 0;
          const m = Number(latest.muscleMass ?? latest.skeletalMuscleMass) || 0;
          const f = Number(latest.bodyFatPercentage ?? latest.bodyFatRate) || 0;
          const h = Number(latest.bodyWaterPercentage ?? latest.bodyWaterRate) || 0;
          if (w > 0) sumWeight += w;
          if (m > 0) sumMuscle += m;
          if (f > 0) sumFat += f;
          if (h > 0) sumWater += h;
          validCount++;
        }
      }

      return {
        count: list.length,
        avgWeight: validCount > 0 ? (sumWeight / validCount).toFixed(1) : "—",
        avgMuscle: validCount > 0 ? (sumMuscle / validCount).toFixed(1) : "—",
        avgFat: validCount > 0 ? (sumFat / validCount).toFixed(1) : "—",
        avgWater: validCount > 0 ? (sumWater / validCount).toFixed(1) : "—",
        athletes: list,
      };
    };

    return {
      u16: {
        id: "u16" as const,
        titleFa: "نوجوانان و پایه (زیر ۱۶ سال)",
        titleEn: "U16 Cadets & Foundation",
        ageRange: "۸ تا ۱۵ سال",
        targetFatRange: "۱۰٪ تا ۱۴٪",
        focusSummary: "الگوهای مهارتی، چابکی، واکنش سرعتی و داچی‌های بنیادین بدون بارگذاری وزنه سنگین",
        ...computeCatAverages(u16List),
      },
      u21: {
        id: "u21" as const,
        titleFa: "جوانان و امید (۱۶ تا ۲۱ سال)",
        titleEn: "U21 Junior Division",
        ageRange: "۱۶ تا ۲۱ سال",
        targetFatRange: "۸٪ تا ۱۲٪",
        focusSummary: "هایپرتروفی کاربردی، شتاب پرش اسکوات، توان بی‌هوازی انفجاری و استارت‌های سریع کومیته",
        ...computeCatAverages(u21List),
      },
      seniors: {
        id: "seniors" as const,
        titleFa: "بزرگسالان قهرمانی (۲۲ تا ۳۵ سال)",
        titleEn: "Seniors Elite National Division",
        ageRange: "۲۲ تا ۳۵ سال",
        targetFatRange: "۷٪ تا ۱۱٪",
        focusSummary: "اوج تولید نرخ نیرو (RFD)، زمان واکنش دیداری زیر ۰.۴۲s، کاتاهای پیشرفته و مدیریت مسابقات انتخابی",
        ...computeCatAverages(seniorList),
      },
      masters: {
        id: "masters" as const,
        titleFa: "پیشکسوتان و اساتید (۳۶ تا ۷۰ سال)",
        titleEn: "Masters & Senior Instructors",
        ageRange: "۳۶ تا ۷۰ سال",
        targetFatRange: "۱۲٪ تا ۱۸٪",
        focusSummary: "پیشگیری از سارکوپنیا (تحلیل عضلانی)، حفظ دانسیته استخوان، تثبیت زاویه مفصل زانو و کاتاهای تمرکزی",
        ...computeCatAverages(mastersList),
      },
    };
  }, [athletes]);

  const currentCategory = categoryGroups[selectedAgeCategory];

  // Comprehensive JSON payload for export & ingestion
  const fullJsonDatabase = useMemo(() => {
    return JSON.stringify(
      {
        squadSummary: {
          totalAthletes: stats.total,
          averageAge: stats.avgAge,
          averageMuscleMassKg: stats.avgMuscle,
          averageBodyFatPct: stats.avgFat,
          averageWaterPct: stats.avgWater,
          ageBrackets: {
            u16Count: stats.u16Count,
            u21Count: stats.u21Count,
            seniorCount: stats.seniorCount,
            mastersCount: stats.mastersCount,
          },
        },
        injuries: KARATE_INJURIES_DB,
        emgProfiles: KARATE_EMG_PROFILES,
        kinematics: {
          joint3DRanges: KARATE_JOINT_KINEMATICS,
          tacticalMaai: KARATE_TACTICAL_MAAI,
          wkfTelemetry: KARATE_MATCH_TELEMETRY,
        },
      },
      null,
      2
    );
  }, [stats]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(fullJsonDatabase);
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2500);
  };

  const handleGenerateTeamAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "کادر فنی و رزمی‌کاران باشگاه برق منطقه‌ای خراسان",
          gender: "MALE",
          age: Number(stats.avgAge),
          discipline: "karate",
          isTeamOverview: true,
          metrics: {
            totalAthletes: stats.total,
            avgMuscleMass: stats.avgMuscle,
            avgBodyFatPercentage: stats.avgFat,
            avgWaterPercentage: stats.avgWater,
            u16Count: stats.u16Count,
            u21Count: stats.u21Count,
            seniorCount: stats.seniorCount,
            mastersCount: stats.mastersCount,
          },
          measuredAt: new Date().toISOString(),
          clubName: "باشگاه کاراته شرکت برق منطقه ای خراسان",
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در برقراری ارتباط با مدل هوش مصنوعی");
      }

      const resData = await response.json();
      setAiReport(resData.report);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در پردازش هوش مصنوعی");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              ارزیابی تحلیلی کل تیم و مقایسه در رده‌های سنی مشخص
            </h1>
            <span className="rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold">
              {stats.total} رزمی‌کار فعال
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
            بررسی ترکیب بدنی کل تیم در یک نگاه و مقایسه هدفمند ورزشکاران صرفاً در رده‌های سنی زیستی همتا (بدون اختلاط سنی غیرعلمی)
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateTeamAiReport}
          disabled={isGeneratingAi || isLoading}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGeneratingAi ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>
            {isGeneratingAi
              ? "استنتاج استراتژی تیم با هوش مصنوعی..."
              : "تحلیل راهبردی کل تیم با هوش مصنوعی Groq"}
          </span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span>تعداد کل رزمی‌کاران</span>
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--text-primary)]">
            {stats.total} <span className="text-sm font-bold text-[var(--text-muted)]">نفر</span>
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)] font-medium">
            پوشش رده سنی ۸ تا ۷۰ سال
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span>میانگین توده عضلانی کل تیم</span>
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--text-primary)]">
            {stats.avgMuscle} <span className="text-sm font-bold text-[var(--text-muted)]">kg</span>
          </div>
          <div className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            شاخص قدرت پیشرانه WKF
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span>درصد چربی بدنی میانگین تیم</span>
            <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--text-primary)]">
            {stats.avgFat} <span className="text-sm font-bold text-[var(--text-muted)]">٪</span>
          </div>
          <div className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            کنترل دقیق سر وزن WKF
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span>میانگین هیدراتاسیون و آب بدن</span>
            <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--text-primary)]">
            {stats.avgWater} <span className="text-sm font-bold text-[var(--text-muted)]">٪</span>
          </div>
          <div className="mt-1 text-xs font-bold text-sky-700 dark:text-sky-400">
            ایمن در برابر خستگی زودرس
          </div>
        </div>
      </div>

      {/* Primary Section: Age-Specific Categorical Comparison Engine */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                مقایسه علمی ورزشکاران در رده‌های سنی مشخص (WKF Categorical Roster)
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              مقایسه عادلانه و اصولی پارامترهای بیومتریک هر ورزشکار صرفاً با همتایان هم‌رده و استانداردهای زیستی همان گروه سنی
            </p>
          </div>

          {/* Age Bracket Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "u16", label: "نوجوانان (زیر ۱۶)", count: stats.u16Count },
                { id: "u21", label: "جوانان و امید (۱۶-۲۱)", count: stats.u21Count },
                { id: "seniors", label: "بزرگسالان (۲۲-۳۵)", count: stats.seniorCount },
                { id: "masters", label: "پیشکسوتان (۳۶-۷۰)", count: stats.mastersCount },
              ] as const
            ).map((tab) => {
              const isActive = selectedAgeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedAgeCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? "bg-emerald-900 text-white" : "bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Age Group Physiological Profile Header */}
        <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {currentCategory.titleFa}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans mr-2">
                ({currentCategory.titleEn})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold">
                هنجار چربی WKF این رده: {currentCategory.targetFatRange}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-bold">
                {currentCategory.count} ورزشکار عضو
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
            <strong className="text-[var(--text-primary)]">هدف‌گذاری بیومکانیک و آمادگی: </strong>
            {currentCategory.focusSummary}
          </p>

          {/* Category Averages Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] text-center">
              <div className="text-[11px] font-bold text-[var(--text-muted)]">میانگین وزن رده</div>
              <div className="mt-1 text-base font-black text-[var(--text-primary)] font-mono">
                {currentCategory.avgWeight} {currentCategory.avgWeight !== "—" ? "kg" : ""}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] text-center">
              <div className="text-[11px] font-bold text-[var(--text-muted)]">میانگین توده عضلانی</div>
              <div className="mt-1 text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {currentCategory.avgMuscle} {currentCategory.avgMuscle !== "—" ? "kg" : ""}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] text-center">
              <div className="text-[11px] font-bold text-[var(--text-muted)]">میانگین درصد چربی</div>
              <div className="mt-1 text-base font-black text-amber-700 dark:text-amber-400 font-mono">
                {currentCategory.avgFat} {currentCategory.avgFat !== "—" ? "٪" : ""}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] text-center">
              <div className="text-[11px] font-bold text-[var(--text-muted)]">میانگین آب و هیدراتاسیون</div>
              <div className="mt-1 text-base font-black text-sky-700 dark:text-sky-400 font-mono">
                {currentCategory.avgWater} {currentCategory.avgWater !== "—" ? "٪" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Athletes List within this specific category */}
        {currentCategory.athletes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] p-8 text-center space-y-3">
            <Users className="h-10 w-10 text-[var(--text-muted)]" />
            <div className="text-sm font-bold text-[var(--text-primary)]">
              هنوز ورزشکاری در رده سنی {currentCategory.ageRange} ثبت نشده است.
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-md">
              می‌توانید با استفاده از فرم سنجش بیومتریک S400، ورزشکاران رده بزرگسالان یا سایر رده‌ها را وارد سیستم نمایید.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsNewAssessmentMode(false);
                setActiveView("assessment");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>ثبت ورزشکار جدید در این رده</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-xs text-right">
                <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-bold border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="p-3">رتبه</th>
                    <th className="p-3">نام و مشخصات رزمی‌کار</th>
                    <th className="p-3">سن دقیق</th>
                    <th className="p-3">وزن</th>
                    <th className="p-3">توده عضلانی (kg)</th>
                    <th className="p-3">درصد چربی بدنی</th>
                    <th className="p-3">آب و هیدراتاسیون</th>
                    <th className="p-3">ارزیابی وضعیت</th>
                    <th className="p-3 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)]">
                  {currentCategory.athletes.map((athlete, idx) => {
                    const latest = athlete.assessments?.[0]?.metrics;
                    const weight = latest?.weight ? `${latest.weight} kg` : "—";
                    const muscle = latest?.muscleMass ?? latest?.skeletalMuscleMass;
                    const fat = latest?.bodyFatPercentage ?? latest?.bodyFatRate;
                    const water = latest?.bodyWaterPercentage ?? latest?.bodyWaterRate;

                    return (
                      <tr
                        key={athlete.id}
                        className="hover:bg-[var(--bg-surface-elevated)] transition-colors"
                      >
                        <td className="p-3 font-mono font-bold text-[var(--text-muted)]">
                          #{idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {athlete.selfieUrl ? (
                              <img
                                src={athlete.selfieUrl}
                                alt={athlete.fullName}
                                className="h-7 w-7 rounded-full object-cover border border-[var(--border-subtle)]"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                                {athlete.fullName.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">
                                {athlete.fullName}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                                {athlete.gender === "MALE" ? "آقایان" : "بانوان"} • {athlete.birthDateJalali}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-[var(--text-primary)] font-mono">
                          {athlete.age} سال
                        </td>
                        <td className="p-3 font-bold text-[var(--text-primary)] font-mono">
                          {weight}
                        </td>
                        <td className="p-3 font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                          {muscle ? `${muscle} kg` : "—"}
                        </td>
                        <td className="p-3 font-black text-amber-700 dark:text-amber-400 font-mono text-sm">
                          {fat ? `${fat}٪` : "—"}
                        </td>
                        <td className="p-3 font-bold text-sky-700 dark:text-sky-400 font-mono">
                          {water ? `${water}٪` : "—"}
                        </td>
                        <td className="p-3">
                          {fat ? (
                            Number(fat) <= 14 ? (
                              <span className="rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                                استاندارد کومیته
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                                نیازمند تنظیم وزن
                              </span>
                            )
                          ) : (
                            <span className="text-[var(--text-muted)]">آزمون اولیه</span>
                          )}
                        </td>
                        <td className="p-3 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAthlete(athlete);
                                setActiveView("comparative");
                              }}
                              className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
                              title="مشاهده روند پیشرفت فردی"
                            >
                              <Eye className="h-3 w-3 text-emerald-600" />
                              <span>پرونده</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAthlete(athlete);
                                setIsNewAssessmentMode(true);
                                setActiveView("assessment");
                              }}
                              className="flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white cursor-pointer"
                              title="ثبت ارزیابی دوره‌ای جدید"
                            >
                              <span>آزمون جدید</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual Within-Category Comparative Meters */}
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] space-y-3">
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>مقایسه گرافیکی توده عضلانی ورزشکاران این رده سنی:</span>
                <span className="text-[11px] text-[var(--text-muted)] font-normal">واحد: کیلوگرم (kg)</span>
              </div>
              <div className="space-y-2">
                {currentCategory.athletes.map((ath) => {
                  const m = Number(ath.assessments?.[0]?.metrics?.muscleMass ?? ath.assessments?.[0]?.metrics?.skeletalMuscleMass) || 30;
                  const maxMuscle = 75;
                  const pct = Math.min(100, Math.round((m / maxMuscle) * 100));

                  return (
                    <div key={ath.id} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-bold text-[var(--text-secondary)] truncate">
                        {ath.fullName.split(" ")[0]} {ath.fullName.split(" ")[1] ?? ""}
                      </span>
                      <div className="flex-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 font-mono font-black text-[var(--text-primary)] text-left">
                        {m} kg
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scientific Laboratory Benchmarks Matrix */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              پایگاه داده هنجارها و معیارهای آزمایشگاهی نخبگان کاراته جهان (۹ منبع معتبر جهانی)
            </h2>
          </div>

          {/* Benchmark Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {[
              { id: "loturco", label: "توان و قدرت (Loturco)" },
              { id: "benosmane", label: "واکنش و کینتیک (Benosmane)" },
              { id: "camomilla", label: "الکترومیوگرافی و دامنه‌ها (Camomilla)" },
              { id: "injuries", label: "ماتریس آسیب و آزمون‌های RTP" },
              { id: "tactics", label: "فواصل ماآی و شتاب SSI" },
              { id: "json", label: "دیتابیس JSON" },
            ].map((tab) => {
              const isActive = activeBenchmarkTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveBenchmarkTab(tab.id as BenchmarkTabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Loturco et al. */}
        {activeBenchmarkTab === "loturco" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs">
              <span className="font-bold text-[var(--text-primary)] text-sm">
                شاخص‌های آمادگی تیم ملی برزیل (Loturco et al. [۹، ۲۰۶، ۲۲۵]):
              </span>
              <p className="mt-1 text-[var(--text-secondary)] leading-relaxed font-medium">
                بررسی قدرت بیشینه، توان پیشرانه جامپ اسکوات و بنچ ترو به عنوان قوی‌ترین شاخص‌های پیش‌بینی‌کننده شتاب‌گیری ضربات مشت و جهش در کومیته نخبگان (توضیح‌دهنده ۵۶٪ تا ۶۵٪ از تغییرات شتاب مشت).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">قدرت ۱RM اسکوات ماشین</div>
                  <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                    مردان: <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">201 kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(2.65 kg/BW)</span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    زنان: <span className="font-mono font-bold">151 kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(2.58 kg/BW)</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  نیروی پیشران رانندگی پاها (Leg Drive) [۹، ۲۲۵]
                </div>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">توان پرش اسکوات (Jump Squat)</div>
                  <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                    مردان: <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">9.49 W/kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(۷۱۸ W)</span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    زنان: <span className="font-mono font-bold">7.93 W/kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(۴۵۸ W)</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  پیش‌بین ۵۶-۶۵٪ شتاب ضربات مشت [۹]
                </div>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">توان پرتاب بالاتنه (Bench Throw)</div>
                  <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                    مردان: <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">7.68 W/kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(۵۸۳ W)</span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    زنان: <span className="font-mono font-bold">4.48 W/kg</span> <span className="text-xs text-[var(--text-muted)] font-mono">(۲۶۱ W)</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  شلیک خطی مشت کیزامی/گیاکو تسوکی [۲۲۵]
                </div>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">ارتفاع پرش عمودی (CMJ / SJ)</div>
                  <div className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                    مردان: <span className="font-mono text-base font-black text-emerald-700 dark:text-emerald-400">۴۳.۲ / ۴۰.۶ cm</span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    زنان: <span className="font-mono font-bold">۳۱.۹ / ۳۰.۵ cm</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  بهره‌وری چرخه کشش-کوتاه‌شدن (SSC) [۲۲۵]
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Benosmane & Venkatraman */}
        {activeBenchmarkTab === "benosmane" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs">
              <span className="font-bold text-[var(--text-primary)] text-sm">
                تلمتری زمان واکنش، کینتیک ضربه و نیروی عکس‌العمل زمین (Benosmane & Venkatraman [۶، ۷]):
              </span>
              <p className="mt-1 text-[var(--text-secondary)] leading-relaxed font-medium">
                مقایسه آزمایشگاهی تخصصی کاراته‌کای کومیته در برابر کاتا و بررسی مقایسه‌ای مشت معکوس چرخشی در برابر بدون چرخش در امتیازگیری فدراسیون جهانی WKF.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-2">
                <div className="text-xs font-bold text-[var(--text-secondary)]">زمان واکنش دیداری (Visual RT)</div>
                <div className="text-base font-black text-[var(--text-primary)]">
                  کومیته: <span className="font-mono text-emerald-700 dark:text-emerald-400">۰.۴۲ ثانیه</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  کاتا: ۰.۵۳ ثانیه [۶]
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-elevated)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  سازگاری اختصاصی مبارزه کومیته برای توسعه سریع نرخ تولید نیرو (RFD).
                </p>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-2">
                <div className="text-xs font-bold text-[var(--text-secondary)]">گیاکو تسوکی بدون چرخش (WKF)</div>
                <div className="text-base font-black text-[var(--text-primary)]">
                  سرعت: <span className="font-mono text-emerald-700 dark:text-emerald-400">۵.۵۲ m/s</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  نیروی برخورد: ۳۳۷ N [۷]
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-elevated)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  به دلیل ۳.۵۶٪ سرعت بیشتر و کوتاه‌تر بودن زمان اجرای ضربه، در قوانین امتیازی WKF در اولویت است.
                </p>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-2">
                <div className="text-xs font-bold text-[var(--text-secondary)]">گیاکو تسوکی با چرخش مچ</div>
                <div className="text-base font-black text-[var(--text-primary)]">
                  نیرو: <span className="font-mono text-emerald-700 dark:text-emerald-400">۳۸۴ N (در ۵.۲۶ m/s)</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  انرژی جنبشی: ۵۴.۰۲ J کل [۷]
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-elevated)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  چرخش مچ موجب افزایش ۱۲٪ در نیروی برخورد شده و برای ضربات غیرکنترلی و ناک‌اوت ایده‌آل است.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Camomilla et al. */}
        {activeBenchmarkTab === "camomilla" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs">
              <span className="font-bold text-[var(--text-primary)] text-sm">
                الکترومیوگرافی و دامنه‌های زاویه‌ای سه‌بعدی ضربه پا (Camomilla et al. [۸]):
              </span>
              <p className="mt-1 text-[var(--text-secondary)] leading-relaxed font-medium">
                تحلیل سه‌بعدی دامنه‌های حرکتی زانو و لگن، تایمینگ ابداکشن تا فلکشن زانو (t_H-K) و شاخص همانقباضی فازهای پرتاب و ترمزگیری.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-1.5">
                <div className="font-bold text-[var(--text-secondary)]">زمان باز شدن زانو (t_KE)</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  نخبگان: ۰.۱۲ ثانیه
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">آماتورها: ۰.۱۹ ثانیه [۸]</div>
                <p className="text-xs text-[var(--text-secondary)]">سرعت زاویه‌ای ۵۸٪ بالاتر در مفصل زانو در نخبگان.</p>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-1.5">
                <div className="font-bold text-[var(--text-secondary)]">همانقباضی فاز پرتاب (CI_E)</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  مهار همسترینگ: ۱۵-۲۰٪
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">آماتورها: ۳۵-۴۵٪ [۸]</div>
                <p className="text-xs text-[var(--text-secondary)]">خاموش‌سازی هدفمند عضلات آنتاگونیست جهت بیشینه‌سازی شتاب شلاقی.</p>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-1.5">
                <div className="font-bold text-[var(--text-secondary)]">همانقباضی ترمزگیری (CI_F)</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  نخبگان: ۵۰-۵۵٪
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">آماتورها: ۳۰-۳۵٪ [۸]</div>
                <p className="text-xs text-[var(--text-secondary)]">فعال‌سازی قوی ترمزکننده عضلات جهت پیشگیری قطعی از آسیب زانو.</p>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-1.5">
                <div className="font-bold text-[var(--text-secondary)]">تایمینگ لگن-زانو (t_H-K)</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  نخبگان: -۰.۰۴ تا ۰.۰۰ s
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono">آماتورها: +۰.۰۲ تا +۰.۰۴ s [۸]</div>
                <p className="text-xs text-[var(--text-secondary)]">ابداکشن لگن قبل یا همزمان با فلکشن زانو در نخبگان.</p>
              </div>
            </div>

            {/* 3D Motion Ranges Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-xs text-right">
                <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-bold border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="p-3">دامنه حرکتی سه‌بعدی مفصل</th>
                    <th className="p-3">نخبگان با برخورد (IM)</th>
                    <th className="p-3">نخبگان بدون برخورد (NI)</th>
                    <th className="p-3">آماتورها با برخورد</th>
                    <th className="p-3">آماتورها بدون برخورد</th>
                    <th className="p-3">منبع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] font-medium">
                  {KARATE_JOINT_KINEMATICS.map((k, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-surface-elevated)]">
                      <td className="p-3 font-bold text-[var(--text-primary)]">{k.movement}</td>
                      <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400">{k.eliteIM}</td>
                      <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400">{k.eliteNI}</td>
                      <td className="p-3 font-mono text-[var(--text-muted)]">{k.amateurIM}</td>
                      <td className="p-3 font-mono text-[var(--text-muted)]">{k.amateurNI}</td>
                      <td className="p-3 font-mono text-[var(--text-secondary)] font-bold">{k.citation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Karate Injury Biomechanics & RTP Matrix */}
        {activeBenchmarkTab === "injuries" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 text-sm">
                ماتریس آسیب‌شناسی، بیومکانیک تروما و پروتکل بازگشت به تمرین (RTP) [۳، ۴، ۶، ۸]:
              </span>
              <p className="mt-1 text-[var(--text-secondary)] leading-relaxed font-medium">
                تحلیل مکانیسم‌های بروز شکستگی، آسیب‌های مفصلی و خطرات قلبی-عروقی به همراه تمرینات پیشگیرانه دوجو و معیارهای عینی آزمون‌های بازگشت به میدان.
              </p>
            </div>

            <div className="space-y-3">
              {KARATE_INJURIES_DB.map((inj) => (
                <div
                  key={inj.id}
                  className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs text-xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
                      <span className="font-bold text-sm text-[var(--text-primary)]">{inj.nameFa}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">({inj.nameEn})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-500/10 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold border border-rose-500/30">
                        {inj.prevalence}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)] font-bold">منبع {inj.citation}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">مکانیسم دقیق بیومکانیک و بردار نیرو:</span>
                      <p className="mt-0.5 text-[var(--text-secondary)] leading-relaxed">{inj.biomechanicalMechanism}</p>
                    </div>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-400">آستانه بارگذاری بحرانی و زوایای پرخطر:</span>
                      <p className="mt-0.5 text-[var(--text-secondary)] leading-relaxed">{inj.criticalThreshold}</p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">تمرینات پیشگیرانه تخصصی دوجو (Prehab):</span>
                      <p className="mt-0.5 text-[var(--text-secondary)] leading-relaxed">{inj.prehabProtocol}</p>
                    </div>
                    <div>
                      <span className="font-bold text-sky-700 dark:text-sky-400">معیارهای عینی آزمون‌های بازگشت به تاتامی (RTP):</span>
                      <p className="mt-0.5 text-[var(--text-secondary)] leading-relaxed">{inj.returnToPlayCriteria}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Maai & Spatio-Temporal Tactics */}
        {activeBenchmarkTab === "tactics" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs">
              <span className="font-bold text-[var(--text-primary)] text-sm">
                متغیرهای فضایی-زمانی تاکتیک، فواصل ماآی (Maai) و تلمتری مسابقه [۱، ۶، ۹]:
              </span>
              <p className="mt-1 text-[var(--text-secondary)] leading-relaxed font-medium">
                تحلیل تاثیر فاصله خودبرگزیده (SSI) در برابر فاصله ثابت (FS)، نیت ضربه‌زنی و وابستگی سیستم‌های متابولیک در راندهای مسابقات رسمی WKF.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {KARATE_TACTICAL_MAAI.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{t.condition}</span>
                    <span className="font-mono text-xs text-[var(--text-muted)] font-bold">منبع {t.citation}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-black">
                      مردان: {t.accelerationMaleG}
                    </span>
                    <span className="bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-black">
                      زنان: {t.accelerationFemaleG}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {t.tacticalImplication}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="font-bold text-sm text-[var(--text-primary)]">
                پروفایل تلمتری و متابولیسم مسابقه کومیته (WKF Match Telemetry [۹]):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-secondary)] font-bold">طول درگیری‌های پرشدت</div>
                  <div className="mt-1 font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">۰.۳ تا ۲.۱ ثانیه</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">غلبه مطلق سیستم فسفاژن ATP-PCr</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-secondary)] font-bold">پیش‌بین شتاب ضربه مشت</div>
                  <div className="mt-1 font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">۵۶٪ تا ۶۵٪ تبیین</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">وابسته به توان پرش اسکوات و ۱RM</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-secondary)] font-bold">اثر تمرینات هسته (Core)</div>
                  <div className="mt-1 font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">افزایش توان ضربه</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">افزایش تعداد کیک در ۳۰ ثانیه [۱]</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: System JSON Database */}
        {activeBenchmarkTab === "json" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-elevated)] p-3.5 rounded-xl border border-[var(--border-subtle)] text-xs">
              <div>
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  پایگاه داده ساختاریافته معتبر JSON کاراته و علوم ورزشی
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                  شامل آرایه‌های آسیب‌ها، پروفایل‌های الکترومیوگرافی، دامنه‌های حرکتی ۳بعدی و تلمتری مسابقات
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
              >
                {hasCopiedJson ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{hasCopiedJson ? "کپی شد" : "کپی ساختار JSON"}</span>
              </button>
            </div>

            <div className="rounded-xl bg-[var(--bg-surface-elevated)] p-4 border border-[var(--border-subtle)] overflow-x-auto max-h-96">
              <pre className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed dir-ltr text-left">
                {fullJsonDatabase}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Rendered Groq Team Markdown Report */}
      {aiReport && (
        <MarkdownRenderer
          title="گزارش استراتژیک کل تیم کاراته تولیدشده توسط Groq Llama-3"
          content={aiReport}
        />
      )}
    </div>
  );
}

