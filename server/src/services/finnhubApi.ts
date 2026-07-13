import { env } from "../config.js";
import * as fmp from "./fmpApi.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://finnhub.io/api/v1";

async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ ...params, token: env.FINNHUB_API_KEY || "" });
  const url = `${BASE_URL}/${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Finnhub API error: ${response.status} for /${endpoint} — ${body.substring(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

interface FinnhubSearchResult {
  count: number;
  result: {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }[];
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  ticker: string;
  weburl: string;
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export async function searchCompany(query: string) {
  const results = await getSearchResults(query);
  if (results && results.length > 0) {
    return {
      ticker: results[0].symbol,
      name: results[0].name,
      exchange: results[0].exchange,
    };
  }
  return null;
}

export async function getSearchResults(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  if (!env.FINNHUB_API_KEY) {
    return fmp.getSearchResults(query);
  }

  try {
    const data = await finnhubFetch<FinnhubSearchResult>("search", { q: query });
    if (!data.result || data.result.length === 0) return fmp.getSearchResults(query);

    const cleanQuery = query.trim().toUpperCase();

    // Score and rank search results
    const scoreResult = (r: any) => {
      let score = 0;
      const sym = (r.symbol || "").toUpperCase();
      const desc = (r.description || "").toUpperCase();

      if (sym === cleanQuery) score += 2000;
      if (desc === cleanQuery) score += 1000;

      if (desc.startsWith(cleanQuery)) {
        score += 300;
      } else if (desc.includes(cleanQuery)) {
        score += 100;
      }

      // Suffix checks (e.g. AAPL has no dot, VISA.TO has a dot)
      if (!sym.includes(".")) {
        score += 1500;
      } else {
        score -= 2500;
      }

      // Common stock check
      if (r.type && r.type.toUpperCase().includes("COMMON STOCK")) {
        score += 500;
      }

      return score;
    };

    const sorted = [...data.result]
      .map(r => ({ ...r, _score: scoreResult(r) }))
      .sort((a, b) => b._score - a._score);

    return sorted.slice(0, 10).map(r => ({
      symbol: r.symbol,
      name: r.description,
      exchange: r.type || "US Listing",
    }));
  } catch (error) {
    logger.error("Finnhub search failed, falling back to FMP:", error);
    return fmp.getSearchResults(query);
  }
}

export async function getCompanyProfile(ticker: string) {
  if (!env.FINNHUB_API_KEY) {
    logger.log("   ⚠️ Finnhub API Key absent. Falling back to FMP Profile Lookup.");
    return fmp.getCompanyProfile(ticker);
  }

  try {
    const p = await finnhubFetch<FinnhubProfile>("stock/profile2", { symbol: ticker });
    if (!p || !p.name) return fmp.getCompanyProfile(ticker);

    // Fetch fallback profile details from FMP (description, ceo, employees) that profile2 lacks
    const fmpProfile = await fmp.getCompanyProfile(ticker).catch(() => null);

    return {
      name: p.name,
      ticker: p.ticker || ticker,
      exchange: p.exchange || "US Listing",
      industry: p.finnhubIndustry || fmpProfile?.industry || "N/A",
      sector: fmpProfile?.sector || "Technology",
      ceo: fmpProfile?.ceo || "N/A",
      employees: fmpProfile?.employees || 0,
      marketCap: (p.marketCapitalization || 0) * 1e6 || fmpProfile?.marketCap || 0, // Finnhub returns cap in millions
      description: fmpProfile?.description || `${p.name} listing details on ${p.exchange}.`,
      website: p.weburl || fmpProfile?.website || "",
      logo: p.logo || fmpProfile?.logo || "",
      currentPrice: fmpProfile?.currentPrice || 0,
    };
  } catch (error) {
    logger.error("Finnhub profile failed, falling back to FMP:", error);
    return fmp.getCompanyProfile(ticker);
  }
}

export async function getCompanyNews(ticker: string) {
  if (!env.FINNHUB_API_KEY) {
    logger.log("   ⚠️ Finnhub API Key absent. Falling back to FMP Stock News.");
    return fmp.getCompanyNews(ticker);
  }

  try {
    // Get past 30 days of news
    const toDate = new Date().toISOString().split("T")[0];
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromDate = from.toISOString().split("T")[0];

    const news = await finnhubFetch<FinnhubNews[]>("company-news", {
      symbol: ticker,
      from: fromDate,
      to: toDate,
    });

    if (!news || news.length === 0) return fmp.getCompanyNews(ticker);

    // Return first 5 articles
    return news.slice(0, 5).map((item) => ({
      title: item.headline,
      url: item.url,
      source: item.source || "Financial Media",
      publishedAt: new Date(item.datetime * 1000).toISOString(),
    }));
  } catch (error) {
    logger.error("Finnhub company news failed, falling back to FMP:", error);
    return fmp.getCompanyNews(ticker);
  }
}
