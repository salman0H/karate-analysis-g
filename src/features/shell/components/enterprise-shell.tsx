"use client";

import React, { ReactNode } from "react";
import { StickyHeader } from "./sticky-header";
import { ENTERPRISE_NAV_ITEMS } from "../config/navigation";
import { useAppStore } from "@/core/store/use-app-store";

interface EnterpriseShellProps {
  children: ReactNode;
}

export function EnterpriseShell({ children }: EnterpriseShellProps) {
  const { activeView, setActiveView } = useAppStore();

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Top Enterprise Header */}
      <StickyHeader />

      {/* Sub-Header Navigation Tabs (for screens below xl) */}
      <div className="flex xl:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 overflow-x-auto gap-1.5 scrollbar-none">
        {ENTERPRISE_NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.labelFa}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
