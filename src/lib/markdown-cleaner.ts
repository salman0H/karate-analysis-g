// BiDi-safe Markdown Parser & Sanitizer for React-PDF Karate Conditioning Reports
// Transforms raw LLM Markdown (tables, headings, bold markers, bullet points)
// into structured, pristine RTL-compliant blocks without broken glyphs or pipe delimiters.

export interface FormattedReportBlock {
  type: "heading" | "bullet" | "paragraph";
  text: string;
}

/**
 * Converts Persian/Arabic digits to clean display
 */
export function sanitizeReportText(text: string): string {
  if (!text) return "";

  return text
    // Remove markdown bold / italic markers
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    // Remove stray pipe characters
    .replace(/\|/g, " ")
    // Clean up trailing colons or hashes
    .replace(/[:：#]+$/, "")
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Parses raw AI Markdown report into structured blocks ready for PDF rendering.
 * Automatically handles:
 * 1. Markdown tables (| col1 | col2 | col3 |) -> converted to clear bullet points
 * 2. Markdown headers (### 1. Title) -> converted to clean heading blocks
 * 3. Bullet points (* or -) -> normalized to unicode bullet (•)
 * 4. Regular paragraphs -> sanitized of raw markdown asterisks and broken delimiters
 */
export function parseMarkdownToReportBlocks(raw: string): FormattedReportBlock[] {
  if (!raw || typeof raw !== "string") return [];

  const rawLines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const blocks: FormattedReportBlock[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // 1. Table separator row (e.g. |---|---| or |:---:|---:|) -> ignore
    if (/^\|?[\s-:]+\|[\s-:]+\|?/.test(line)) {
      continue;
    }

    // 2. Markdown Table Row
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((cell) => sanitizeReportText(cell))
        .filter((cell) => cell.length > 0);

      // Check if this is a table header row (e.g. پارامتر / مقدار / تفسیر)
      const isHeaderRow = cells.some(
        (c) =>
          c === "پارامتر" ||
          c === "شاخص" ||
          c === "ردیف" ||
          c === "مقدار" ||
          c === "تفسیر" ||
          c === "تفسیر کاراته‌ای" ||
          c === "تفسیر عملکردی"
      );

      if (isHeaderRow) {
        continue;
      }

      if (cells.length >= 3) {
        // e.g. "• توده عضلانی: 48.3 kg — ظرفیت تولید گشتاور بالا"
        blocks.push({
          type: "bullet",
          text: `• ${cells[0]}: ${cells[1]} — ${cells[2]}`,
        });
        continue;
      } else if (cells.length === 2) {
        blocks.push({
          type: "bullet",
          text: `• ${cells[0]}: ${cells[1]}`,
        });
        continue;
      } else if (cells.length === 1) {
        blocks.push({
          type: "bullet",
          text: `• ${cells[0]}`,
        });
        continue;
      }
    }

    // 3. Headings (e.g. ### 1. Title or # Title or Title ###)
    const headingMatch =
      line.match(/^#{1,6}\s*(.*)$/) || line.match(/^(.*?)\s*#{1,6}$/);

    if (headingMatch) {
      const title = sanitizeReportText(headingMatch[1]);
      if (title.length > 0) {
        blocks.push({
          type: "heading",
          text: title,
        });
      }
      continue;
    }

    // 4. Bullet lists (e.g. - item or * item or • item)
    if (/^[-*•]\s+/.test(line)) {
      const content = sanitizeReportText(line.replace(/^[-*•]\s+/, ""));
      if (content.length > 0) {
        blocks.push({
          type: "bullet",
          text: `• ${content}`,
        });
      }
      continue;
    }

    // 5. Standard paragraph
    const cleaned = sanitizeReportText(line);
    if (cleaned.length > 0) {
      blocks.push({
        type: "paragraph",
        text: cleaned,
      });
    }
  }

  return blocks;
}
