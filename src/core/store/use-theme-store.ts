import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme: ThemeMode =
    typeof window !== "undefined" && localStorage.getItem("krec-theme") === "dark"
      ? "dark"
      : "light";

  return {
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === "light" ? "dark" : "light";
        if (typeof document !== "undefined") {
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.classList.add(nextTheme);
          try {
            localStorage.setItem("krec-theme", nextTheme);
          } catch {}
        }
        return { theme: nextTheme };
      }),
    setTheme: (theme: ThemeMode) => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(theme);
        try {
          localStorage.setItem("krec-theme", theme);
        } catch {}
      }
      set({ theme });
    },
  };
});
