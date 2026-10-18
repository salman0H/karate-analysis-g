"use client";

import React, { useState, useMemo } from "react";
import { KARATE_CONDITIONING_STANDARDS, type AgeConditioningStandard } from "../data/conditioning-standards";
import { MarkdownRenderer } from "@/features/markdown/components/markdown-renderer";
import { Award, Filter, ShieldCheck, Flame, Scale, Activity, FileText } from "lucide-react";

export function ConditioningStandardsView() {
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"visual" | "markdown">("visual");

  const filteredStandards = useMemo(() => {
    if (selectedRange === "all") return KARATE_CONDITIONING_STANDARDS;
    return KARATE_CONDITIONING_STANDARDS.filter((s) => s.ageRange === selectedRange);
  }, [selectedRange]);

  // Generate real Markdown table for coaches
  const generatedMarkdownTable = useMemo(() => {
    let md = "# جدول مبنا و استانداردهای آمادگی جسمانی و ترکیب بدنی کاراته (رده سنی ۸ تا ۷۰ سال)\n\n";
    md += "پایگاه سنجش و ارتقای عملکرد قهرمانی • باشگاه کاراته شرکت سهامی برق منطقه‌ای خراسان\n\n";
    md += "| رده سنی | دسته مسابقاتی | درصد چربی کومیته | درصد چربی کاتا | درصد عضلات اسکلتی | توان بی‌هوازی (W/kg) | اکسیژن بیشینه VO2Max | پلانک هسته بدن | منبع پژوهشی |\n";
    md += "| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n";

    filteredStandards.forEach((s) => {
      md += `| ${s.ageRange} سال | ${s.categoryFa} | ${s.kumiteBodyFatPct.min} - ${s.kumiteBodyFatPct.max}٪ | ${s.kataBodyFatPct.min} - ${s.kataBodyFatPct.max}٪ | ${s.muscleMassPct.min} - ${s.muscleMassPct.max}٪ | ${s.anaerobicPowerWkg} | ${s.vo2MaxRange} | ${s.corePlankSec} | ${s.scientificRef} |\n`;
    });

    md += "\n## پروتکل‌های پیشگیری از آسیب و اولویت‌های بیومکانیک:\n";
    filteredStandards.forEach((s) => {
      md += `• **رده ${s.ageRange} سال (${s.categoryFa}):** ${s.injuryPreventionNote} • *اولویت حرکتی:* ${s.biomechanicalPriority}\n`;
    });

    return md;
  }, [filteredStandards]);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              استانداردهای مبنای آمادگی جسمانی و فیزیولوژی کاراته (۸ تا ۷۰ سال)
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            جدول شاخص‌های هنجاری ترکیب بدنی، توان بی‌هوازی، $VO_2Max$ و بیومکانیک بر مبنای منابع آزمایشگاهی WKF (پژوهش‌های Loturco، Benosmane، Camomilla)
          </p>
        </div>

        {/* Filter and Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Age Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-primary)]">
            <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">تمام رده‌های سنی (۸ تا ۷۰ سال)</option>
              {KARATE_CONDITIONING_STANDARDS.map((s) => (
                <option key={s.ageRange} value={s.ageRange}>
                  {s.ageRange} سال ({s.categoryFa})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("visual")}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "visual"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              نمایش کارت‌های بصری
            </button>
            <button
              type="button"
              onClick={() => setViewMode("markdown")}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "markdown"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              جدول مارک‌داون
            </button>
          </div>
        </div>
      </div>

      {/* Visual Cards View */}
      {viewMode === "visual" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStandards.map((std) => (
            <div
              key={std.ageRange}
              className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs hover:border-[var(--border-default)] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono text-xs border border-emerald-200">
                      {std.ageRange}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {std.categoryFa}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--text-muted)]">
                        {std.categoryEn}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700 border border-slate-200">
                    {std.minAge} - {std.maxAge} سال
                  </span>
                </div>

                {/* Normative Metrics Grid */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">چربی کومیته (WKF)</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {std.kumiteBodyFatPct.min}٪ - {std.kumiteBodyFatPct.max}٪
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">چربی کاتا (پایداری)</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {std.kataBodyFatPct.min}٪ - {std.kataBodyFatPct.max}٪
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">درصد توده عضلانی</span>
                    <span className="font-bold text-emerald-700">
                      {std.muscleMassPct.min}٪ - {std.muscleMassPct.max}٪
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">توان بی‌هوازی</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">
                      {std.anaerobicPowerWkg}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">اکسیژن بیشینه VO2Max</span>
                    <span className="font-bold text-cyan-700 dark:text-cyan-400">
                      {std.vo2MaxRange}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] p-2 border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">استقامت هسته (پلانک)</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {std.corePlankSec}
                    </span>
                  </div>
                </div>

                {/* Biomechanical Priority */}
                <div className="mt-3.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--text-primary)] block mb-0.5">
                    اولویت بیومکانیکی:
                  </span>
                  {std.primaryFocusFa}
                </div>
              </div>

              {/* Research Citation & Injury Note */}
              <div className="mt-3 space-y-1.5">
                <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-2 text-[11px] text-amber-900 leading-normal">
                  <span className="font-semibold block text-amber-950">مراقبت ویژه آسیب:</span>
                  {std.injuryPreventionNote}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono">
                  منبع مرجع: {std.scientificRef}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Markdown Table View */}
      {viewMode === "markdown" && (
        <MarkdownRenderer
          title="جدول مارک‌داون هنجارهای آمادگی جسمانی کاراته"
          content={generatedMarkdownTable}
        />
      )}
    </div>
  );
}
