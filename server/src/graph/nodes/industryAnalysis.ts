import type { InvestmentStateType } from "../state.js";
import { invokeAndParseJSON } from "../../services/llm.js";
import { INDUSTRY_AND_QUALITATIVE_SCORING_PROMPT } from "../../services/prompts.js";
import { logger } from "../../utils/logger.js";

interface IndustryAndQualitativeResult {
  industrySummary: string;
  businessQuality: {
    score: number;
    reasoning: string;
  };
  riskProfile: {
    score: number;
    reasoning: string;
    topRisks: { factor: string; deduction: number }[];
  };
}

/**
 * Node 5: Industry Analysis & Qualitative Scoring
 * 
 * Uses OpenRouter to:
 * 1. Analyze the industry landscape (returning a single unified summary).
 * 2. Evaluate business quality (score + reasoning).
 * 3. Evaluate risk profile (score + reasoning + top risks list).
 * 
 * This consolidates qualitative lookups into 1 call to save tokens.
 */
export async function industryAnalysisNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("🏭 Node 5: Analyzing industry and scoring qualitative metrics...");

  if (!state.profile) {
    return { errors: ["Skipping industry analysis — no company profile available."] };
  }

  try {
    const prompt = INDUSTRY_AND_QUALITATIVE_SCORING_PROMPT
      .replace("{sector}", state.profile.sector)
      .replace("{companyName}", state.profile.name)
      .replace("{industry}", state.profile.industry)
      .replace("{description}", state.profile.description.substring(0, 500))
      .replace("{marketCap}", state.profile.marketCap > 0 ? `$${(state.profile.marketCap / 1e9).toFixed(1)}B` : "N/A")
      .replace("{revenueGrowth}", state.financials && state.financials.revenueGrowth !== null ? (state.financials.revenueGrowth * 100).toFixed(1) : "N/A")
      .replace("{peRatio}", state.financials && state.financials.peRatio !== null ? state.financials.peRatio.toFixed(1) : "N/A")
      .replace("{debtToEquity}", state.financials && state.financials.debtToEquity !== null ? state.financials.debtToEquity.toFixed(2) : "N/A")
      .replace("{newsSentiment}", state.news?.overallSentiment || "neutral")
      .replace("{newsSummary}", state.news?.summary || "No news available.");

    const result = await invokeAndParseJSON<IndustryAndQualitativeResult>(prompt);

    logger.log(`   ... Qualitative Analysis Complete`);
    logger.log(`   ✅ Business Quality: ${result.businessQuality.score}/20 | Risk Profile: ${result.riskProfile.score}/20`);

    return {
      industrySummary: result.industrySummary,
      businessQuality: {
        score: Math.min(Math.max(Math.round(result.businessQuality.score), 0), 20),
        reasoning: result.businessQuality.reasoning,
      },
      riskProfile: {
        score: Math.min(Math.max(Math.round(result.riskProfile.score), 0), 20),
        reasoning: result.riskProfile.reasoning,
        topRisks: result.riskProfile.topRisks || [],
      },
      sources: ["Qualitative Research: OpenRouter"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Industry analysis failed:", message);
    return { errors: [`Industry analysis failed: ${message}`] };
  }
}
