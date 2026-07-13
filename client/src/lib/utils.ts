/**
 * Format large numbers with abbreviations.
 * e.g., 1234567890 → "$1.23B"
 */
export function formatCurrency(value: number, prefix = "$"): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${prefix}${(value / 1e3).toFixed(2)}K`;
  return `${prefix}${value.toFixed(2)}`;
}

/**
 * Format a decimal as percentage.
 * e.g., 0.156 → "15.6%"
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format ratio.
 * e.g., 1.53 → "1.53x"
 */
export function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}

/**
 * Get color class for investment decision.
 */
export function getDecisionColor(decision: string): string {
  switch (decision) {
    case "STRONG BUY":
    case "BUY":
      return "text-buy";
    case "HOLD":
      return "text-hold";
    case "SELL":
    case "STRONG SELL":
      return "text-sell";
    default:
      return "text-text-secondary";
  }
}

/**
 * Get background color class for investment decision.
 */
export function getDecisionBgColor(decision: string): string {
  switch (decision) {
    case "STRONG BUY":
    case "BUY":
      return "bg-buy-bg border-buy/30";
    case "HOLD":
      return "bg-hold-bg border-hold/30";
    case "SELL":
    case "STRONG SELL":
      return "bg-sell-bg border-sell/30";
    default:
      return "bg-bg-card border-border";
  }
}

/**
 * Get color for a score value (0-100).
 */
export function getScoreColor(score: number): string {
  if (score >= 65) return "var(--color-buy)";
  if (score >= 45) return "var(--color-hold)";
  return "var(--color-sell)";
}

/**
 * Get sentiment dot color.
 */
export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "positive": return "bg-positive";
    case "negative": return "bg-negative";
    default: return "bg-neutral";
  }
}

/**
 * Format a date string to relative time.
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
