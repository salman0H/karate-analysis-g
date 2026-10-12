"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  METRICS_CONFIG,
  CATEGORY_LABELS_FA,
  PRESET_ATHLETES,
  getDefaultMetricsValues,
  MetricCategory,
} from "@/config/metrics.config";
import {
  athleteFormSchema,
  AthleteFormValues,
} from "@/types/athlete";
import { calculateAgeFromJalali } from "@/lib/jalali";
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
      selfieDataUrl: null,
      metrics: getDefaultMetricsValues(),
    },
    mode: "onBlur",
  });

  const birthDateJalali = watch("birthDateJalali");
  const watchedMetrics = watch("metrics");
  const watchedFullName = watch("fullName");
  const watchedGender = watch("gender");
  const watchedSelfie = watch("selfieDataUrl");

  // Exact age calculated reactively from Jalali birthdate in useEffect
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  useEffect(() => {
    setCalculatedAge(calculateAgeFromJalali(birthDateJalali ?? ""));
  }, [birthDateJalali]);

  const isAgeValid = calculatedAge !== null && calculatedAge >= 10 && calculatedAge <= 50;

  // Real-time KPI summaries for the martial arts HUD
  const liveStats = useMemo(() => {
    const weight = Number(watchedMetrics?.weight) || 68;
    const bmi = Number(watchedMetrics?.bmi) || 22;
    const bodyFat = Number(watchedMetrics?.bodyFatPercentage) || 12;
    const muscle = Number(watchedMetrics?.musclePercentage) || 82;
    const water = Number(watchedMetrics?.bodyWaterPercentage) || 64;
    const score = Number(watchedMetrics?.bodyScore) || 90;

    let kumiteIndex = "انفجاری";
    if (bodyFat > 16) kumiteIndex = "نیاز به چربی‌سوزی";
    else if (muscle > 80) kumiteIndex = "کلاس جهانی (WKF)";

    return { weight, bmi, bodyFat, muscle, water, score, kumiteIndex };
  }, [watchedMetrics]);

  const handleApplyPreset = (presetIndex: number) => {
    const preset = PRESET_ATHLETES[presetIndex];
    if (!preset) return;

    reset({
      fullName: preset.fullName,
      gender: preset.gender,
      birthDateJalali: preset.birthDateJalali,
      selfieDataUrl: watchedSelfie,
      metrics: {
        ...getDefaultMetricsValues(),
        ...preset.metrics,
      },
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

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          gender: data.gender,
          age,
          birthDateJalali: data.birthDateJalali,
          metrics: data.metrics,
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

      // Async background DB record persistence (non-blocking)
      fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          aiReport: resData.report,
        }),
      }).catch((e) => console.log("DB sync note:", e));

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
          metrics: watchedMetrics,
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

  const currentCategoryMetrics = useMemo(() => {
    return METRICS_CONFIG.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-8">
      {/* Preset Quick-Picker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            پروفایل‌های پیش‌فرض کاراته (بارگذاری سریع جهت تست):
          </span>
        </div>
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

      {/* Realtime Karate Biometrics HUD */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">وزن فعلی</span>
            <Scale className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.weight}{" "}
            <span className="text-xs font-normal text-slate-400">کیلوگرم</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400/90">تراز رده وزنی</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">شاخص BMI</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.bmi}
          </div>
          <p className="mt-1 text-[11px] text-cyan-400/90">
            {liveStats.bmi < 18.5
              ? "کمبود وزن"
              : liveStats.bmi < 25
              ? "مطلوب رقابتی"
              : "نیاز به بازنگری"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">توده عضلانی</span>
            <Dumbbell className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.muscle}
            <span className="text-xs font-normal text-slate-400">٪</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-400/90">توان پیش‌رانش</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">درصد چربی</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.bodyFat}
            <span className="text-xs font-normal text-slate-400">٪</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-400/90">
            {liveStats.bodyFat <= 13 ? "استاندارد کومیته" : "بار مرده"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">هیدراتاسیون</span>
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-black text-white">
            {liveStats.water}
            <span className="text-xs font-normal text-slate-400">٪</span>
          </div>
          <p className="mt-1 text-[11px] text-sky-400/90">ریکاوری و تعادل</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-semibold">امتیاز بدن</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-300">
            {liveStats.score}{" "}
            <span className="text-xs font-normal text-emerald-400/70">از ۱۰۰</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold truncate">
            {liveStats.kumiteIndex}
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
                  اطلاعات هویتی و عکس سلفی ورزشکار
                </CardTitle>
                <CardDescription>
                  ثبت مشخصات شناسنامه‌ای و محاسبه برخط سن بیولوژیکی از روی تاریخ تولد شمسی
                </CardDescription>
              </div>
              <Badge variant="secondary">گام ۱ از ۲</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-12 items-start pt-6">
            <div className="space-y-4 md:col-span-7">
              <div>
                <Label htmlFor="fullName">نام و نام خانوادگی ورزشکار</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="مثال: سجاد کریمی"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">جنسیت</Label>
                  <Select id="gender" {...register("gender")}>
                    <option value="MALE">مرد (بخش آقایان)</option>
                    <option value="FEMALE">زن (بخش بانوان)</option>
                  </Select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthDateJalali">
                    تاریخ تولد شمسی (YYYY/MM/DD)
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
                    محاسبه دقیق سن از تقویم جلالی:
                  </span>
                  {calculatedAge !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {calculatedAge} سال تمام
                      </span>
                      {isAgeValid ? (
                        <Badge variant="default">رده مجاز باشگاه (۱۰ تا ۵۰)</Badge>
                      ) : (
                        <Badge variant="destructive">خارج از محدوده مجاز</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      تاریخ تولد معتبر وارد کنید
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Webcam / Portrait Capture on the right */}
            <div className="md:col-span-5">
              <Label className="mb-2">عکس زنده با وب‌کم (یا بارگذاری تصویر)</Label>
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
                  ثبت ۲۵ شاخص تله‌متری آنالایزر Xiaomi S400
                </CardTitle>
                <CardDescription>
                  ثبت پویا بر پایه معماری طرحواره باز (OCP) بدون هاردکد ستون‌های دیتابیس
                </CardDescription>
              </div>
              <Badge variant="secondary">گام ۲ از ۲</Badge>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              {CATEGORY_LIST.map((catKey) => {
                const config = CATEGORY_LABELS_FA[catKey];
                const count = METRICS_CONFIG.filter((m) => m.category === catKey).length;
                const isActive = activeCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveCategory(catKey)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{config.titleFa}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive
                          ? "bg-emerald-800 text-white"
                          : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-300">
              <span className="font-bold text-emerald-400">
                {CATEGORY_LABELS_FA[activeCategory].titleFa}:{" "}
              </span>
              {CATEGORY_LABELS_FA[activeCategory].descFa}
            </div>

            {/* Dynamically mapped inputs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentCategoryMetrics.map((metric) => (
                <div
                  key={metric.key}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor={metric.key} className="mb-0 text-slate-200">
                      {metric.labelFa}
                    </Label>
                    {metric.unit && (
                      <span className="text-[11px] font-mono text-emerald-400/90">
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  {metric.isText ? (
                    <Select
                      id={metric.key}
                      {...register(`metrics.${metric.key}` as "metrics.weight")}
                      className="bg-slate-950/80"
                    >
                      <option value="">انتخاب تیپ بدنی</option>
                      {metric.textOptions?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelFa}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <div>
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
                      {metric.standardRange && (
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>دامنه مطلوب:</span>
                          <span>
                            {metric.standardRange.min} - {metric.standardRange.max}{" "}
                            {metric.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {metric.karateContext && (
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {metric.karateContext}
                    </p>
                  )}
                </div>
              ))}
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
                دسته قبلی
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
                دسته بعدی
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
            type="submit"
            disabled={isAnalyzing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال پردازش آنالیز هوش مصنوعی...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                اجرای آنالیز هوشمند کاراته (Groq AI)
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
                  در حال صدور فایل PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  دانلود شناسنامه رسمی (PDF)
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
                  تحلیل تخصصی مربی ارشد بدنسازی کاراته (Elite Conditioning Coach)
                </CardTitle>
                <CardDescription className="text-slate-300">
                  باشگاه کاراته شرکت برق منطقه ای خراسان • موتور هوش مصنوعی Llama-3 (Groq SDK)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  {reportSource === "groq-llama-3" ? "Groq Llama-3" : "الگوریتم تخصصی کاراته"}
                </Badge>
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                >
                  <FileText className="h-4 w-4" />
                  دریافت نسخه چاپی PDF
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
