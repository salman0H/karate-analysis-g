"use client";

import { useState, useMemo } from "react";
import type { AthleteWithAssessments } from "@/types/athlete";
import { formatJalaliDisplay } from "@/lib/jalali";
import {
  Users,
  Search,
  UserPlus,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";

interface KarateRosterSelectorProps {
  athletes: AthleteWithAssessments[];
  selectedAthleteId?: string | null;
  onSelectAthlete: (athlete: AthleteWithAssessments) => void;
  onNewAthleteClick: () => void;
  isLoading?: boolean;
}

// Generate distinct avatar belt colors and gradients based on name hash
const BELT_GRADIENTS = [
  "from-emerald-600 to-teal-800 border-emerald-400",
  "from-cyan-600 to-blue-800 border-cyan-400",
  "from-amber-600 to-yellow-800 border-amber-400",
  "from-purple-600 to-indigo-800 border-purple-400",
  "from-rose-600 to-red-800 border-rose-400",
  "from-slate-700 to-slate-900 border-slate-400",
];

function getAvatarStyle(name: string, index: number) {
  const hash = (name.length + index * 7) % BELT_GRADIENTS.length;
  return BELT_GRADIENTS[hash];
}

export function KarateRosterSelector({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  onNewAthleteClick,
  isLoading = false,
}: KarateRosterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAthletes = useMemo(() => {
    if (!searchTerm.trim()) return athletes;
    const term = searchTerm.trim().toLowerCase();
    return athletes.filter((a) =>
      a.fullName.toLowerCase().includes(term)
    );
  }, [athletes, searchTerm]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-xl space-y-4">
      {/* Roster Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                اعضای کلاس کاراته باشگاه برق منطقه‌ای خراسان
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                {athletes.length} رزمی‌کار فعال
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              جهت ورود اطلاعات آزمون جدید یا مقایسه پیشرفت، روی آواتار هنرجو کلیک کنید
            </p>
          </div>
        </div>

        {/* Search & New Athlete Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام هنرجو..."
              className="w-40 sm:w-48 rounded-xl border border-slate-700/80 bg-slate-950/70 py-1.5 pr-8 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          <button
            type="button"
            onClick={onNewAthleteClick}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ثبت عضو جدید</span>
          </button>
        </div>
      </div>

      {/* Roster Horizontal Scroll / Grid */}
      {isLoading ? (
        <div className="flex h-28 items-center justify-center text-xs text-slate-400">
          در حال بارگذاری لیست اعضای کلاس کاراته...
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-xs text-slate-500">
          هیچ هنرجویی با نام «{searchTerm}» یافت نشد.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredAthletes.map((athlete, idx) => {
            const isSelected = selectedAthleteId === athlete.id;
            const assessmentCount = athlete.assessments?.length ?? 0;
            const latestAssessment =
              athlete.assessments && athlete.assessments.length > 0
                ? athlete.assessments[athlete.assessments.length - 1]
                : null;
            const style = getAvatarStyle(athlete.fullName, idx);

            // Initials (two first letters of name)
            const initials = athlete.fullName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("");

            return (
              <div
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete)}
                className={`group relative flex w-40 shrink-0 flex-col items-center rounded-2xl border p-3.5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/20 -translate-y-0.5"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60 hover:-translate-y-0.5"
                }`}
              >
                {/* Selection Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Avatar / Selfie or Initials Badge */}
                <div className="relative mb-2.5">
                  {athlete.selfieUrl ? (
                    <img
                      src={athlete.selfieUrl}
                      alt={athlete.fullName}
                      className={`h-14 w-14 rounded-full object-cover border-2 shadow-md ${
                        isSelected ? "border-emerald-400 ring-2 ring-emerald-400/30" : "border-slate-700"
                      }`}
                    />
                  ) : (
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${style} text-base font-black text-white shadow-lg border-2`}
                    >
                      {initials || "🥋"}
                    </div>
                  )}

                  {/* Multi-Assessment Count Pill */}
                  <span
                    className={`absolute -bottom-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-md ${
                      assessmentCount >= 2 ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                    title={`${assessmentCount} نوبت ارزیابی ثبت شده`}
                  >
                    {assessmentCount}
                  </span>
                </div>

                {/* Athlete Name */}
                <div className="w-full">
                  <div
                    className={`truncate text-xs font-bold ${
                      isSelected ? "text-emerald-300" : "text-slate-100 group-hover:text-emerald-400"
                    }`}
                  >
                    {athlete.fullName}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {athlete.age ? `${athlete.age} سال` : "سن ثبت نشده"} •{" "}
                    {athlete.gender === "MALE" ? "آقایان" : "بانوان"}
                  </div>
                </div>

                {/* Last Measurement Date */}
                <div className="mt-2 w-full border-t border-slate-800/80 pt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span className="truncate">
                    {latestAssessment
                      ? formatJalaliDisplay(latestAssessment.measuredAt)
                      : "بدون آزمون"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
