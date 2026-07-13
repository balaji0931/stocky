import type { InvestmentStateType } from "../state.js";
import { invokeAndParseJSON } from "../../services/llm.js";
import { RECOMMENDATION_WITH_REASONING_PROMPT } from "../../services/prompts.js";
import type { Recommendation } from "../../utils/types.js";
import { logger } from "../../utils/logger.js";

interface RecommendationResult {
  confidence: number;
  thesis: string;
  pros: string[];
  cons: string[];
  catalysts: string[];
  verdict: string;
  shortTermOutlook: string;
  longTermOutlook: string;
}

/**
 * Node 7: Final Recommendation Explanation
 * 
 * Synthesizes all gathered information and score outputs to explain
 * WHY the deterministic backend decision is appropriate.
 */
export async function recommendationNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("🎯 Node 7: Generating final recommendation explanation...");

  if (!state.scores || !state.decision) {
    return { errors: ["Skipping recommendation — scores or decision unavailable."] };
  }

  if (state.decision === "UNAVAILABLE") {
    logger.log("   ⚠️ Skipping LLM synthesis node — decision is UNAVAILABLE due to insufficient data.");
    const recommendation: Recommendation = {
      confidence: 0,
      thesis: `Comprehensive analysis is unavailable for ${state.profile?.name || state.companyName} (${state.ticker}).`,
      pros: [],
      cons: [],
      catalysts: [],
      verdict: "Data coverage confidence is too low to produce a score or recommendation. The selected company is not fully supported with corporate financial filings by the data provider.",
      shortTermOutlook: "Unavailable due to incomplete filings.",
      longTermOutlook: "Unavailable due to incomplete filings.",
    };
    return {
      recommendation,
    };
  }

  try {
    const prompt = RECOMMENDATION_WITH_REASONING_PROMPT
      .replace("{companyName}", state.profile?.name || state.companyName)
      .replace("{ticker}", state.ticker)
      .replace("{companyInfo}", JSON.stringify(state.profile, null, 2))
      .replace("{financials}", JSON.stringify(state.financials, null, 2))
      .replace("{news}", JSON.stringify({
        overallSentiment: state.news?.overallSentiment,
        sentimentScore: state.news?.sentimentScore,
        summary: state.news?.summary,
        articleCount: state.news?.articles.length,
      }, null, 2))
      .replace("{industry}", state.industrySummary)
      .replace("{totalScore}", state.scores.total.toString())
      .replace("{financialHealthScore}", state.scores.financial.toString())
      .replace("{growthScore}", state.scores.growth.toString())
      .replace("{businessScore}", state.scores.business.toString())
      .replace("{riskScore}", state.scores.risk.toString())
      .replace("{valuationScore}", state.scores.valuation.toString())
      .replaceAll("{decision}", state.decision);

    const result = await invokeAndParseJSON<RecommendationResult>(prompt);

    // Cap confidence between 60% and 95% (to prevent AI from implying absolute certainty)
    const confidenceVal = Math.min(Math.max(Math.round(result.confidence || 75), 60), 95);

    const recommendation: Recommendation = {
      confidence: confidenceVal,
      thesis: result.thesis || "Core investment thesis unavailable.",
      pros: result.pros || [],
      cons: result.cons || [],
      catalysts: result.catalysts || [],
      verdict: result.verdict || "Final verdict explanation unavailable.",
      shortTermOutlook: result.shortTermOutlook || "",
      longTermOutlook: result.longTermOutlook || "",
    };

    logger.log(`   ✅ Explanation Generated | Confidence: ${recommendation.confidence}%`);

    return {
      recommendation,
      sources: ["Qualitative Research: OpenRouter"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Recommendation generation failed:", message);

    return {
      recommendation: {
        confidence: 75,
        thesis: `Automated thesis generated for ${state.profile?.name || state.companyName}.`,
        pros: ["Automated scoring successfully executed"],
        cons: ["Detailed AI recommendation synthesis failed"],
        catalysts: ["Monitor general sector trends"],
        verdict: `Automated decision resolved to ${state.decision} based on quantitative score of ${state.scores.total}/100. Detailed LLM explanation was unavailable.`,
        shortTermOutlook: "Outlook details are currently unavailable.",
        longTermOutlook: "Outlook details are currently unavailable.",
      },
      errors: [`Recommendation generation failed: ${message}`],
    };
  }
}
