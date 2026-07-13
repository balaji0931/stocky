import { useState, useCallback } from "react";
import { analyzeCompany } from "../lib/api";
import type { InvestmentState } from "../types";

interface UseAnalysisReturn {
  analysis: InvestmentState | null;
  isLoading: boolean;
  error: string | null;
  analyze: (company: string, ticker?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing investment analysis state.
 * Handles loading, error, and result states.
 */
export function useAnalysis(): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<InvestmentState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (company: string, ticker?: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await analyzeCompany(company, ticker);

      if (response.success && response.analysis) {
        setAnalysis(response.analysis);
      } else {
        setError(response.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the server. Is the backend running?"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { analysis, isLoading, error, analyze, reset };
}
