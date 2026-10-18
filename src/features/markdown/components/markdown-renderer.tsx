"use client";

import React, { useState } from "react";
import { Copy, Check, Download, Table as TableIcon } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  title?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
  title,
}: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `karate-analytics-report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom parser to handle GFM markdown tables & blocks cleanly
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentTableRows: string[] = [];
    let inTable = false;

    const flushTable = (key: number) => {
      if (currentTableRows.length < 2) return;
      const [headerLine, separatorLine, ...bodyLines] = currentTableRows;
      const headers = headerLine
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);

      const rows = bodyLines
        .map((line) =>
          line
            .split("|")
            .map((cell) => cell.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        )
        .filter((cells) => cells.length > 0);

      elements.push(
        <div key={`table-wrapper-${key}`} className="my-4 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]">
                {headers.map((h, hIdx) => (
                  <th key={`th-${hIdx}`} className="py-2.5 px-3.5 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rows.map((rowCells, rIdx) => (
                <tr key={`tr-${rIdx}`} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  {rowCells.map((cell, cIdx) => (
                    <td key={`td-${cIdx}`} className="py-2 px-3.5 text-[var(--text-secondary)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      inTable = false;
    };

    lines.forEach((line, index) => {
      const isTableRow = line.trim().startsWith("|") && line.trim().endsWith("|");

      if (isTableRow) {
        inTable = true;
        currentTableRows.push(line);
      } else {
        if (inTable) {
          flushTable(index);
        }

        const trimmed = line.trim();
        if (!trimmed) {
          elements.push(<div key={`empty-${index}`} className="h-2" />);
          return;
        }

        if (trimmed.startsWith("### ")) {
          elements.push(
            <h4 key={`h4-${index}`} className="mt-4 mb-2 text-sm font-bold text-[var(--text-primary)]">
              {trimmed.replace("### ", "")}
            </h4>
          );
        } else if (trimmed.startsWith("## ")) {
          elements.push(
            <h3 key={`h3-${index}`} className="mt-5 mb-2.5 text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
              {trimmed.replace("## ", "")}
            </h3>
          );
        } else if (trimmed.startsWith("# ")) {
          elements.push(
            <h2 key={`h2-${index}`} className="mt-6 mb-3 text-lg font-black text-[var(--text-primary)]">
              {trimmed.replace("# ", "")}
            </h2>
          );
        } else if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          elements.push(
            <div key={`li-${index}`} className="flex items-start gap-2 py-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        } else if (/^\d+\.\s/.test(trimmed)) {
          elements.push(
            <div key={`num-${index}`} className="mt-3 mb-1 text-xs font-bold text-[var(--text-primary)]">
              {trimmed}
            </div>
          );
        } else {
          elements.push(
            <p key={`p-${index}`} className="my-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              {trimmed}
            </p>
          );
        }
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  return (
    <div className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs ${className}`}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {title ?? "گزارش و جداول تحلیلی مارک‌داون"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] hover:bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="کپی متن و جداول مارک‌داون"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "کپی شد" : "کپی مارک‌داون"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white transition-colors cursor-pointer"
            title="دانلود فایل .md"
          >
            <Download className="h-3.5 w-3.5" />
            <span>دانلود .md</span>
          </button>
        </div>
      </div>

      {/* Rendered Body */}
      <div className="markdown-content text-right space-y-1">
        {renderFormattedContent(content)}
      </div>
    </div>
  );
}
