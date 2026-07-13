import type { InvestmentStateType } from "../state.js";
import { getCompanyProfile } from "../../services/finnhubApi.js";
import { env } from "../../config.js";
import { getFromCache, setInCache } from "../../services/cache.js";
import { logger } from "../../utils/logger.js";

/**
 * Node 2: Company Lookup
 * 
 * Fetches full company profile from Finnhub/FMP with an in-memory cache check.
 */
export async function companyLookupNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("🏢 Node 2: Looking up company profile...");

  if (!state.ticker) {
    return { errors: ["Skipping company lookup — no ticker resolved."] };
  }

  const cacheKey = `profile:${state.ticker.toUpperCase()}`;
  const cachedProfile = getFromCache<Partial<InvestmentStateType>>(cacheKey);
  if (cachedProfile) {
    logger.log(`   ✅ Cache hit: resolved profile details for ${state.ticker} from memory.`);
    return cachedProfile;
  }

  try {
    const profileData = await getCompanyProfile(state.ticker);

    if (!profileData) {
      return { errors: [`Could not fetch profile for ${state.ticker}`] };
    }

    logger.log(`   ✅ ${profileData.name} | ${profileData.sector} | ${profileData.industry}`);

    const sourceName = env.FINNHUB_API_KEY
      ? "Financial Data: Finnhub"
      : "Financial Data: Financial Modeling Prep";

    const result = {
      profile: {
        name: profileData.name,
        ticker: profileData.ticker,
        exchange: profileData.exchange,
        industry: profileData.industry,
        sector: profileData.sector,
        ceo: profileData.ceo,
        employees: profileData.employees,
        marketCap: profileData.marketCap,
        description: profileData.description,
        website: profileData.website,
        logo: profileData.logo,
      },
      // Store currentPrice for financial node
      financials: { currentPrice: profileData.currentPrice } as any,
      sources: [sourceName, "Caching Layer: In-Memory (24h)"],
    };

    // Cache the resolved result
    setInCache(cacheKey, result);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ Company lookup failed:", message);
    return { errors: [`Company lookup failed: ${message}`] };
  }
}
