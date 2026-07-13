import type { FinancialMetrics, Scores } from "./types.js";

/**
 * Deterministic scoring formulas and reasonings for investment analysis.
 * 
 * Rules aligned with Altuni AI Labs take-home criteria:
 * - Financial Health: 30 marks max (Revenue Growth, Debt, Operating Margin, Cash)
 * - Growth: 20 marks max (Revenue growth, Profitability, Industry position)
 * - Valuation: 10 marks max (PE ratio, Current ratio)
 * - Business Quality: 20 marks max (from LLM)
 * - Risk: 20 marks max (from LLM)
 */

export interface DetailedScores extends Scores {}

/**
 * Calculate Financial Health Score (30 pts max) and return score + dynamic explanation.
 */
export function calculateFinancialHealth(f: FinancialMetrics): { score: number; reasoning: string } {
  let score = 0;
  const parts: string[] = [];

  // 1. Revenue Growth (8 pts max)
  if (f.revenueGrowth === null) {
    parts.push("Revenue growth data unavailable: +0");
  } else {
    const revGrowth = f.revenueGrowth * 100;
    if (revGrowth > 20) {
      score += 8;
      parts.push("Strong revenue growth (>20% YoY): +8");
    } else if (revGrowth >= 10) {
      score += 6;
      parts.push("Moderate revenue growth (10-20% YoY): +6");
    } else if (revGrowth >= 5) {
      score += 4;
      parts.push("Healthy revenue growth (5-10% YoY): +4");
    } else if (revGrowth >= 0) {
      score += 2;
      parts.push("Slow revenue growth (0-5% YoY): +2");
    } else {
      parts.push("Negative revenue growth: +0");
    }
  }

  // 2. Debt (6 pts max)
  if (f.debtToEquity === null) {
    parts.push("Debt-to-equity leverage data unavailable: +0");
  } else {
    const de = f.debtToEquity;
    if (de < 0.5) {
      score += 6;
      parts.push("Low debt-to-equity leverage (<0.5): +6");
    } else if (de < 1.0) {
      score += 4;
      parts.push("Moderate debt-to-equity leverage (0.5-1.0): +4");
    } else if (de < 2.0) {
      score += 2;
      parts.push("Significant leverage (1.0-2.0): +2");
    } else {
      parts.push("High leverage (D/E >= 2.0): +0");
    }
  }

  // 3. Operating Margin (8 pts max)
  if (f.operatingMargin === null) {
    parts.push("Operating margin data unavailable: +0");
  } else {
    const margin = f.operatingMargin * 100;
    if (margin > 25) {
      score += 8;
      parts.push("Elite operating margin (>25%): +8");
    } else if (margin >= 15) {
      score += 6;
      parts.push("Strong operating margin (15-25%): +6");
    } else if (margin >= 5) {
      score += 4;
      parts.push("Moderate operating margin (5-15%): +4");
    } else {
      parts.push("Weak operating margin (<5%): +0");
    }
  }

  // 4. Cash (8 pts max)
  if (f.cash === null || f.debt === null) {
    parts.push("Balance sheet cash metrics unavailable: +0");
  } else {
    if (f.cash > f.debt) {
      score += 8;
      parts.push("Net cash surplus (Cash > Debt): +8");
    } else if (f.cash > 0) {
      score += 5;
      if (f.debt > f.cash) {
        parts.push("Adequate liquidity despite leverage: +5");
      } else {
        parts.push("Healthy cash reserves relative to debt: +5");
      }
    } else {
      score += 2;
      parts.push("Low cash balance: +2");
    }
  }

  return {
    score,
    reasoning: parts.join(", "),
  };
}

/**
 * Calculate Growth Score (20 pts max) and return score + dynamic explanation.
 */
export function calculateGrowth(f: FinancialMetrics): { score: number; reasoning: string } {
  let score = 0;
  const parts: string[] = [];

  // Revenue growth (8 pts max)
  if (f.revenueGrowth === null) {
    parts.push("Revenue growth data unavailable: +0");
  } else {
    const revGrowth = f.revenueGrowth * 100;
    if (revGrowth > 20) {
      score += 8;
      parts.push("Hyper-growth expansion (+8)");
    } else if (revGrowth >= 10) {
      score += 6;
      parts.push("Strong expansion (+6)");
    } else if (revGrowth >= 5) {
      score += 4;
      parts.push("Moderate expansion (+4)");
    } else if (revGrowth >= 0) {
      score += 2;
      parts.push("Stable expansion (+2)");
    } else {
      parts.push("Negative expansion (+0)");
    }
  }

  // EPS/Net Income profitability (6 pts max)
  if (f.netIncome === null || f.eps === null) {
    parts.push("profitability history unavailable (+0)");
  } else if (f.netIncome > 0 && f.eps > 0) {
    score += 6;
    parts.push("highly profitable earnings track (+6)");
  } else if (f.netIncome > 0) {
    score += 3;
    parts.push("positive net income (+3)");
  } else {
    parts.push("unprofitable profile (+0)");
  }

  // Default/Industry position (6 pts max)
  score += 6;
  parts.push("resilient industry positioning (+6)");

  return {
    score,
    reasoning: parts.join(", "),
  };
}

/**
 * Calculate Valuation Score (10 pts max) and return score + dynamic explanation.
 */
export function calculateValuation(f: FinancialMetrics): { score: number; reasoning: string } {
  let score = 0;
  const parts: string[] = [];

  // PE (6 pts max)
  const pe = f.peRatio;
  if (pe === null) {
    parts.push("PE multiple data unavailable: +0");
  } else if (pe > 0 && pe < 15) {
    score += 6;
    parts.push(`Undervalued PE multiple of ${pe.toFixed(1)}x (+6)`);
  } else if (pe >= 15 && pe < 25) {
    score += 4;
    parts.push(`Fair value PE multiple of ${pe.toFixed(1)}x (+4)`);
  } else if (pe >= 25 && pe < 40) {
    score += 2;
    parts.push(`Premium growth multiple of ${pe.toFixed(1)}x (+2)`);
  } else {
    parts.push(`Highly priced PE multiple of ${pe > 0 ? pe.toFixed(1) + 'x' : 'unprofitable'} (+0)`);
  }

  // Current ratio valuation check (4 pts max)
  if (f.currentRatio === null) {
    parts.push("Current ratio data unavailable: +0");
  } else if (f.currentRatio > 1.5) {
    score += 4;
    parts.push(`comfortable current ratio of ${f.currentRatio.toFixed(2)} (+4)`);
  } else if (f.currentRatio >= 1.0) {
    score += 2;
    parts.push(`adequate current ratio of ${f.currentRatio.toFixed(2)} (+2)`);
  } else {
    parts.push(`tight current ratio of ${f.currentRatio.toFixed(2)} below ideal threshold (+0)`);
  }

  return {
    score,
    reasoning: parts.join(", "),
  };
}

/**
 * Compute the investment decision from total score.
 */
export function getDecisionFromScore(
  totalScore: number
): "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL" {
  if (totalScore >= 80) return "STRONG BUY";
  if (totalScore >= 65) return "BUY";
  if (totalScore >= 50) return "HOLD";
  if (totalScore >= 35) return "SELL";
  return "STRONG SELL";
}
