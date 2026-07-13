import { BarChart3 } from 'lucide-react';
import type { FinancialMetrics, CompanyProfile } from '../types';
import { formatCurrency, formatPercent, formatRatio } from '../lib/utils';

interface FinancialCardProps {
  financials: FinancialMetrics;
  profile: CompanyProfile;
}

interface Metric {
  label: string;
  value: string;
  color?: string;
  span?: boolean;
}

function buildMetrics(f: FinancialMetrics, p: CompanyProfile): Metric[] {
  return [
    {
      label: 'Current Price',
      value: f.currentPrice !== null && f.currentPrice > 0 ? `$${f.currentPrice.toFixed(2)}` : '—',
    },
    {
      label: 'Market Cap',
      value: p.marketCap ? formatCurrency(p.marketCap) : '—',
    },
    {
      label: 'P/E Ratio',
      value: f.peRatio !== null && f.peRatio > 0 ? `${f.peRatio.toFixed(1)}x` : '—',
      color: f.peRatio !== null && f.peRatio > 0 && f.peRatio < 25 ? 'text-buy' : undefined,
    },
    {
      label: 'Revenue',
      value: f.revenue !== null ? formatCurrency(f.revenue) : '—',
    },
    {
      label: 'Net Income',
      value: f.netIncome !== null ? formatCurrency(f.netIncome) : '—',
      color: f.netIncome !== null ? (f.netIncome >= 0 ? 'text-buy' : 'text-sell') : undefined,
    },
    {
      label: 'Revenue Growth',
      value: f.revenueGrowth !== null ? `${f.revenueGrowth >= 0 ? '▲' : '▼'} ${formatPercent(f.revenueGrowth)}` : '—',
      color: f.revenueGrowth !== null ? (f.revenueGrowth >= 0 ? 'text-buy' : 'text-sell') : undefined,
    },
    {
      label: 'Operating Margin',
      value: f.operatingMargin !== null ? formatPercent(f.operatingMargin) : '—',
      color: f.operatingMargin !== null && f.operatingMargin >= 0.15 ? 'text-buy' : undefined,
    },
    {
      label: 'Cash Position',
      value: f.cash !== null ? formatCurrency(f.cash) : '—',
    },
    {
      label: 'Total Debt',
      value: f.debt !== null ? formatCurrency(f.debt) : '—',
      color: f.debt !== null && f.cash !== null && f.debt > f.cash ? 'text-sell' : undefined,
    },
    {
      label: 'Current Ratio',
      value: f.currentRatio !== null ? formatRatio(f.currentRatio) : '—',
      color: f.currentRatio !== null ? (f.currentRatio >= 1.0 ? 'text-buy' : 'text-sell') : undefined,
    },
    {
      label: 'Sector',
      value: p.sector || '—',
      span: true,
    },
    {
      label: 'Industry',
      value: p.industry || '—',
      span: true,
    },
  ];
}

export default function FinancialCard({ financials, profile }: FinancialCardProps) {
  const metrics = buildMetrics(financials, profile);

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 animate-fade-in">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-accent" />
        Financial Overview &amp; Data
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`bg-white/[0.04] rounded-xl p-3 space-y-1 border border-white/[0.04] ${
              metric.span ? 'col-span-2' : ''
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-text-muted">
              {metric.label}
            </p>
            <p
              className={`text-base sm:text-lg font-mono font-semibold truncate ${metric.color ?? 'text-text-primary'}`}
              title={metric.value}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
