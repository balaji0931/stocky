import type { InvestmentStateType } from "../state.js";
import { searchCompany } from "../../services/finnhubApi.js";
import { env } from "../../config.js";
import { logger } from "../../utils/logger.js";

/**
 * Node 1: Input Parser
 * 
 * Takes raw company name input, resolves it to a ticker symbol
 * using Finnhub/FMP search API. If the client pre-selected a ticker,
 * bypasses search entirely.
 */
export async function inputParserNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("🔍 Node 1: Parsing input...");

  if (state.ticker && state.ticker.trim().length > 0) {
    logger.log(`   ✅ Direct resolution: using pre-selected ticker ${state.ticker}`);
    return {
      ticker: state.ticker.toUpperCase().trim(),
      companyName: state.companyName || state.ticker.toUpperCase().trim(),
      sources: ["Manual Selection: Stock Terminal Autocomplete"],
    };
  }

  try {
    const result = await searchCompany(state.companyName);

    if (!result) {
      return {
        errors: [`Could not find company matching "${state.companyName}". Please check the company name or ticker.`],
      };
    }

    logger.log(`   ✅ Resolved: ${result.name} (${result.ticker}) on ${result.exchange}`);

    const sourceName = env.FINNHUB_API_KEY
      ? "Financial Data: Finnhub"
      : "Financial Data: Financial Modeling Prep";

    return {
      companyName: result.name,
      ticker: result.ticker,
      sources: [sourceName],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Input parsing failed:", message);
    return {
      errors: [`Input parsing failed: ${message}`],
    };
  }
}
