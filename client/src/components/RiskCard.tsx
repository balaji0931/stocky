import { Shield, AlertTriangle, BookOpen, AlertCircle } from 'lucide-react';
import type { BusinessQuality, RiskProfile } from '../types';

interface RiskCardProps {
  businessQuality: BusinessQuality | null;
  riskProfile: RiskProfile | null;
  industrySummary: string;
}

export default function RiskCard({ businessQuality, riskProfile, industrySummary }: RiskCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 animate-fade-in space-y-8">
      {/* ── Section header ── */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
        <Shield className="w-4 h-4 text-accent" />
        Business &amp; Risks
      </h2>

      {/* ── Industry Summary ── */}
      {industrySummary && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-accent" />
            Industry Outlook &amp; Landscape
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed bg-white/[0.04] p-5 rounded-xl border border-white/[0.04]">
            {industrySummary}
          </p>
        </div>
      )}

      {/* ── Business Moat & Management ── */}
      {businessQuality && (
        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-buy" />
            Business Moat &amp; Quality Analysis
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {businessQuality.reasoning}
          </p>
        </div>
      )}

      {/* ── Risk Profile — Top Risks ── */}
      {riskProfile && (
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-sell" />
              Qualitative Risk Deductions
            </h3>
            <span className="text-xs text-text-muted font-mono bg-white/[0.05] px-2.5 py-1 rounded-lg">
              Score: {riskProfile.score}/20
            </span>
          </div>

          {riskProfile.topRisks && riskProfile.topRisks.length > 0 ? (
            <ul className="space-y-3">
              {riskProfile.topRisks.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm text-text-secondary bg-white/[0.03] p-3 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-sell shrink-0 mt-0.5" />
                    <span>{item.factor}</span>
                  </div>
                  <span className="font-mono text-sell font-semibold bg-sell-bg px-2.5 py-0.5 rounded text-xs whitespace-nowrap ml-4">
                    -{item.deduction}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">
              {riskProfile.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
