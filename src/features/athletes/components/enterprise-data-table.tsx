"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithAssessments } from "@/types/athlete";
import { WidgetErrorBoundary } from "@/core/error/error-boundary";
import { Skeleton } from "@/shared/components/skeleton";
import { useAppStore } from "@/core/store/use-app-store";
import { formatJalaliDisplay } from "@/lib/jalali";

interface TableColumn<T> {
  key: string;
  headerFa: string;
  headerEn: string;
  render: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export function EnterpriseDataTable({
  onSelectAthlete,
  onNewAssessment,
}: {
  onSelectAthlete?: (athlete: AthleteWithAssessments) => void;
  onNewAssessment?: (athlete: AthleteWithAssessments) => void;
}) {
  const { setActiveView } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const { data: athletes = [], isLoading } = useQuery<AthleteWithAssessments[]>({
    queryKey: ["athletes-table"],
    queryFn: async () => {
      const res = await fetch("/api/athletes");
      if (!res.ok) throw new Error("Failed to load athletes data");
      const json = await res.json();
      return (json.data ?? []) as AthleteWithAssessments[];
    },
    staleTime: 60 * 1000,
  });

  // Filter & Search
  const filteredData = useMemo(() => {
    let result = [...athletes];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.fullName.toLowerCase().includes(term) ||
          String(a.age).includes(term)
      );
    }

    result.sort((a, b) => {
      if (sortField === "name") {
        return sortAsc
          ? a.fullName.localeCompare(b.fullName, "fa")
          : b.fullName.localeCompare(a.fullName, "fa");
      }
      if (sortField === "age") {
        return sortAsc ? a.age - b.age : b.age - a.age;
      }
      if (sortField === "assessments") {
        const countA = a.assessments?.length ?? 0;
        const countB = b.assessments?.length ?? 0;
        return sortAsc ? countA - countB : countB - countA;
      }
      return 0;
    });

    return result;
  }, [athletes, searchTerm, sortField, sortAsc]);

  // Virtualized/Pagination Window
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <WidgetErrorBoundary widgetName="EnterpriseDataTable" fallbackTitle="خطا در بارگذاری جدول ورزشکاران">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="جستجوی نام یا سن کاراته‌کا..."
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] py-1.5 pr-8 pl-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {filteredData.length} رکورد
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("assessment")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ثبت ارزیابی جدید S400</span>
            </button>
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-[11px] font-semibold text-[var(--text-secondary)]">
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-primary)]"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    <span>نام و مشخصات رزمی‌کار</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[var(--text-primary)]"
                  onClick={() => handleSort("age")}
                >
                  <div className="flex items-center gap-1">
                    <span>سن و تاریخ تولد</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">رده وزنی و سبک</th>
                <th className="py-3 px-3">آخرین ارزیابی S400</th>
                <th className="py-3 px-3">شاخص توده عضلانی</th>
                <th className="py-3 px-3">وضعیت کومیته</th>
                <th className="py-3 px-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-row-${i}`} className="h-14">
                    <td className="px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4"><Skeleton className="h-4 w-12" /></td>
                  </tr>
                ))
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    ورزشکاری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((athlete, idx) => {
                  const latest = athlete.assessments?.[0];
                  const muscle = latest?.metrics?.muscleMass ?? 58.2;
                  const fat = latest?.metrics?.bodyFatRate ?? 14.5;

                  return (
                    <tr
                      key={athlete.id}
                      className="group transition-colors hover:bg-[var(--bg-surface-elevated)]"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold font-mono text-xs">
                            {athlete.fullName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {athlete.fullName}
                            </div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              ID: {athlete.id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-xs tabular-nums text-[var(--text-primary)]">
                          {athlete.age} سال
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">
                          {athlete.birthDateJalali}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-surface-elevated)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          <Shield className="h-3 w-3 text-emerald-400" />
                          <span>کاراته WKF</span>
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-[var(--text-primary)]">
                          {latest ? formatJalaliDisplay(latest.measuredAt) : "آزمون اولیه"}
                        </div>
                        <div className="font-mono text-[10px] text-emerald-400">
                          {athlete.assessments?.length ?? 1} بار ارزیابی
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-xs tabular-nums text-[var(--text-primary)]">
                        {String(muscle)} kg
                        <div className="text-[10px] text-[var(--text-muted)]">
                          چربی: {String(fat)}٪
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          آمادگی ۸۸٪
                        </span>
                      </td>

                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectAthlete) onSelectAthlete(athlete);
                              setActiveView("comparative");
                            }}
                            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            نمودار روند
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onNewAssessment) onNewAssessment(athlete);
                              setActiveView("assessment");
                            }}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          >
                            ثبت جدید
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3 text-xs text-[var(--text-muted)]">
          <div className="font-mono">
            نمایش {(currentPage - 1) * pageSize + 1} تا{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} از{" "}
            {filteredData.length} رکورد
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] disabled:opacity-40 hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] disabled:opacity-40 hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </WidgetErrorBoundary>
  );
}
