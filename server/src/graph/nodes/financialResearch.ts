import type { InvestmentStateType } from "../state.js";
import { getFinancials } from "../../services/fmpApi.js";
import { getFromCache, setInCache } from "../../services/cache.js";
import { logger } from "../../utils/logger.js";

/**
 * Node 3: Financial Research
 * 
 * Fetches income statement, balance sheet, key metrics, and ratios from FMP
 * with an in-memory caching check to conserve free API queries.
 */
export async function financialResearchNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("📊 Node 3: Fetching financial data...");

  if (!state.ticker) {
    return { errors: ["Skipping financials — no ticker available."] };
  }

  const cacheKey = `financials:${state.ticker.toUpperCase()}`;
  const cachedFinancials = getFromCache<Partial<InvestmentStateType>>(cacheKey);
  if (cachedFinancials) {
    logger.log(`   ✅ Cache hit: resolved financials for ${state.ticker} from memory.`);
    return cachedFinancials;
  }

  try {
    const currentPrice = (state.financials as any)?.currentPrice || 0;
    const financials = await getFinancials(state.ticker, currentPrice);

    if (!financials) {
      return { errors: [`Could not fetch financial data for ${state.ticker}`] };
    }

    const revFormatted = financials.revenue !== null ? `$${(financials.revenue / 1e9).toFixed(1)}B` : "N/A";
    const growthFormatted = financials.revenueGrowth !== null ? `${(financials.revenueGrowth * 100).toFixed(1)}%` : "N/A";
    const peFormatted = financials.peRatio !== null ? financials.peRatio.toFixed(1) : "N/A";
    logger.log(`   ✅ Revenue: ${revFormatted} | Growth: ${growthFormatted} | PE: ${peFormatted}`);

    const result = {
      financials,
      sources: ["Financial Data: Financial Modeling Prep", "Caching Layer: In-Memory (24h)"],
    };

    // Cache the resolved result
    setInCache(cacheKey, result);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Financial research failed:", message);
    return { errors: [`Financial research failed: ${message}`] };
  }
}
