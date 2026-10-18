"use client";

import React from "react";
import { Moon, Sun, Plus, Radio } from "lucide-react";
import { useAppStore, type DashboardView } from "@/core/store/use-app-store";
import { useThemeStore } from "@/core/store/use-theme-store";
import { ENTERPRISE_NAV_ITEMS } from "../config/navigation";

export function StickyHeader() {
  const { activeView, setActiveView } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6">
      {/* Right: Organization Brand */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] p-1">
          <img
            src="/images/krec-logo.png"
            alt="KREC"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col text-right">
          <div className="text-sm font-bold text-[var(--text-primary)]">
            باشگاه کاراته شرکت برق منطقه ای خراسان
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            سامانه پایش ترکیب بدنی و آنالیز عملکرد ورزشی
          </div>
        </div>
      </div>

      {/* Center: Clean Navigation Tabs */}
      <nav className="hidden xl:flex items-center gap-1 rounded-lg bg-[var(--bg-app)] p-1 border border-[var(--border-subtle)]">
        {ENTERPRISE_NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600" : "text-[var(--text-muted)]"}`} />
              <span>{item.labelFa}</span>
            </button>
          );
        })}
      </nav>

      {/* Left: Hardware Status, New Test Action, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px]">Xiaomi S400: آماده</span>
        </div>

        <button
          type="button"
          onClick={() => setActiveView("assessment")}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>ثبت آزمون جدید</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title={theme === "dark" ? "تم روشن" : "تم تاریک"}
          aria-label="تغییر تم"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
