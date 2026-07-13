import type { InvestmentStateType } from "../state.js";
import {
  calculateFinancialHealth,
  calculateGrowth,
  calculateValuation,
  getDecisionFromScore,
} from "../../utils/scoring.js";
import type { Scores } from "../../utils/types.js";
import { logger } from "../../utils/logger.js";

/**
 * Node 6: Deterministic Scoring
 * 
 * pure TypeScript scoring node.
 * No LLM calculations occur here.
 */
export async function investmentScoringNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("📈 Node 6: Calculating deterministic investment scores...");

  if (!state.financials) {
    return { errors: ["Skipping scoring — no financial data available."] };
  }

  try {
    const f = state.financials;
    const p = state.profile;
    const articlesCount = state.news?.articles?.length ?? 0;

    let dataStatus: "COMPLETE" | "PARTIAL" | "INSUFFICIENT" = "COMPLETE";
    let dataConfidence = 5;

    // Check for critical missing data
    const hasZeroFinancials = (f.revenue === null || f.revenue === 0) && 
                              (f.cash === null || f.cash === 0) && 
                              (f.debt === null || f.debt === 0);
    const hasZeroProfitability = (f.revenue === null || f.revenue === 0) && 
                                 (f.netIncome === null || f.netIncome === 0) && 
                                 (f.eps === null || f.eps === 0);
    const hasNoMarketCap = !p || p.marketCap === null || p.marketCap === 0;

    if (hasZeroFinancials || hasZeroProfitability || hasNoMarketCap) {
      dataStatus = "INSUFFICIENT";
      dataConfidence = 1;
    } else if (f.peRatio === null || f.peRatio === 0 || f.operatingMargin === null || f.operatingMargin === 0 || articlesCount === 0) {
      dataStatus = "PARTIAL";
      dataConfidence = 3;
    }

    if (dataStatus === "INSUFFICIENT") {
      logger.log("   ⚠️ Insufficient financial data. Analysis marked UNAVAILABLE.");
      const scores: Scores = {
        financial: 0,
        financialReasoning: "Financial statement details unavailable from data provider.",
        growth: 0,
        growthReasoning: "Growth rates cannot be calculated due to missing filings.",
        valuation: 0,
        valuationReasoning: "Valuation multiples cannot be computed due to missing details.",
        business: 0,
        risk: 0,
        total: 0,
      };

      return {
        scores,
        decision: "UNAVAILABLE",
        dataStatus,
        dataConfidence,
        sources: ["Scoring Methodology: Deterministic Rubric"],
      };
    }

    // ---- Step 1: Calculate deterministic scores & reasonings ----
    const financialHealth = calculateFinancialHealth(state.financials);
    const growthPotential = calculateGrowth(state.financials);
    const valuation = calculateValuation(state.financials);

    // ---- Step 2: Read qualitative scores pre-calculated by Node 5 ----
    const business = state.businessQuality?.score ?? 10;
    const risk = state.riskProfile?.score ?? 10;

    // ---- Step 3: Calculate total score ----
    const total = financialHealth.score + growthPotential.score + valuation.score + business + risk;

    const scores: Scores = {
      financial: financialHealth.score,
      financialReasoning: financialHealth.reasoning,
      growth: growthPotential.score,
      growthReasoning: growthPotential.reasoning,
      valuation: valuation.score,
      valuationReasoning: valuation.reasoning,
      business,
      risk,
      total,
    };

    // ---- Step 4: Determine investment decision ----
    const decision = getDecisionFromScore(total);

    logger.log(`   ✅ Score: ${total}/100 | Decision: ${decision} | Confidence: ${dataConfidence} stars`);

    return {
      scores,
      decision,
      dataStatus,
      dataConfidence,
      sources: ["Scoring Methodology: Deterministic Rubric"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Scoring failed:", message);
    return { errors: [`Scoring failed: ${message}`] };
  }
}
