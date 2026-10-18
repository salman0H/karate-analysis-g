export function formatNumber(
  value: number,
  decimals: number = 1
): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const formatted = Math.abs(value).toFixed(1);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${includeSign ? sign : ""}${formatted}٪`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("fa-IR", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}
