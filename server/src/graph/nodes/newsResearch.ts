import type { InvestmentStateType } from "../state.js";
import { getCompanyNews } from "../../services/finnhubApi.js";
import { invokeAndParseJSON } from "../../services/llm.js";
import { NEWS_SENTIMENT_PROMPT } from "../../services/prompts.js";
import { env } from "../../config.js";
import { logger } from "../../utils/logger.js";

interface SentimentResult {
  overallSentiment: "bullish" | "bearish" | "neutral";
  sentimentScore: number;
  keyPositiveCatalysts: string[];
  keyRisks: string[];
  summary: string;
}

/**
 * Node 4: News + Sentiment Analysis
 * 
 * Fetches recent news from Finnhub/FMP by stock ticker symbol, then
 * uses OpenRouter to classify overall sentiment, and extract catalysts and risks.
 */
export async function newsResearchNode(
  state: InvestmentStateType
): Promise<Partial<InvestmentStateType>> {
  logger.log("📰 Node 4: Researching news + sentiment...");

  if (!state.ticker) {
    return { errors: ["Skipping news research — no ticker resolved."] };
  }

  const companyName = state.profile?.name || state.companyName;

  try {
    // Fetch news articles by symbol instead of text keyword
    const rawArticles = await getCompanyNews(state.ticker);

    if (rawArticles.length === 0) {
      logger.log("   ⚠️ No news articles found.");
      return {
        news: {
          articles: [],
          overallSentiment: "neutral",
          sentimentScore: 0,
          summary: "No recent news articles found for this company.",
          keyPositiveCatalysts: [],
          keyRisks: [],
        },
        sources: [
          env.FINNHUB_API_KEY
            ? "News & Sentiment: Finnhub"
            : "News & Sentiment: Financial Modeling Prep",
        ],
      };
    }

    logger.log(`   📄 Found ${rawArticles.length} articles. Analyzing sentiment...`);

    // Format articles for the prompt
    const articlesList = rawArticles
      .map((a, i) => `${i + 1}. "${a.title}" - ${a.source} (${a.publishedAt})`)
      .join("\n");

    // Ask LLM to classify sentiment
    const prompt = NEWS_SENTIMENT_PROMPT
      .replace("{companyName}", companyName)
      .replace("{articles}", articlesList);

    const sentiment = await invokeAndParseJSON<SentimentResult>(prompt);

    const newsSourceName = env.FINNHUB_API_KEY
      ? "News & Sentiment: Finnhub"
      : "News & Sentiment: Financial Modeling Prep";

    logger.log(`   ✅ Sentiment: ${sentiment.overallSentiment} (${sentiment.sentimentScore.toFixed(2)})`);

    return {
      news: {
        articles: rawArticles,
        overallSentiment: sentiment.overallSentiment,
        sentimentScore: sentiment.sentimentScore,
        summary: sentiment.summary,
        keyPositiveCatalysts: sentiment.keyPositiveCatalysts || [],
        keyRisks: sentiment.keyRisks || [],
      },
      sources: [newsSourceName, "Qualitative Research: OpenRouter"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("   ❌ News research failed:", message);

    const newsSourceName = env.FINNHUB_API_KEY
      ? "News & Sentiment: Finnhub"
      : "News & Sentiment: Financial Modeling Prep";

    return {
      news: {
        articles: [],
        overallSentiment: "neutral",
        sentimentScore: 0,
        summary: "News analysis unavailable due to an error.",
        keyPositiveCatalysts: [],
        keyRisks: [],
      },
      sources: [newsSourceName],
      errors: [`News research failed: ${message}`],
    };
  }
}
