import { env } from "../config.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://financialmodelingprep.com/stable";

/**
 * Generic FMP fetch helper for the new /stable/ API.
 * All endpoints use query parameters (not path params).
 */
async function fmpFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ ...params, apikey: env.FMP_API_KEY });
  const url = `${BASE_URL}/${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`FMP API error: ${response.status} for /${endpoint} — ${body.substring(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

// ---- FMP response types ----

interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  industry: string;
  sector: string;
  ceo: string;
  fullTimeEmployees: string;
  mktCap: number;
  description: string;
  website: string;
  image: string;
  price: number;
}

interface FMPIncomeStatement {
  date: string;
  revenue: number;
  netIncome: number;
  eps: number;
  operatingIncome: number;
}

interface FMPBalanceSheet {
  cashAndCashEquivalents: number;
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
  totalDebt: number;
  totalStockholdersEquity: number;
}

interface FMPKeyMetrics {
  peRatio: number;
  returnOnEquity: number;
  freeCashFlowPerShare: number;
  dividendYield: number;
  debtToEquity: number;
  currentRatio: number;
  netIncomePerShare: number;
  freeCashFlow?: number;
}

interface FMPRatios {
  netProfitMargin: number;
  returnOnEquity: number;
  debtEquityRatio: number;
  currentRatio: number;
  dividendYield: number;
  priceEarningsRatio: number;
}

// ---- Public API ----

/**
 * Search for a company by name or ticker.
 * Uses the new /stable/search-name endpoint.
 */
export async function searchCompany(query: string): Promise<{ ticker: string; name: string; exchange: string } | null> {
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
  const cleanQuery = query.trim();
  if (cleanQuery.length === 0) return [];

  // If query looks exactly like a clean US ticker, check profile first to give absolute priority
  const isTickerLike = /^[A-Z0-9.-]{1,5}$/i.test(cleanQuery);
  if (isTickerLike) {
    try {
      const profiles = await fmpFetch<FMPProfile[]>("profile", { symbol: cleanQuery.toUpperCase() });
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        return [{
          symbol: p.symbol,
          name: p.companyName,
          exchange: p.exchange || "US Listing",
        }];
      }
    } catch (e) {
      // Ignore
    }
  }

  try {
    const [nameResults, symbolResults] = await Promise.all([
      fmpFetch<FMPSearchResult[]>("search-name", { query: cleanQuery }).catch(() => [] as FMPSearchResult[]),
      fmpFetch<FMPSearchResult[]>("search-symbol", { query: cleanQuery }).catch(() => [] as FMPSearchResult[]),
    ]);

    const combined = [...nameResults, ...symbolResults];
    if (combined.length === 0) return [];

    // Deduplicate
    const seen = new Set<string>();
    const unique = combined.filter(item => {
      const sym = item.symbol.toUpperCase();
      if (seen.has(sym)) return false;
      seen.add(sym);
      return true;
    });

    const scoreResult = (r: FMPSearchResult) => {
      let score = 0;
      const sym = r.symbol.toUpperCase();
      const name = (r.name || "").toUpperCase();
      const q = cleanQuery.toUpperCase();

      if (sym === q) score += 2000;
      if (name === q) score += 1000;

      if (name.startsWith(q)) {
        score += 300;
      } else if (name.includes(q)) {
        score += 100;
      }

      if (sym.startsWith(q)) {
        score += 150;
      }

      // Heavy US primary listing bias
      if (!sym.includes(".")) {
        score += 1500;
      } else {
        score -= 2500; // Penalize CDRs and foreign secondary listings heavily (e.g. VISA.TO)
      }

      if (r.currency === "USD") score += 500;

      const ex = (r.exchange || "").toUpperCase();
      const exFull = (r.exchangeFullName || "").toUpperCase();
      if (
        ex.includes("NASDAQ") || ex.includes("NYSE") || ex.includes("AMEX") || 
        ex.includes("BATS") || ex.includes("ARCA") ||
        exFull.includes("NEW YORK STOCK EXCHANGE") || exFull.includes("NASDAQ")
      ) {
        score += 800;
      }

      return score;
    };

    const sorted = unique
      .map(r => ({ ...r, _score: scoreResult(r) }))
      .sort((a, b) => b._score - a._score);

    return sorted.slice(0, 10).map(r => ({
      symbol: r.symbol,
      name: r.name,
      exchange: r.exchange || r.exchangeFullName || "N/A",
    }));
  } catch (error) {
    logger.error("FMP search failed:", error);
    return [];
  }
}

/**
 * Fetch company profile details.
 */
