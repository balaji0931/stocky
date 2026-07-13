import { Router, Request, Response } from "express";
import { investmentAgent } from "../graph/investmentGraph.js";
import type { AnalysisResponse } from "../utils/types.js";
import { getSearchResults } from "../services/finnhubApi.js";
import { logger } from "../utils/logger.js";

const router = Router();

/**
 * GET /api/search
 * 
 * Auto-complete ticker symbol search.
 */
router.get("/search", async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    res.json([]);
    return;
  }

  try {
    const results = await getSearchResults(query);
    res.json(results);
  } catch (error) {
    logger.error("Search API failed:", error);
    res.status(500).json({ error: "Failed to search tickers." });
  }
});

/**
 * POST /api/analyze
 * 
 * Runs the full investment analysis pipeline for a given company.
 * Synchronous — waits for graph completion and returns the full result.
 */
router.post("/analyze", async (req: Request, res: Response): Promise<void> => {
  const { company, ticker } = req.body;

  if (!company || typeof company !== "string" || company.trim().length === 0) {
    const response: AnalysisResponse = {
      success: false,
      analysis: null,
      error: "Please provide a company name or ticker symbol.",
    };
    res.status(400).json(response);
    return;
  }

  const companyName = company.trim();
  const startTime = Date.now();

  logger.log(`\n${"=".repeat(60)}`);
  logger.log(`🚀 Starting analysis for: "${companyName}" ${ticker ? `(${ticker})` : ""}`);
  logger.log(`${"=".repeat(60)}\n`);

  try {
    const result = await investmentAgent.invoke({
      companyName,
      ticker: ticker ? ticker.trim() : "",
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.log(`\n✅ Analysis complete in ${elapsed}s\n`);

    if (!result.ticker) {
      const response: AnalysisResponse = {
        success: false,
        analysis: null,
        error: result.errors?.[0] || `Could not find company matching "${companyName}".`,
      };
      res.status(404).json(response);
      return;
    }

    const response: AnalysisResponse = {
      success: true,
      analysis: {
        company: result.profile as any,
        financials: result.financials as any,
        news: result.news as any,
        industry: {
          industrySummary: result.industrySummary,
        },
        scores: result.scores as any,
        decision: result.decision,
        recommendation: result.recommendation as any,
        sources: [...new Set(result.sources)],
        errors: result.errors,
        dataStatus: result.dataStatus || "COMPLETE",
        dataConfidence: result.dataConfidence || 5,
      },
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Analysis failed:", message);

    const response: AnalysisResponse = {
      success: false,
      analysis: null,
      error: `Analysis failed: ${message}`,
    };
    res.status(500).json(response);
  }
});

export default router;
