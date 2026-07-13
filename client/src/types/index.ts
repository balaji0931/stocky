// ============================================
// Frontend types — mirrors backend types
// ============================================

export interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  sector: string;
  ceo: string;
  employees: number;
  marketCap: number;
  description: string;
  website: string;
  logo: string;
}

export interface FinancialMetrics {
  currentPrice: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  cash: number | null;
  debt: number | null;
  peRatio: number | null;
  operatingMargin: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  eps: number | null;
}

export interface NewsSummary {
  articles: {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
  }[];
  overallSentiment: "bullish" | "bearish" | "neutral";
  sentimentScore: number;
  summary: string;
  keyPositiveCatalysts: string[];
  keyRisks: string[];
}

export interface BusinessQuality {
  score: number;
  reasoning: string;
}

export interface RiskFactor {
  factor: string;
  deduction: number;
}

export interface RiskProfile {
  score: number;
  reasoning: string;
  topRisks: RiskFactor[];
}

export interface Scores {
  financial: number;
  financialReasoning: string;
  growth: number;
  growthReasoning: string;
  valuation: number;
  valuationReasoning: string;
  business: number;
  risk: number;
  total: number;
}

export interface Recommendation {
  confidence: number;
  thesis: string;
  pros: string[];
  cons: string[];
  catalysts: string[];
  verdict: string;
  shortTermOutlook: string;
  longTermOutlook: string;
}

export interface InvestmentState {
  company: CompanyProfile;
  financials: FinancialMetrics;
  news: NewsSummary;
  industry: {
    industrySummary: string;
  };
  scores: Scores;
  decision: string;
  recommendation: Recommendation;
  sources: string[];
  errors: string[];
  dataStatus?: "COMPLETE" | "PARTIAL" | "INSUFFICIENT";
  dataConfidence?: number;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: InvestmentState | null;
  error?: string;
}
