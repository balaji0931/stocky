import {
  Check,
  X,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import type { Recommendation, CompanyProfile } from '../types';
import { getDecisionColor, getDecisionBgColor } from '../lib/utils';
import CompanyHeader from "./CompanyHeader";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface RecommendationCardProps {
  decision: string;
  recommendation: Recommendation;
  company: CompanyProfile;
  dataStatus?: "COMPLETE" | "PARTIAL" | "INSUFFICIENT";
  dataConfidence?: number;
}

interface ProsConsCardProps {
  pros: string[];
  cons: string[];
}

const decisionThresholds: Record<string, string> = {
  'STRONG BUY': '80–100',
  'BUY': '65–79',
  'HOLD': '50–64',
  'SELL': '35–49',
  'STRONG SELL': '0–34',
};

// ─────────────────────────────────────────────
// RecommendationCard (default export)
// Decision, confidence, thesis, verdict, outlook
// ─────────────────────────────────────────────

export default function RecommendationCard({
  decision,
  recommendation,
  company,
  dataStatus = "COMPLETE",
  dataConfidence = 5,
}: RecommendationCardProps) {
  const { confidence, thesis, verdict, shortTermOutlook, longTermOutlook } =
    recommendation;

  const threshold = decisionThresholds[decision] || '0–100';

  return (
    <div className="animate-fade-in space-y-7">
      {/* ── 1. Company Header ── */}
      <CompanyHeader
        profile={company}
        dataStatus={dataStatus}
        dataConfidence={dataConfidence}
      />
      {/* ── Section header ── */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
        <Target className="w-4 h-4 text-accent" />
        Equity Recommendation
      </h2>

      {/* ── Decision badge + Threshold ── */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.04] p-5 rounded-xl border border-white/[0.06]">
        <span
          className={`px-4 py-2 rounded-lg text-lg font-bold border shrink-0 ${getDecisionBgColor(decision)} ${getDecisionColor(decision)}`}
        >
          {decision}
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Decision Threshold
          </p>
          <p className="text-xs text-text-muted mt-0.5 font-mono">
            Band: {threshold} points
          </p>
        </div>
      </div>

      {/* ── Confidence bar ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary font-medium">
            Analyst Confidence
          </span>
          <span className="font-mono text-text-primary font-bold">
            {confidence}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* ── Investment Thesis ── */}
      {thesis && (
        <div className="space-y-2">
          <h3 className="text-md font-semibold uppercase tracking-wider text-text-muted">
            Investment Thesis
          </h3>
          <p className="text-sm text-text-primary leading-relaxed font-medium">
            {thesis}
          </p>
        </div>
      )}

      {/* ── Final Verdict ── */}
      {verdict && (
        <div className="space-y-2">
          <h3 className="text-md font-semibold uppercase tracking-wider text-white/70 text-text-muted flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            Final Verdict
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed italic bg-white/[0.04] p-4 rounded-xl border border-white/[0.06]">
            {verdict}
          </p>
        </div>
      )}

      {/* ── Short-term + Long-term Outlook ── */}
      {(shortTermOutlook || longTermOutlook) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortTermOutlook && (
            <div className="bg-white/[0.04] rounded-xl p-5 border border-white/[0.06]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-buy" />
                Short-Term Outlook
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {shortTermOutlook}
              </p>
            </div>
          )}
          {longTermOutlook && (
            <div className="bg-white/[0.04] rounded-xl p-5 border border-white/[0.06]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-accent" />
                Long-Term Outlook
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {longTermOutlook}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ProsConsCard (named export)
// Two-column: Why Buy / Major Risks
// ─────────────────────────────────────────────

export function ProsConsCard({ pros, cons }: ProsConsCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* ── Why Buy ── */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-buy mb-4 flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Why Buy
          </h3>
          <ul className="space-y-3">
            {pros.map((pro, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed"
              >
                <Check className="w-4 h-4 text-buy shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Major Risks ── */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-sell mb-4 flex items-center gap-1.5">
            <X className="w-4 h-4" />
            Major Risks
          </h3>
          <ul className="space-y-3">
            {cons.map((con, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed"
              >
                <X className="w-4 h-4 text-sell shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
