"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  METRICS_CONFIG,
  CATEGORY_LABELS_FA,
  PRESET_ATHLETES,
  SAMPLE_ATHLETE_EXPORT,
  getDefaultMetricsValues,
  getDefaultEnabledMetrics,
  MetricCategory,
} from "@/config/metrics.config";
import {
  athleteFormSchema,
  AthleteFormValues,
  SPORT_DISCIPLINES,
  SportDiscipline,
} from "@/types/athlete";
import { calculateAgeFromJalali } from "@/lib/jalali";
import { KarateRosterSelector } from "@/components/karate-roster-selector";
import { AthleteProgressChart } from "@/components/athlete-progress-chart";
import type {
  AthleteWithAssessments,
  AssessmentRecord,
} from "@/types/athlete";
import { SelfieCapture } from "@/components/selfie-capture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Sparkles,
  Download,
  Loader2,
  Calendar,
  User,
  Activity,
  Zap,
  ShieldCheck,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  FileText,
  AlertCircle,
  Dumbbell,
  Scale,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORY_LIST: MetricCategory[] = [
  "general",
  "composition",
  "water",
  "bone",
  "metabolic",
  "control",
];

export function AthleteForm() {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>("general");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Roster & Longitudinal Progress Tracking State
  const [rosterAthletes, setRosterAthletes] = useState<AthleteWithAssessments[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteWithAssessments | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [isFetchingRoster, setIsFetchingRoster] = useState<boolean>(true);

  const fetchRoster = async () => {
    setIsFetchingRoster(true);
    try {
      const res = await fetch("/api/athletes");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setRosterAthletes(json.data);
          // If no athlete is currently selected, pick the first one by default
          if (!selectedAthlete && json.data.length > 0) {
            handleSelectRosterAthlete(json.data[0]);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load roster athletes:", e);
    } finally {
      setIsFetchingRoster(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleSelectRosterAthlete = (athlete: AthleteWithAssessments) => {
    setSelectedAthlete(athlete);

    // Auto-populate demographic form fields
    setValue("fullName", athlete.fullName, { shouldValidate: true });
    setValue("gender", athlete.gender, { shouldValidate: true });
    setValue("birthDateJalali", athlete.birthDateJalali, { shouldValidate: true });
    setValue("selfieDataUrl", athlete.selfieUrl ?? null);

    // If athlete has assessments, load the latest assessment metrics
    if (athlete.assessments && athlete.assessments.length > 0) {
      const latestAss = athlete.assessments[athlete.assessments.length - 1];
      setSelectedAssessmentId(latestAss.id);

      const metricMap = (latestAss.metrics || {}) as Record<string, number | string>;
      for (const m of METRICS_CONFIG) {
        const val = metricMap[m.key];
        if (val !== undefined && val !== null) {
          setValue(`metrics.${m.key}` as any, val, { shouldDirty: true });
          setValue(`enabledMetrics.${m.key}` as any, true, { shouldDirty: true });
        }
      }

      if (latestAss.aiReport) {
        setReport(latestAss.aiReport);
        setReportSource("stored-session");
      }
    }
  };

  const handleSelectAssessment = (assessment: AssessmentRecord) => {
    setSelectedAssessmentId(assessment.id);
    const metricMap = (assessment.metrics || {}) as Record<string, number | string>;
    for (const m of METRICS_CONFIG) {
      const val = metricMap[m.key];
      if (val !== undefined && val !== null) {
        setValue(`metrics.${m.key}` as any, val, { shouldDirty: true });
        setValue(`enabledMetrics.${m.key}` as any, true, { shouldDirty: true });
      }
    }
    if (assessment.aiReport) {
      setReport(assessment.aiReport);
      setReportSource("stored-session");
    }
  };

  const handleNewAthleteClick = () => {
    setSelectedAthlete(null);
    setSelectedAssessmentId(null);
    reset({
      fullName: "",
      gender: "MALE",
      birthDateJalali: "1385/01/01",
      discipline: "karate",
      selfieDataUrl: null,
      metrics: getDefaultMetricsValues(),
      enabledMetrics: getDefaultEnabledMetrics(),
    });
    setReport(null);
    setReportSource(null);
  };

  const handleRunComparativeAnalysis = async (
    prevAssessment: AssessmentRecord,
    currAssessment: AssessmentRecord
  ) => {
    setIsAnalyzing(true);
    setFormError(null);
    try {
      const prevMetrics = (prevAssessment.metrics || {}) as Record<string, number | string>;
      const currMetrics = (currAssessment.metrics || {}) as Record<string, number | string>;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: selectedAthlete ? selectedAthlete.fullName : watchedFullName,
          gender: selectedAthlete ? selectedAthlete.gender : watchedGender,
          age: calculatedAge ?? 20,
          birthDateJalali: selectedAthlete ? selectedAthlete.birthDateJalali : birthDateJalali,
          discipline: watchedDiscipline,
          metrics: currMetrics,
          measuredAt: currAssessment.measuredAt,
          previousAssessment: {
            measuredAt: prevAssessment.measuredAt,
            metrics: prevMetrics,
          },
          clubName: "باشگاه کاراته شرکت برق منطقه ای خراسان",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در پردازش تحلیل مقایسه‌ای");
      }

      const resData = await response.json();
      setReport(resData.report);
      setReportSource(resData.source);

      // Scroll smoothly to report card
      setTimeout(() => {
        const el = document.getElementById("ai-report-view");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "خطا در اجرای تحلیل مقایسه‌ای");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      fullName: "سجاد کریمی",
      gender: "MALE",
      birthDateJalali: "1381/04/10",
      discipline: "karate",
      selfieDataUrl: null,
      metrics: getDefaultMetricsValues(),
      enabledMetrics: getDefaultEnabledMetrics(),
    },
    mode: "onBlur",
  });

  const birthDateJalali = watch("birthDateJalali");
  const watchedDiscipline = watch("discipline");
  const watchedMetrics = watch("metrics");
  const watchedEnabledMetrics = watch("enabledMetrics");
  const watchedFullName = watch("fullName");
  const watchedGender = watch("gender");
  const watchedSelfie = watch("selfieDataUrl");

  // Toggle handlers for individual metrics and categories
  const toggleMetric = (key: string) => {
    const isCurrentlyOn = watchedEnabledMetrics?.[key] !== false;
    setValue(`enabledMetrics.${key}`, !isCurrentlyOn, { shouldDirty: true });
  };

  const setCategoryMetricsEnabled = (category: MetricCategory, enabled: boolean) => {
    const catMetrics = METRICS_CONFIG.filter((m) => m.category === category);
    for (const m of catMetrics) {
      setValue(`enabledMetrics.${m.key}`, enabled, { shouldDirty: true });
    }
  };

  const setAllMetricsEnabled = (enabled: boolean) => {
    for (const m of METRICS_CONFIG) {
      setValue(`enabledMetrics.${m.key}`, enabled, { shouldDirty: true });
    }
  };

  // Exact age calculated reactively from Jalali birthdate in useEffect
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  useEffect(() => {
    setCalculatedAge(calculateAgeFromJalali(birthDateJalali ?? ""));
  }, [birthDateJalali]);

  const isAgeValid = calculatedAge !== null && calculatedAge >= 10 && calculatedAge <= 50;

  // Real-time KPI summaries for the martial arts HUD
  const liveStats = useMemo(() => {
    const isWeightOn = watchedEnabledMetrics?.weight !== false;
    const isBmiOn = watchedEnabledMetrics?.bmi !== false;
    const isFatOn = watchedEnabledMetrics?.bodyFatPercentage !== false;
    const isMuscleOn = watchedEnabledMetrics?.musclePercentage !== false;
    const isWaterOn = watchedEnabledMetrics?.bodyWaterPercentage !== false;
    const isScoreOn = watchedEnabledMetrics?.bodyScore !== false;

    const weight = isWeightOn && watchedMetrics?.weight !== undefined && watchedMetrics?.weight !== ""
      ? Number(watchedMetrics.weight)
      : null;
    const bmi = isBmiOn && watchedMetrics?.bmi !== undefined && watchedMetrics?.bmi !== ""
      ? Number(watchedMetrics.bmi)
      : null;
    const bodyFat = isFatOn && watchedMetrics?.bodyFatPercentage !== undefined && watchedMetrics?.bodyFatPercentage !== ""
      ? Number(watchedMetrics.bodyFatPercentage)
      : null;
    const muscle = isMuscleOn && watchedMetrics?.musclePercentage !== undefined && watchedMetrics?.musclePercentage !== ""
      ? Number(watchedMetrics.musclePercentage)
      : null;
    const water = isWaterOn && watchedMetrics?.bodyWaterPercentage !== undefined && watchedMetrics?.bodyWaterPercentage !== ""
      ? Number(watchedMetrics.bodyWaterPercentage)
      : null;
    const score = isScoreOn && watchedMetrics?.bodyScore !== undefined && watchedMetrics?.bodyScore !== ""
      ? Number(watchedMetrics.bodyScore)
      : null;

    let kumiteIndex = "انفجاری";
    if (bodyFat !== null && bodyFat > 16) kumiteIndex = "نیاز به چربی‌سوزی";
    else if (muscle !== null && muscle > 80) kumiteIndex = "کلاس جهانی (WKF)";
    else if (muscle === null && bodyFat === null) kumiteIndex = "سنجش اختصاصی";

    return {
      weight,
      bmi,
      bodyFat,
      muscle,
      water,
      score,
      kumiteIndex,
      isWeightOn,
      isBmiOn,
      isFatOn,
      isMuscleOn,
      isWaterOn,
      isScoreOn,
    };
  }, [watchedMetrics, watchedEnabledMetrics]);

  const handleApplyPreset = (presetIndex: number) => {
    const preset = PRESET_ATHLETES[presetIndex];
    if (!preset) return;

    reset({
      fullName: preset.fullName,
      gender: preset.gender,
      birthDateJalali: preset.birthDateJalali,
      discipline: watchedDiscipline || "karate",
      selfieDataUrl: watchedSelfie,
      metrics: {
        ...getDefaultMetricsValues(),
        ...preset.metrics,
      },
      enabledMetrics: getDefaultEnabledMetrics(),
    });
    setReport(null);
    setFormError(null);
  };

  const onSubmit = async (data: AthleteFormValues) => {
    setFormError(null);

    const age = calculateAgeFromJalali(data.birthDateJalali);
    if (age === null) {
      setFormError("تاریخ تولد شمسی وارد شده معتبر نیست. (مثال: ۱۳۸۲/۰۵/۱۴)");
      return;
    }

    if (age < 10 || age > 50) {
      setFormError(
        `سن ورزشکار (${age} سال) خارج از رده مجاز باشگاه (۱۰ تا ۵۰ سال) است.`
      );
      return;
    }

    // Filter only enabled metrics that were measured/applied
    const enabledMap = data.enabledMetrics ?? {};
    const appliedMetrics: Record<string, number | string> = {};
    for (const [key, val] of Object.entries(data.metrics)) {
      if (enabledMap[key] !== false && val !== undefined && val !== null && val !== "") {
        appliedMetrics[key] = val;
      }
    }

    if (Object.keys(appliedMetrics).length === 0) {
      setFormError("حداقل یک فاکتور از شاخص‌های بدنی باید در حالت «اعمال شده» قرار داشته باشد.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Check for previous assessment to provide comparative progression analysis
      const prevAss =
        selectedAthlete && selectedAthlete.assessments && selectedAthlete.assessments.length > 0
          ? selectedAthlete.assessments[0]
          : undefined;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          gender: data.gender,
          age,
          birthDateJalali: data.birthDateJalali,
          discipline: data.discipline,
          metrics: appliedMetrics,
          previousAssessment: prevAss
            ? {
                measuredAt: prevAss.measuredAt,
                metrics: prevAss.metrics as Record<string, number | string>,
              }
            : undefined,
          clubName: "باشگاه کاراته شرکت برق منطقه ای خراسان",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در پردازش هوش مصنوعی");
      }

      const resData = await response.json();
      setReport(resData.report);
      setReportSource(resData.source);

      // Async background DB record persistence with athlete linkage
      fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          athleteId: selectedAthlete?.id,
          metrics: appliedMetrics,
          aiReport: resData.report,
        }),
      })
        .then(() => fetchRoster())
        .catch((e) => console.log("DB sync note:", e));

      // Scroll smoothly to report card
      setTimeout(() => {
        const el = document.getElementById("ai-report-view");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "خطای ناشناخته در برقراری ارتباط"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report || !calculatedAge) return;

    // Filter only applied metrics for PDF document
    const enabledMap = watchedEnabledMetrics ?? {};
    const appliedMetrics: Record<string, number | string> = {};
    for (const [key, val] of Object.entries(watchedMetrics ?? {})) {
      if (enabledMap[key] !== false && val !== undefined && val !== null && val !== "") {
        appliedMetrics[key] = val;
      }
    }

    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: watchedFullName,
          gender: watchedGender,
          age: calculatedAge,
          birthDateJalali,
          discipline: watchedDiscipline,
          metrics: appliedMetrics,
          selfieDataUrl: watchedSelfie,
          report,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در تولید سند PDF در سرور");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `شناسنامه-آنالیز-بدنی-${watchedFullName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در دانلود فایل PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [isExportingSample, setIsExportingSample] = useState(false);

  const handleDownloadSamplePdf = async () => {
    setIsExportingSample(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE_ATHLETE_EXPORT),
      });

      if (!response.ok) {
        throw new Error("خطا در صدور فایل PDF نمونه");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `شناسنامه-نمونه-سجاد_کریمی-Sample.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در دانلود فایل PDF نمونه");
    } finally {
      setIsExportingSample(false);
    }
  };

  const handleLoadSampleData = () => {
    reset({
      fullName: SAMPLE_ATHLETE_EXPORT.fullName,
      gender: SAMPLE_ATHLETE_EXPORT.gender,
      birthDateJalali: SAMPLE_ATHLETE_EXPORT.birthDateJalali,
      selfieDataUrl: SAMPLE_ATHLETE_EXPORT.selfieDataUrl,
      metrics: SAMPLE_ATHLETE_EXPORT.metrics,
      enabledMetrics: getDefaultEnabledMetrics(),
    });
    setReport(SAMPLE_ATHLETE_EXPORT.report);
    setReportSource("sample-data");
    setFormError(null);
  };

  const currentCategoryMetrics = useMemo(() => {
    return METRICS_CONFIG.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-8">
      {/* 1. Karate Class Roster & Avatar Selector */}
      <KarateRosterSelector
        athletes={rosterAthletes}
        selectedAthleteId={selectedAthlete?.id}
        onSelectAthlete={handleSelectRosterAthlete}
        onNewAthleteClick={handleNewAthleteClick}
        isLoading={isFetchingRoster}
      />

      {/* 2. Interactive Time-Series Progress Chart & Session History */}
      {selectedAthlete && (
        <AthleteProgressChart
          athlete={selectedAthlete}
          selectedAssessmentId={selectedAssessmentId ?? undefined}
          onSelectAssessment={handleSelectAssessment}
          onRunComparativeAnalysis={handleRunComparativeAnalysis}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Preset Quick-Picker & Sample Export Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                داده‌های آزمایشی و صدور آنی PDF نمونه (Sample Data & Instant PDF Export)
              </span>
              <span className="text-[11px] text-slate-400 block font-sans">
                Fast test pipeline with complete mock athlete biometrics & conditioning analysis
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handleDownloadSamplePdf}
              disabled={isExportingSample}
            >
              {isExportingSample ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              صدور مستقیم PDF نمونه (Export Sample PDF)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSampleData}
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              بارگذاری در فرم (Populate Form)
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">
            پروفایل‌های رده‌ای کاراته (Athlete Presets):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_ATHLETES.map((preset, idx) => (
              <button
                key={preset.titleFa}
                type="button"
                onClick={() => handleApplyPreset(idx)}
                className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-emerald-500 hover:bg-emerald-950/40 hover:text-emerald-300 active:scale-95 cursor-pointer"
              >
                {preset.titleFa}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Realtime Karate Biometrics HUD */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isWeightOn
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">وزن فعلی / Weight</span>
            <Scale className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.isWeightOn && liveStats.weight !== null ? (
              <>
                {liveStats.weight}{" "}
                <span className="text-xs font-normal text-slate-400">kg</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400/90">
            {liveStats.isWeightOn ? "WKF Division Align" : "اندازه‌گیری نشده"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isBmiOn
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">شاخص BMI / Ratio</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.isBmiOn && liveStats.bmi !== null ? (
              liveStats.bmi
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-cyan-400/90">
            {liveStats.isBmiOn && liveStats.bmi !== null
              ? liveStats.bmi < 18.5
                ? "کمبود وزن / Under"
                : liveStats.bmi < 25
                ? "مطلوب / Optimal"
                : "نیاز به بازنگری / Review"
              : "اندازه‌گیری نشده"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isMuscleOn
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">توده عضلانی / Muscle</span>
            <Dumbbell className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.isMuscleOn && liveStats.muscle !== null ? (
              <>
                {liveStats.muscle}
                <span className="text-xs font-normal text-slate-400">٪</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-amber-400/90">
            {liveStats.isMuscleOn ? "توان پیش‌ران / Drive" : "اندازه‌گیری نشده"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isFatOn
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">درصد چربی / Fat %</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.isFatOn && liveStats.bodyFat !== null ? (
              <>
                {liveStats.bodyFat}
                <span className="text-xs font-normal text-slate-400">٪</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-rose-400/90">
            {liveStats.isFatOn && liveStats.bodyFat !== null
              ? liveStats.bodyFat <= 13
                ? "استاندارد کومیته / Elite"
                : "بار مرده / High"
              : "اندازه‌گیری نشده"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isWaterOn
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">هیدراتاسیون / Water</span>
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.isWaterOn && liveStats.water !== null ? (
              <>
                {liveStats.water}
                <span className="text-xs font-normal text-slate-400">٪</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-sky-400/90">
            {liveStats.isWaterOn ? "ریکاوری / Recovery" : "اندازه‌گیری نشده"}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
            liveStats.isScoreOn
              ? "border-emerald-500/30 bg-emerald-950/20"
              : "border-slate-800/50 bg-slate-950/30 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-semibold">امتیاز بدن / Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-300">
            {liveStats.isScoreOn && liveStats.score !== null ? (
              <>
                {liveStats.score}{" "}
                <span className="text-xs font-normal text-emerald-400/70">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">عدم اعمال</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold truncate">
            {liveStats.isScoreOn ? liveStats.kumiteIndex : "اندازه‌گیری نشده"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Athlete Identification & Live Selfie */}
        <Card className="overflow-hidden border-slate-800">
          <CardHeader className="bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <User className="h-5 w-5 text-emerald-400" />
                  اطلاعات هویتی و عکس سلفی ورزشکار (Athlete Identity & Live Selfie)
                </CardTitle>
                <CardDescription>
                  ثبت مشخصات شناسنامه‌ای و محاسبه برخط سن بیولوژیکی • Personal identity and automatic age resolution
                </CardDescription>
              </div>
              <Badge variant="secondary">گام ۱ از ۲ • Step 1/2</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-12 items-start pt-6">
            <div className="space-y-4 md:col-span-7">
              <div>
                <Label htmlFor="fullName">نام و نام خانوادگی ورزشکار / Athlete Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="مثال: سجاد کریمی (Sajad Karimi)"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="discipline">رشته ورزشی و دامنه گزارش تحلیلی / Sport Discipline & Analysis Domain</Label>
                <Select id="discipline" {...register("discipline")}>
                  {SPORT_DISCIPLINES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.labelFa} ({item.labelEn}) — {item.coachTitleFa}
                    </option>
                  ))}
                </Select>
                {errors.discipline && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.discipline.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">جنسیت / Gender</Label>
                  <Select id="gender" {...register("gender")}>
                    <option value="MALE">مرد (بخش آقایان) / Male</option>
                    <option value="FEMALE">زن (بخش بانوان) / Female</option>
                  </Select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthDateJalali">
                    تاریخ تولد شمسی (YYYY/MM/DD) / Jalali Birthdate
                  </Label>
                  <div className="relative">
                    <Input
                      id="birthDateJalali"
                      {...register("birthDateJalali")}
                      placeholder="۱۳۸۲/۰۵/۱۴"
                      dir="ltr"
                      className="text-left font-mono"
                    />
                    <Calendar className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                  {errors.birthDateJalali && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.birthDateJalali.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Age Resolution Feedback Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    محاسبه دقیق سن از تقویم جلالی / Exact Resolved Age:
                  </span>
                  {calculatedAge !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {calculatedAge} سال تمام (Yrs)
                      </span>
                      {isAgeValid ? (
                        <Badge variant="default">رده مجاز باشگاه (۱۰ تا ۵۰) / Valid</Badge>
                      ) : (
                        <Badge variant="destructive">خارج از محدوده مجاز / Out of Range</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      تاریخ تولد معتبر وارد کنید (Enter valid Jalali birthdate)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Webcam / Portrait Capture on the right */}
            <div className="md:col-span-5">
              <Label className="mb-2">عکس زنده با وب‌کم (یا آپلود تصویر) / Live Selfie or Portrait</Label>
              <Controller
                control={control}
                name="selfieDataUrl"
                render={({ field }) => (
                  <SelfieCapture
                    value={field.value}
                    onChange={(val) => setValue("selfieDataUrl", val)}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Dynamic Schema Registry (25 Xiaomi S400 Metrics) */}
        <Card className="border-slate-800">
          <CardHeader className="bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>
                  <Activity className="h-5 w-5 text-cyan-400" />
                  ثبت ۲۵ شاخص تله‌متری آنالایزر Xiaomi S400 (Biometrics Registry)
                </CardTitle>
                <CardDescription>
                  ثبت پویا بر پایه معماری طرحواره باز • Dynamic Registry & Extensible Telemetry (OCP)
                </CardDescription>
              </div>
              <Badge variant="secondary">گام ۲ از ۲ • Step 2/2</Badge>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              {CATEGORY_LIST.map((catKey) => {
                const config = CATEGORY_LABELS_FA[catKey];
                const catMetrics = METRICS_CONFIG.filter((m) => m.category === catKey);
                const count = catMetrics.length;
                const activeCount = catMetrics.filter(
                  (m) => watchedEnabledMetrics?.[m.key] !== false
                ).length;
                const isActive = activeCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveCategory(catKey)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{config.titleFa}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      ({config.titleEn.split(" ")[0]})
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isActive
                          ? "bg-emerald-800 text-white"
                          : activeCount > 0
                          ? "bg-slate-900 text-emerald-400"
                          : "bg-slate-900 text-slate-500"
                      }`}
                      title={`${activeCount} از ${count} فاکتور در حالت اعمال شده است`}
                    >
                      {activeCount}/{count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Category Description Banner with Category-Level Bulk Actions */}
            <div className="mb-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs text-slate-300 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-2.5">
                <div>
                  <div className="font-bold text-emerald-400 flex items-center gap-2">
                    <span>
                      {CATEGORY_LABELS_FA[activeCategory].titleFa} • {CATEGORY_LABELS_FA[activeCategory].titleEn}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {
                        currentCategoryMetrics.filter(
                          (m) => watchedEnabledMetrics?.[m.key] !== false
                        ).length
                      }{" "}
                      از {currentCategoryMetrics.length} فاکتور فعال
                    </Badge>
                  </div>
                  <div className="text-slate-300 mt-1">
                    {CATEGORY_LABELS_FA[activeCategory].descFa}
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                    {CATEGORY_LABELS_FA[activeCategory].descEn}
                  </div>
                </div>

                {/* Bulk Enable / Disable Buttons for Current Category */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCategoryMetricsEnabled(activeCategory, true)}
                    className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition-all hover:bg-emerald-900/50 active:scale-95 flex items-center gap-1"
                    title="اعمال تمام فاکتورهای این دسته"
                  >
                    <Check className="h-3 w-3" />
                    <span>اعمال همه فاکتورهای این دسته</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryMetricsEnabled(activeCategory, false)}
                    className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-all hover:bg-slate-700 active:scale-95 flex items-center gap-1"
                    title="عدم اعمال و خروج تمام فاکتورهای این دسته از سنجش"
                  >
                    <X className="h-3 w-3 text-rose-400" />
                    <span>عدم اعمال همه</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
                  برای هر فاکتور می‌توانید با دکمه اختصاصی، وضعیت اندازه‌گیری را تعیین کنید (اعمال شده / عدم اعمال):
                </span>
                <button
                  type="button"
                  onClick={() => setAllMetricsEnabled(true)}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer font-medium"
                >
                  اعمال تمام ۲۵ فاکتور
                </button>
              </div>
            </div>

            {/* Dynamically mapped inputs with Apply / Do Not Apply Toggles */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentCategoryMetrics.map((metric) => {
                const isEnabled = watchedEnabledMetrics?.[metric.key] !== false;
                const metricError = errors.metrics?.[metric.key]?.message;

                return (
                  <div
                    key={metric.key}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isEnabled
                        ? "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 shadow-sm"
                        : "border-dashed border-slate-800/60 bg-slate-950/40 opacity-70"
                    }`}
                  >
                    {/* Header: Factor Title + Interactive Apply / Do Not Apply Button */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <Label
                          htmlFor={metric.key}
                          className={`mb-0 transition-colors ${
                            isEnabled ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          <span className="font-semibold">{metric.labelFa}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {metric.nameEn}
                          </span>
                        </Label>
                      </div>

                      {/* Apply / Do Not Apply Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleMetric(metric.key)}
                        className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 ${
                          isEnabled
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                        title={
                          isEnabled
                            ? "کلیک برای عدم اعمال / حذف این فاکتور از ارزیابی"
                            : "کلیک برای اعمال و ثبت این فاکتور"
                        }
                      >
                        {isEnabled ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>اعمال شده</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5 text-rose-400" />
                            <span className="text-slate-300">عدم اعمال</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Input Element or Unmeasured Box */}
                    {isEnabled ? (
                      <div>
                        {metric.isText ? (
                          <Select
                            id={metric.key}
                            {...register(`metrics.${metric.key}` as "metrics.weight")}
                            className="bg-slate-950/80"
                          >
                            <option value="">انتخاب تیپ بدنی / Select Type</option>
                            {metric.textOptions?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.labelFa}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <div>
                            <div className="relative">
                              <Input
                                id={metric.key}
                                type="number"
                                step={metric.step}
                                min={metric.min}
                                max={metric.max}
                                {...register(
                                  `metrics.${metric.key}` as "metrics.weight",
                                  { valueAsNumber: true }
                                )}
                                className="font-mono bg-slate-950/80"
                              />
                              {metric.unit && (
                                <span className="pointer-events-none absolute left-3 top-2.5 text-xs font-mono text-emerald-400/90">
                                  {metric.unit}
                                </span>
                              )}
                            </div>
                            {metric.standardRange && (
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>دامنه مطلوب / Optimal:</span>
                                <span>
                                  {metric.standardRange.min} - {metric.standardRange.max}{" "}
                                  {metric.unit}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {metricError && (
                          <p className="mt-1 text-xs text-rose-400">{metricError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800/80 bg-slate-950/70 p-3 text-center my-0.5">
                        <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                          <X className="h-3.5 w-3.5 text-slate-500" />
                          <span>فاکتور اندازه‌گیری نشده (فاقد داده)</span>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          Not Measured • Excluded from Assessment & PDF
                        </span>
                      </div>
                    )}

                    {metric.karateContext && isEnabled && (
                      <p className="mt-2 text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {metric.karateContext}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Category Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <button
                type="button"
                disabled={activeCategory === CATEGORY_LIST[0]}
                onClick={() => {
                  const currIdx = CATEGORY_LIST.indexOf(activeCategory);
                  if (currIdx > 0) setActiveCategory(CATEGORY_LIST[currIdx - 1]);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
                دسته قبلی / Previous
              </button>
              <button
                type="button"
                disabled={activeCategory === CATEGORY_LIST[CATEGORY_LIST.length - 1]}
                onClick={() => {
                  const currIdx = CATEGORY_LIST.indexOf(activeCategory);
                  if (currIdx < CATEGORY_LIST.length - 1)
                    setActiveCategory(CATEGORY_LIST[currIdx + 1]);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                دسته بعدی / Next
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {formError && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <p>{formError}</p>
          </div>
        )}

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleDownloadSamplePdf}
            disabled={isExportingSample}
            className="w-full sm:w-auto"
          >
            {isExportingSample ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-amber-400" />
            )}
            صدور PDF نمونه (Export Sample PDF)
          </Button>

          <Button
            type="submit"
            disabled={isAnalyzing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال پردازش هوش مصنوعی... Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                اجرای آنالیز هوشمند کاراته / Run AI Analysis
              </>
            )}
          </Button>

          {report && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال صدور PDF... Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  دانلود شناسنامه رسمی (PDF) / Download Report
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* AI Karate Conditioning Report Display */}
      {report && (
        <Card
          id="ai-report-view"
          className="border-emerald-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl shadow-emerald-950/20"
        >
          <CardHeader className="border-b border-emerald-500/20 bg-emerald-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-emerald-300">
                  <Award className="h-5 w-5 text-emerald-400" />
                  تحلیل تخصصی مربی ارشد بدنسازی کاراته (Elite Karate Conditioning Coach Analysis)
                </CardTitle>
                <CardDescription className="text-slate-300">
                  باشگاه کاراته شرکت برق منطقه ای خراسان • Khorasan Regional Electric Karate Club • Llama-3 AI Engine
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  {reportSource?.includes("comparative") ? "تحلیل مقایسه‌ای پیشرفت • Groq Llama-3" : reportSource === "groq-llama-3" ? "Groq Llama-3" : "الگوریتم تخصصی کاراته / Karate Engine"}
                </Badge>
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                >
                  <FileText className="h-4 w-4" />
                  دریافت نسخه چاپی PDF / Print PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap font-sans text-sm leading-8 text-slate-200">
              {report}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
