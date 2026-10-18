"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface FallbackCardProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onReset?: () => void;
  className?: string;
}

export function FallbackCard({
  title = "خطا در بارگذاری بخش تحلیلی",
  message = "مشکلی در دریافت یا پردازش اطلاعات این ویجت رخ داده است.",
  error,
  onReset,
  className = "",
}: FallbackCardProps) {
  return (
    <div
      role="alert"
      className={`relative flex flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/10 p-5 text-center backdrop-blur-sm ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{message}</p>

      {error?.message && (
        <code className="mt-2 block max-w-full overflow-hidden text-ellipsis rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-rose-300 border border-rose-900/40">
          {error.message}
        </code>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </button>
      )}
    </div>
  );
}