export async function getCompanyProfile(ticker: string) {
  try {
    const profiles = await fmpFetch<FMPProfile[]>("profile", { symbol: ticker });
    if (!profiles || profiles.length === 0) return null;

    const p = profiles[0];
    return {
      name: p.companyName,
      ticker: p.symbol,
      exchange: p.exchange,
      industry: p.industry || "N/A",
      sector: p.sector || "N/A",
      ceo: p.ceo || "N/A",
      employees: parseInt(p.fullTimeEmployees) || 0,
      marketCap: p.mktCap || 0,
      description: p.description || "",
      website: p.website || "",
      logo: p.image || "",
      currentPrice: p.price || 0,
    };
  } catch (error) {
    logger.error("FMP profile failed:", error);
    return null;
  }
}

/**
 * Fetch financial data — income statements, balance sheet, key metrics, ratios.
 * Returns consolidated FinancialMetrics.
 */
export async function getFinancials(ticker: string, currentPrice: number = 0) {
  try {
    const [incomeStatements, balanceSheet, keyMetrics, ratios] = await Promise.all([
      fmpFetch<FMPIncomeStatement[]>("income-statement", { symbol: ticker, limit: "4" }).catch(() => [] as FMPIncomeStatement[]),
      fmpFetch<FMPBalanceSheet[]>("balance-sheet-statement", { symbol: ticker, limit: "1" }).catch(() => [] as FMPBalanceSheet[]),
      fmpFetch<FMPKeyMetrics[]>("key-metrics", { symbol: ticker, limit: "1" }).catch(() => [] as FMPKeyMetrics[]),
      fmpFetch<FMPRatios[]>("ratios", { symbol: ticker, limit: "1" }).catch(() => [] as FMPRatios[]),
    ]);

    const latestIncome = incomeStatements[0];
    const previousIncome = incomeStatements[1];
    const bs = balanceSheet[0];
    const km = keyMetrics[0];
    const rt = ratios[0];

    // Compute YoY revenue growth
    let revenueGrowth: number | null = null;
    if (latestIncome && previousIncome && previousIncome.revenue > 0) {
      revenueGrowth = (latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue;
    }

    // Current ratio calculation
    let computedCurrentRatio = bs && bs.totalCurrentLiabilities > 0 
      ? bs.totalCurrentAssets / bs.totalCurrentLiabilities 
      : (km?.currentRatio || rt?.currentRatio || null);

    // Debt to Equity calculation
    let computedDebtToEquity = bs && bs.totalStockholdersEquity > 0
      ? bs.totalDebt / bs.totalStockholdersEquity
      : (km?.debtToEquity || rt?.debtEquityRatio || null);

    // Operating margin calculation
    let operatingMargin = latestIncome && latestIncome.revenue > 0
      ? (latestIncome.operatingIncome || 0) / latestIncome.revenue
      : (rt?.netProfitMargin || null);

    const epsVal = latestIncome ? (latestIncome.eps ?? km?.netIncomePerShare ?? null) : (km?.netIncomePerShare ?? null);
    let computedPeRatio = km?.peRatio || rt?.priceEarningsRatio || null;
    if ((!computedPeRatio || computedPeRatio === 0) && currentPrice > 0 && epsVal && epsVal > 0) {
      computedPeRatio = currentPrice / epsVal;
    }

    return {
      currentPrice: currentPrice || p_price_fallback(ticker, latestIncome) || null,
      revenue: latestIncome?.revenue ?? null,
      revenueGrowth: revenueGrowth,
      netIncome: latestIncome?.netIncome ?? null,
      cash: bs?.cashAndCashEquivalents ?? null,
      debt: bs?.totalDebt ?? null,
      peRatio: computedPeRatio || null,
      operatingMargin: operatingMargin,
      currentRatio: computedCurrentRatio,
      debtToEquity: computedDebtToEquity,
      eps: epsVal,
    };
  } catch (error) {
    logger.error("FMP financials failed:", error);
    return null;
  }
}

interface FMPStockNews {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

interface FMPArticle {
  title: string;
  date: string;
  link: string;
  site: string;
}

/**
 * Fetch company-specific news using ticker symbol.
 */
export async function getCompanyNews(ticker: string) {
  try {
    const news = await fmpFetch<FMPStockNews[]>("stock_news", { tickers: ticker, limit: "5" });
    if (news && news.length > 0) {
      return news.map(item => ({
        title: item.title,
        url: item.url,
        source: item.site || "Financial Media",
        publishedAt: item.publishedDate,
      }));
    }
  } catch (error) {
    // Proceed to general articles fallback
  }

  try {
    const articles = await fmpFetch<FMPArticle[]>("fmp-articles", { limit: "5" });
    if (articles && articles.length > 0) {
      return articles.map(item => ({
        title: item.title,
        url: item.link,
        source: item.site || "Financial Modeling Prep",
        publishedAt: item.date,
      }));
    }
  } catch (error) {
    // Ignore
  }

  return [];
}

function p_price_fallback(ticker: string, income: any): number {
  return 0; // fallback if price profile is absent
}
