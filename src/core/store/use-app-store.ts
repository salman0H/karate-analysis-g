import { create } from "zustand";
import type { AthleteWithAssessments } from "@/types/athlete";

export type DashboardView =
  | "analytics"
  | "team"
  | "techniques"
  | "standards"
  | "assessment"
  | "roster"
  | "comparative";

export type TimeRangeFilter = "30D" | "90D" | "ALL";

interface AppState {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;

  timeRange: TimeRangeFilter;
  setTimeRange: (range: TimeRangeFilter) => void;

  selectedAthlete: AthleteWithAssessments | null;
  setSelectedAthlete: (athlete: AthleteWithAssessments | null) => void;

  isNewAssessmentMode: boolean;
  setIsNewAssessmentMode: (mode: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: "analytics",
  setActiveView: (view: DashboardView) => set({ activeView: view }),

  timeRange: "30D",
  setTimeRange: (range: TimeRangeFilter) => set({ timeRange: range }),

  selectedAthlete: null,
  setSelectedAthlete: (athlete: AthleteWithAssessments | null) => set({ selectedAthlete: athlete }),

  isNewAssessmentMode: false,
  setIsNewAssessmentMode: (mode: boolean) => set({ isNewAssessmentMode: mode }),
}));
