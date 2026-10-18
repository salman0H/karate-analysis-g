"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { KarateTechnique } from "../data/techniques-data";
import { ZoomIn, Camera, Compass, X, ShieldCheck } from "lucide-react";

export function TechniqueDiagram({ technique }: { technique: KarateTechnique }) {
  const [activeView, setActiveView] = useState<"schematic" | "photo">(() => {
    return technique.imageSchematic ? "schematic" : "photo";
  });
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentImg =
    activeView === "schematic"
      ? technique.imageSchematic || technique.imagePhoto
      : technique.imagePhoto || technique.imageSchematic;

  const hasBoth = Boolean(technique.imageSchematic && technique.imagePhoto);

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 transition-all hover:border-[var(--border-default)]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>تصویر اصیل جزوه کیوکوشین</span>
          </div>

          {/* Toggle between Schematic Drawing and Master Execution Photo */}
          {hasBoth && (
            <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={() => setActiveView("schematic")}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeView === "schematic"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Compass className="h-3 w-3" />
                <span>طرح فنی</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("photo")}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeView === "photo"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Camera className="h-3 w-3" />
                <span>استاد شیهان</span>
              </button>
            </div>
          )}
        </div>

        {/* Authentic Image Container */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center p-2 group">
          {currentImg ? (
            <div
              className="relative h-full w-full flex items-center justify-center cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
              title="برای بزرگ‌نمایی تصویر جزوه کلیک کنید"
            >
              <Image
                src={currentImg}
                alt={`${technique.nameFa} - ${technique.romaji}`}
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />

              {/* Zoom Trigger Button Overlay */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-[var(--bg-surface-elevated)]/90 px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs opacity-80 hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
              >
                <ZoomIn className="h-3 w-3 text-emerald-600" />
                <span>بزرگ‌نمایی سند</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 text-[var(--text-muted)]">
              <Compass className="h-8 w-8 text-emerald-600/40 mb-1" />
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{technique.nameFa}</span>
              <span className="text-[10px] font-mono mt-0.5">سند کاتای تخصصی WKF</span>
            </div>
          )}
        </div>

        {/* Caption & Reference Footnote */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span>{technique.romaji}</span>
          <span className="text-emerald-700 font-bold">
            {activeView === "schematic" ? "تحلیل زاویه مفاصل و GRF" : "فرم استادانه و راستای تنه"}
          </span>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isZoomOpen && currentImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {technique.nameFa} • {technique.romaji}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  استخراج مستقیم از جزوه معتبر کیوکوشین کای‌کان کاراته
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative h-[65vh] w-full bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-center p-3">
              <Image
                src={currentImg}
                alt={`${technique.nameFa} High Resolution`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1000px"
                priority
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-3 flex items-center justify-between">
              {hasBoth && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("schematic")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                      activeView === "schematic"
                        ? "bg-emerald-600 text-white"
                        : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                    }`}
                  >
                    طراحی شماتیک جزوه
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("photo")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                      activeView === "photo"
                        ? "bg-emerald-600 text-white"
                        : "bg-[var(--bg-app)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                    }`}
                  >
                    عکس اجرای استاد
                  </button>
                </div>
              )}
              <span className="text-[11px] font-mono text-[var(--text-muted)] mr-auto">
                Kyokushin Illustrated Technical Standard
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
