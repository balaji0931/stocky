import type { Scores, BusinessQuality, RiskProfile } from '../types';
import { getScoreColor } from '../lib/utils';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ScoreBreakdownProps {
  scores: Scores;
  businessQuality: BusinessQuality | null;
  riskProfile: RiskProfile | null;
}

interface ScoreGaugeProps {
  total: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 45; // ≈ 283

// ─────────────────────────────────────────────
// ScoreGauge — standalone circular SVG gauge
// ─────────────────────────────────────────────

export function ScoreGauge({ total }: ScoreGaugeProps) {
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * total) / 100;
  const strokeColor = getScoreColor(total);

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      {/* Background ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="8"
      />
      {/* Foreground arc */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="score-ring"
        transform="rotate(-90 50 50)"
      />
      {/* Score number */}
      <text
        x="50"
        y="42"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-mono"
        fill="white"
        fontSize="22"
        fontWeight="700"
      >
        {total}
      </text>
      {/* /100 label */}
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize="10"
      >
        / 100
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Internal ScoreBar
// ─────────────────────────────────────────────

interface ScoreBarProps {
  label: string;
  score: number;
  max: number;
  reasoning: string;
}

function ScoreBar({ label, score, max, reasoning }: ScoreBarProps) {
  const pct = (score / max) * 100;
  const color = getScoreColor(pct);

  return (
    <div className="bg-white/[0.02] p-4 rounded-xl space-y-2.5">
      {/* Label + score */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-mono text-text-primary font-semibold">
          {score}/{max}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Reasoning */}
      <p className="text-xs text-text-muted leading-relaxed">{reasoning}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// ScoreBreakdown — full breakdown card
// ─────────────────────────────────────────────

export default function ScoreBreakdown({
  scores,
  businessQuality,
  riskProfile,
}: ScoreBreakdownProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 animate-fade-in">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-6">
        Score Breakdown
      </h2>

      <div className="space-y-5">
        <ScoreBar
          label="Financial Health"
          score={scores.financial}
          max={30}
          reasoning={scores.financialReasoning}
        />
        <ScoreBar
          label="Growth Potential"
          score={scores.growth}
          max={20}
          reasoning={scores.growthReasoning}
        />
        <ScoreBar
          label="Business Quality"
          score={scores.business}
          max={20}
          reasoning={
            businessQuality?.reasoning ||
            "Qualitative business model evaluation."
          }
        />
        <ScoreBar
          label="Risk Profile"
          score={scores.risk}
          max={20}
          reasoning={
            riskProfile?.reasoning ||
            "Risk rating based on financial leverage and sector dynamics."
          }
        />
        <ScoreBar
          label="Valuation"
          score={scores.valuation}
          max={10}
          reasoning={scores.valuationReasoning}
        />
      </div>
    </div>
  );
}
