import type { AnalysisResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

/**
 * Run investment analysis for a company.
 */
export async function analyzeCompany(company: string, ticker?: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, ticker }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Network error" }));
    return {
      success: false,
      analysis: null,
      error: error.error || `Server error: ${response.status}`,
    };
  }

  return response.json();
}

/**
 * Fetch autocomplete search suggestions for a ticker or company name.
 */
export async function searchTickers(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  return response.json();
}
