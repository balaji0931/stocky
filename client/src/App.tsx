import { useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import { useAnalysis } from "./hooks/useAnalysis";

import SearchBar from "./components/SearchBar";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import ScoreBreakdown, { ScoreGauge } from "./components/ScoreCard";
import FinancialCard from "./components/FinancialCard";
import RecommendationCard, {
  ProsConsCard,
} from "./components/RecommendationCard";
import NewsCard from "./components/NewsCard";
import RiskCard from "./components/RiskCard";
import SourcesFooter from "./components/SourcesFooter";

/* ─── Quick-search ticker pills ─── */
const POPULAR_TICKERS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "V", name: "Visa" },
  { symbol: "GOOGL", name: "Alphabet" },
];

/* ─── Feature highlights ─── */
const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6 text-accent" />,
    title: "Deterministic Scoring",
    desc: "100-point rubric computed by transparent, rule-based formulas — zero hallucinated numbers.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: "AI Moat Analysis",
    desc: "LLM evaluates competitive moats, management quality, and industry positioning qualitatively.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-accent" />,
    title: "Data Integrity",
    desc: "Validates financial statements and rejects incomplete listings to prevent misleading scores.",
  },
];

/* ══════════════════════════════════════════
   App
   ══════════════════════════════════════════ */

function App() {
  const { analysis, isLoading, error, analyze, reset } = useAnalysis();
  const [searchedCompany, setSearchedCompany] = useState("");

  const handleSearch = (company: string, ticker?: string) => {
    setSearchedCompany(company);
    analyze(company, ticker);
  };

  const handleReset = () => {
    reset();
    setSearchedCompany("");
  };

  const hasResults = !isLoading && !error && analysis;

  const card = "bg-bg-card border border-border rounded-2xl";

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-x-hidden">
      {/* ═══ Header ═══ */}
      <header className="mt-2 sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={handleReset}
          >
            <span className="text-4xl font-bold text-text-primary tracking-tight">
              Stocky
            </span>
          </div>

          <span className="text-white text-text-muted text-[10px] hidden lg:block uppercase tracking-[0.2em] font-mono">
            Investment Research Agent
          </span>
        </div>
      </header>

      {/* ═══ Main ═══ */}
      <main className="flex-1 flex flex-col relative z-10">

        {/* ════════════════════════════════
           LANDING / SEARCH PAGE
        ════════════════════════════════ */}
        {!isLoading && !error && !analysis && (
          <div className="flex-1 flex flex-col items-center justify-center mb-5 sm:py-16 animate-fade-in">

            {/* ── Hero Section ── */}
            <div className=" w-full text-center space-y-4 mb-8">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.08]">
                Analyze with absolute clarity
              </h1>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                Resolve tickers, extract financial metrics, evaluate competitive
                moats, and generate transparent 100-point investment scores.
              </p>
            </div>

            {/* ── Search Bar — big, prominent ── */}
            <div className="w-full max-w-2xl mb-5">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* ── Quick tickers ── */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <span className="text-xs text-text-muted mr-1">Quick search:</span>
              {POPULAR_TICKERS.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => handleSearch(t.name, t.symbol)}
                  className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border hover:border-accent text-text-primary font-mono text-xs font-medium transition-all cursor-pointer"
                >
                  {t.symbol}
                </button>
              ))}
            </div>

            {/* ── Feature Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="bg-bg-elevated border border-border rounded-xl p-5 space-y-3 hover:border-accent/50 transition-colors"
                >
                  <h3 className="text-xs font-bold text-text-primary tracking-wide">
                    {f.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
           LOADING STATE
        ════════════════════════════════ */}
        {isLoading && (
          <div className="max-w-6xl mx-auto px-6 w-full flex-1 flex items-center justify-center">
            <LoadingState companyName={searchedCompany} />
          </div>
        )}

        {/* ════════════════════════════════
           ERROR STATE
        ════════════════════════════════ */}
        {!isLoading && error && (
          <div className="max-w-6xl mx-auto px-6 w-full flex-1 flex items-center justify-center">
            <ErrorState error={error} onRetry={handleReset} />
          </div>
        )}

        {/* ════════════════════════════════
           RESULTS — scrolling page
        ════════════════════════════════ */}
        {hasResults && (
          <div className="max-w-7xl mx-auto px-6 w-full py-8 space-y-3 animate-fade-in">

            {/* Back + mobile search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Bact to Search</span>
              </button>
            </div>

            {/* ── Insufficient data warning ── */}
            {analysis.dataStatus === "INSUFFICIENT" ? (
              <div className={`${card} p-8 border-sell/30 space-y-4 max-w-2xl mx-auto`}>
                <div className="flex items-center gap-2.5 text-sell font-bold text-lg">
                  <AlertCircle className="w-6 h-6" />
                  Analysis Unavailable
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  The data provider could not retrieve sufficient corporate
                  filings for this security.
                </p>
                <div className="text-xs text-text-muted border-t border-border pt-4 space-y-1.5">
                  <p className="font-semibold text-text-primary">
                    Try a US-listed equity:
                  </p>
                  {["V — Visa Inc.", "AAPL — Apple Inc.", "NVDA — NVIDIA Corp."].map((s) => (
                    <p key={s} className="font-mono text-accent">{s}</p>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* ── 2. Decision + Score Gauge ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                  <div className="lg:col-span-3">
                    {analysis.recommendation && (
                      <RecommendationCard
                        decision={analysis.decision}
                        recommendation={analysis.recommendation}
                        company={analysis.company}
                        dataStatus={analysis.dataStatus}
                        dataConfidence={analysis.dataConfidence}
                      />
                    )}
                  </div>
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {analysis.scores && (
                      <div className="flex justify-between px-12 pt-10">
                      <div className={`p-6 sm:p-8 animate-fade-in animate-delay-1 flex flex-col items-center text-center gap-4`}>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted self-start">
                          Investment Score
                        </h2>
                        <p className="text-sm text-text-secondary">
                          {analysis.scores.total >= 65
                            ? "Strong fundamentals"
                            : analysis.scores.total >= 45
                              ? "Moderate outlook"
                              : "Elevated risk"}
                        </p>
                        </div>
                        <ScoreGauge total={analysis.scores.total} />
                      </div>
                    )}
                    {analysis.financials && analysis.company && (
                      <div className="animate-fade-in animate-delay-2">
                        <FinancialCard
                          financials={analysis.financials}
                          profile={analysis.company}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* ── 3. Score Breakdown ── */}
                {analysis.scores && (
                  <div className="animate-fade-in animate-delay-3">
                    <ScoreBreakdown
                      scores={analysis.scores}
                      businessQuality={analysis.industry ? { score: analysis.scores.business, reasoning: "" } : null}
                      riskProfile={analysis.industry ? { score: analysis.scores.risk, reasoning: "", topRisks: [] } : null}
                    />
                  </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* ── 5. Pros & Cons ── */}
                {analysis.recommendation && (analysis.recommendation.pros.length > 0 || analysis.recommendation.cons.length > 0) && (
                  <div className="animate-fade-in animate-delay-4">
                    <ProsConsCard
                      pros={analysis.recommendation.pros}
                      cons={analysis.recommendation.cons}
                    />
                  </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* ── 6. News & Sentiment ── */}
                {analysis.news && (
                  <div className="animate-fade-in animate-delay-5">
                    <NewsCard news={analysis.news} />
                  </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* ── 7. Business & Risks ── */}
                {analysis.industry && (
                  <div className="animate-fade-in animate-delay-6">
                    <RiskCard
                      businessQuality={analysis.industry ? { score: analysis.scores.business, reasoning: analysis.recommendation?.verdict || "" } : null}
                      riskProfile={null}
                      industrySummary={analysis.industry.industrySummary}
                    />
                  </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* ── 8. Sources & Timeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-7">
                  {analysis.sources && analysis.sources.length > 0 && (
                    <SourcesFooter sources={analysis.sources} />
                  )}
                </div>
              </>
            )}

            <div className="h-8" />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
