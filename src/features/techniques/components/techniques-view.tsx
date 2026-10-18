"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  KARATE_TECHNIQUES,
  KYOKUSHIN_NATURAL_WEAPONS,
  KYOKUSHIN_DOJOKUN,
  KYOKUSHIN_BELT_SYSTEM,
  BLACK_BELT_MAG_RESEARCH,
  type TechniqueCategory,
  type KarateTechnique,
} from "../data/techniques-data";
import { TechniqueDiagram } from "./technique-diagram";
import { MarkdownRenderer } from "@/features/markdown/components/markdown-renderer";
import {
  Search,
  BookOpen,
  Shield,
  Award,
  Zap,
  ExternalLink,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  ScrollText,
} from "lucide-react";

type MainTab = "stances" | "weapons" | "dojokun" | "belts" | "research" | "markdown";

export function TechniquesView() {
  const [activeTab, setActiveTab] = useState<MainTab>("stances");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeWeaponType, setActiveWeaponType] = useState<"all" | "hand" | "foot">("all");

  // Filter stances & techniques
  const filteredTechniques = useMemo(() => {
    return KARATE_TECHNIQUES.filter((tech) => {
      const matchesCat = activeCategory === "all" || tech.category === activeCategory;
      if (!matchesCat) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        tech.romaji.toLowerCase().includes(term) ||
        tech.nameFa.toLowerCase().includes(term) ||
        tech.kanji.includes(term) ||
        tech.primaryMuscles.some((m) => m.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, activeCategory]);

  // Filter weapons
  const filteredWeapons = useMemo(() => {
    return KYOKUSHIN_NATURAL_WEAPONS.filter((w) => {
      const matchesType = activeWeaponType === "all" || w.category === activeWeaponType;
      if (!matchesType) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        w.nameFa.toLowerCase().includes(term) ||
        w.romaji.toLowerCase().includes(term) ||
        w.kanji.includes(term) ||
        w.contactSurfaceFa.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, activeWeaponType]);

  // Generate complete Markdown compilation
  const generatedMarkdownTable = useMemo(() => {
    let md = "# اطلس تخصصی کیوکوشین کاراته، سلاح‌های طبیعی و پژوهش‌های بیومکانیک\n\n";
    md += "منبع: جزوه معتبر کیوکوشین کای‌کان • پژوهش‌های نشریه Black Belt Magazine • پایگاه پایش عملکرد بدنی باشگاه برق منطقه‌ای خراسان\n\n";

    md += "## ۱. تکنیک‌ها و استقرارها (Stances & Techniques)\n\n";
    md += "| نام ژاپنی (Romaji) | کانجی | نام فارسی و رده | عضلات هدف اصلی | تحلیل بیومکانیک و زنجیره حرکتی | فاکتور تله‌متری S400 |\n";
    md += "| :--- | :---: | :--- | :--- | :--- | :--- |\n";
    filteredTechniques.forEach((t) => {
      md += `| **${t.romaji}** | ${t.kanji} | ${t.nameFa} (${t.categoryFa}) | ${t.primaryMuscles.join("، ")} | ${t.biomechanicsFa} | ${t.s400FactorRequired} |\n`;
    });

    md += "\n\n## ۲. سلاح‌های طبیعی دست و پا (Natural Weapons)\n\n";
    md += "| نام ژاپنی | کانجی | نام فارسی | ساختار آناتومیک | سطح اصابت | اهداف حیاتی | قانون ولف و تقویت استخوان |\n";
    md += "| :--- | :---: | :--- | :--- | :--- | :--- | :--- |\n";
    KYOKUSHIN_NATURAL_WEAPONS.forEach((w) => {
      md += `| **${w.romaji}** | ${w.kanji} | ${w.nameFa} | ${w.anatomicalStructureFa} | ${w.contactSurfaceFa} | ${w.targetVulnerableZonesFa.join("، ")} | ${w.wolffsLawConditioningFa} |\n`;
    });

    md += "\n\n## ۳. سوگندنامه دوجو کیوکوشین (Dojokun)\n\n";
    KYOKUSHIN_DOJOKUN.forEach((d) => {
      md += `### اصل ${d.number}: ${d.romaji}\n`;
      md += `**کانجی ژاپنی**: ${d.japanese}\n\n`;
      md += `**ترجمه فارسی**: ${d.translationFa}\n\n`;
      md += `**مفهوم فلسفی**: ${d.philosophicalMeaningFa}\n\n---\n\n`;
    });

    md += "\n\n## ۴. پژوهش‌های علمی نشریه Black Belt Magazine\n\n";
    BLACK_BELT_MAG_RESEARCH.forEach((r) => {
      md += `### ${r.titleFa} (${r.titleEn})\n`;
      md += `**مرجع**: ${r.authorOrRef} • [لینک منبع](${r.sourceUrl})\n\n`;
      md += `**مکانیسم بیومکانیک**: ${r.biomechanicsMechanismsFa}\n\n`;
      md += `**همبستگی با تله‌متری S400**: ${r.telemetryMetricCorrelationFa}\n\n`;
      md += "**یافته‌های کلیدی:**\n";
      r.keyTakeawaysFa.forEach((k) => {
        md += `- ${k}\n`;
      });
      md += "\n---\n\n";
    });

    return md;
  }, [filteredTechniques]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              دانشنامه اصیل کیوکوشین کاراته، سلاح‌های طبیعی و پژوهش‌های بیومکانیک
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            مستندسازی شده بر پایه جزوه معتبر کیوکوشین، آناتومی کاربردی، فلسفه سوگندنامه دوجو و مقالات علمی نشریه Black Belt Magazine
          </p>
        </div>

        {/* Primary Tab Selector */}
        <div className="flex flex-wrap items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 gap-1">
          {[
            { id: "stances", label: "اطلس استقرارها و تکنیک‌ها", icon: Layers },
            { id: "weapons", label: "سلاح‌های دست و پا (۲۰ سلاح)", icon: Shield },
            { id: "dojokun", label: "سوگندنامه دوجو و سوسای اویاما", icon: ScrollText },
            { id: "belts", label: "سیستم کمربندها و دان", icon: Award },
            { id: "research", label: "پژوهش‌های Black Belt Mag", icon: Zap },
            { id: "markdown", label: "سند مارک‌داون جامع", icon: ExternalLink },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STANCES & TECHNIQUES ATLAS */}
      {activeTab === "stances" && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "all", label: "همه موارد" },
                { key: "dachi", label: "استقرارها (داچی)" },
                { key: "tsuki", label: "ضربات دست (تسوکی)" },
                { key: "geri", label: "ضربات پا (گری)" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === cat.key
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام ژاپنی یا فارسی..."
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] py-1.5 pr-8 pl-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTechniques.map((technique) => (
              <div
                key={technique.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs hover:border-[var(--border-default)] transition-colors"
              >
                <div>
                  {/* Title & Japanese Terminology */}
                  <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {technique.nameFa}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                          {technique.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mt-1">
                        <span className="font-bold text-[var(--text-primary)]">{technique.romaji}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{technique.kanji}</span>
                        <span>•</span>
                        <span>{technique.katakana}</span>
                      </div>
                    </div>

                    <span className="rounded-md bg-[var(--bg-surface-elevated)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {technique.categoryFa}
                    </span>
                  </div>

                  {/* Authentic Handbook Image Component */}
                  <div className="mt-3.5">
                    <TechniqueDiagram technique={technique} />
                  </div>

                  {/* Biomechanics Description */}
                  <div className="mt-3.5 space-y-2 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">
                        اصول بیومکانیک و زنجیره حرکتی:
                      </span>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        {technique.biomechanicsFa}
                      </p>
                    </div>

                    {/* Primary Muscle Groups */}
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">
                        عضلات هدف و درگیر:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {technique.primaryMuscles.map((muscle, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* S400 Bioimpedance Dependency */}
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-[var(--text-primary)]">
                      <span className="font-bold block text-emerald-600">شاخص مورد نیاز دستگاه S400:</span>
                      {technique.s400FactorRequired}
                    </div>

                    {technique.scientificNotes && (
                      <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2 text-[11px] text-[var(--text-primary)] font-mono">
                        <span className="font-bold block text-indigo-500">سند آزمایشگاهی و پژوهشی:</span>
                        {technique.scientificNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Execution Tips */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block mb-1">
                    نکات کلیدی اجرای استادانه (شیهان):
                  </span>
                  <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                    {technique.executionTipsFa.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NATURAL WEAPONS (۲۰ سلاح طبیعی دست و پا) */}
      {activeTab === "weapons" && (
        <div className="space-y-5">
          {/* Header Description & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveWeaponType("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  activeWeaponType === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                }`}
              >
                همه سلاح‌ها (۲۰ مورد)
              </button>
              <button
                type="button"
                onClick={() => setActiveWeaponType("hand")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  activeWeaponType === "hand"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                }`}
              >
                سلاح‌های دست (۱۳ سلاح)
              </button>
              <button
                type="button"
                onClick={() => setActiveWeaponType("foot")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  activeWeaponType === "foot"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                }`}
              >
                سلاح‌های پا و ساق (۷ سلاح)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام سلاح یا استخوان..."
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] py-1.5 pr-8 pl-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Weapons Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWeapons.map((weapon) => (
              <div
                key={weapon.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs hover:border-[var(--border-default)] transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">
                        {weapon.nameFa}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] mt-0.5">
                        <span className="font-bold text-emerald-600">{weapon.romaji}</span>
                        <span>•</span>
                        <span>{weapon.kanji}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {weapon.categoryFa}
                    </span>
                  </div>

                  {/* Weapon Image Container */}
                  <div className="relative h-44 w-full my-3 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center p-2 overflow-hidden">
                    <Image
                      src={weapon.image}
                      alt={`${weapon.nameFa} - ${weapon.romaji}`}
                      fill
                      className="object-contain p-1"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>

                  {/* Anatomical & Contact Data */}
                  <div className="space-y-2 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">سطح تماس ضربه‌زننده:</span>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        {weapon.contactSurfaceFa}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[var(--text-primary)]">ساختار استخوانی آناتومیک:</span>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        {weapon.anatomicalStructureFa}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[var(--text-primary)]">اهداف حساس و آسیب‌پذیر:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {weapon.targetVulnerableZonesFa.map((zone, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-500 font-medium"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Wolff's Law Conditioning Box */}
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-[var(--text-primary)]">
                      <span className="font-bold text-amber-600 block">
                        تقویت بافت بر مبنای قانون ولف (Wolff&apos;s Law):
                      </span>
                      {weapon.wolffsLawConditioningFa}
                    </div>
                  </div>
                </div>

                {/* S400 Bioimpedance Correlation Footer */}
                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
                  <span>شاخص تراکم استخوان S400:</span>
                  <span className="text-emerald-600 font-bold">BMC &gt; 2.8 kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOJOKUN & SOSAI MAS OYAMA */}
      {activeTab === "dojokun" && (
        <div className="space-y-6">
          {/* Sosai Mas Oyama Hero Tribute */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
            <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-app)]">
              <Image
                src="/images/kyokushin/sosai-mas-oyama.png"
                alt="سوسای ماسوتاتسو اویاما بنیان‌گذار کیوکوشین کاراته"
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 350px"
                priority
              />
            </div>

            <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
              <div>
                <span className="rounded-md bg-emerald-500/10 text-emerald-600 px-2.5 py-1 text-xs font-bold border border-emerald-500/20">
                  بنیان‌گذار کیوکوشین کای‌کان • Sosai Masutatsu Oyama (۱۹۲۳ - ۱۹۹۴)
                </span>
                <h2 className="text-xl font-black text-[var(--text-primary)] mt-2">
                  طریقت حقیقت نهایی (کیوکوشین) و اصول بنیادین قدرت و اخلاق
                </h2>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2">
                  سوسای ماسوتاتسو اویاما با تلفیق تمرینات سخت کوهستانی، ریشه‌های اصیل گوکای و شوری‌ته و تدوین مبارزه فول‌کنتاکت، کیوکوشین را به عنوان «کاراته قوی‌ترین مردان جهان» پایه‌گذاری نمود. او معتقد بود قدرت جسمی بدون کنترل نفس و اخلاق، توحش است و اخلاق بدون قدرت، بی‌ثمر است.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">آزمون تامشی‌واری (Tameshiwari):</span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    شکستن اجسام سخت با سیکن، شوتو و تیغه پا جهت اثبات بیومکانیک انتقال تکانه و قانون ولف در متراکم‌سازی استخوان.
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">مبارزه ۱۰۰ نفره (100-Man Kumite):</span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    سخت‌ترین آزمون استقامت فیزیولوژیک و روانی تاریخ ورزش‌های رزمی با حریفان تازه در ۲ دقیقه متوالی.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 7 Dojokun Principles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                سوگندنامه هفت‌گانه دوجو (Dojokun - 道場訓)
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              نگاشته شده توسط سوسای اویاما و ایجی یوشیکاوا؛ قرائت الزامی در پایان هر جلسه تمرین با ادای احترام اوس (Osu)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {KYOKUSHIN_DOJOKUN.map((item) => (
                <div
                  key={item.number}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-2.5">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 text-xs font-bold border border-emerald-500/20">
                      اصل شماره {item.number}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Dojokun #{item.number}</span>
                  </div>

                  <p className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
                    {item.translationFa}
                  </p>

                  <div className="mt-2.5 space-y-1 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-app)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                    <p className="text-emerald-600 font-semibold">{item.japanese}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{item.romaji}</p>
                  </div>

                  <p className="mt-2.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <span className="font-bold text-[var(--text-primary)]">مفهوم فلسفی: </span>
                    {item.philosophicalMeaningFa}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BELT SYSTEM & PROGRESSION */}
      {activeTab === "belts" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              سلسله‌مراتب دان و فلسفه رنگ‌های کمربند در کیوکوشین کاراته
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            سفر تکامل کاراته‌کا از پاکی کمربند سفید تا خرد بی‌نهایت کمربند سیاه و مدارج استادی
          </p>

          <div className="space-y-3 mt-3">
            {KYOKUSHIN_BELT_SYSTEM.map((belt, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs gap-4"
              >
                <div className="flex items-center gap-3">
                  {/* Belt Visual Indicator */}
                  <div
                    className="h-10 w-24 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner border border-black/20 shrink-0"
                    style={{
                      backgroundColor: belt.colorHex,
                      color: belt.textColorHex,
                    }}
                  >
                    {belt.beltColorFa}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                      {belt.gradeFa} • {belt.rank}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {belt.symbolismFa}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs md:text-left shrink-0">
                  <div className="rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] px-3 py-1.5">
                    <span className="text-[10px] text-[var(--text-muted)] block">حداقل دوره تمرین:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{belt.minimumTrainingPeriodFa}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 max-w-sm">
                    <span className="text-[10px] text-emerald-600 font-bold block">الزامات فیزیولوژیک و کاتا:</span>
                    <span className="text-[11px] text-[var(--text-primary)]">{belt.biomechanicalRequirementsFa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BLACK BELT MAGAZINE BLOG RESEARCH */}
      {activeTab === "research" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  پژوهش‌های علمی نشریه معتبر Black Belt Magazine
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                استخراج شده از سری مقالات بیومکانیک و فیزیولوژی رزمی بلک بلت (blackbeltmag.com/blog)
              </p>
            </div>
            <a
              href="https://www.blackbeltmag.com/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline font-mono"
            >
              <span>مشاهده مقالات اصلی</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {BLACK_BELT_MAG_RESEARCH.map((article) => (
              <div
                key={article.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs hover:border-[var(--border-default)] transition-colors"
              >
                <div>
                  <div className="border-b border-[var(--border-subtle)] pb-3">
                    <span className="rounded-md bg-indigo-500/10 text-indigo-500 px-2 py-0.5 text-[10px] font-mono font-bold border border-indigo-500/20">
                      {article.authorOrRef}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mt-2">
                      {article.titleFa}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      {article.titleEn}
                    </p>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">
                        مکانیسم و تحلیل بیومکانیک:
                      </span>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        {article.biomechanicsMechanismsFa}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-1">
                        یافته‌های آزمایشگاهی و کاربردی:
                      </span>
                      <ul className="space-y-1.5">
                        {article.keyTakeawaysFa.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)]">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Telemetry Correlation Box */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-[var(--text-primary)]">
                    <span className="font-bold text-emerald-600 block mb-0.5">
                      فاکتور ارزیابی متناظر در ترازوی Xiaomi S400:
                    </span>
                    {article.telemetryMetricCorrelationFa}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MARKDOWN RENDERER */}
      {activeTab === "markdown" && (
        <MarkdownRenderer
          title="سند جامع اطلس بیومکانیک کیوکوشین کاراته، سلاح‌ها و پژوهش‌های علمی"
          content={generatedMarkdownTable}
        />
      )}
    </div>
  );
}
