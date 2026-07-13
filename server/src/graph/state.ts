import { Annotation } from "@langchain/langgraph";
import type {
  CompanyProfile,
  FinancialMetrics,
  NewsSummary,
  BusinessQuality,
  RiskProfile,
  Scores,
  Recommendation,
} from "../utils/types.js";

/**
 * LangGraph state annotation for the investment analysis pipeline.
 * 
 * Each node reads what it needs and writes its own section.
 * The `sources` and `errors` arrays use a reducer to accumulate across nodes.
 */
export const InvestmentAnnotation = Annotation.Root({
  companyName: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  ticker: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  profile: Annotation<CompanyProfile | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  financials: Annotation<FinancialMetrics | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  news: Annotation<NewsSummary | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  businessQuality: Annotation<BusinessQuality | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  riskProfile: Annotation<RiskProfile | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  industrySummary: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  scores: Annotation<Scores | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  decision: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  recommendation: Annotation<Recommendation | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  // Accumulator arrays — use concat reducer so each node can append
  sources: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  errors: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  dataStatus: Annotation<"COMPLETE" | "PARTIAL" | "INSUFFICIENT">({
    reducer: (_, next) => next,
    default: () => "COMPLETE",
  }),
  dataConfidence: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 5,
  }),
});

export type InvestmentStateType = typeof InvestmentAnnotation.State;
