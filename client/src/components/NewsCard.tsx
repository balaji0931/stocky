import { Newspaper, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { NewsSummary } from '../types';
import { formatRelativeDate } from '../lib/utils';

interface NewsCardProps {
  news: NewsSummary;
}

const sentimentConfig = {
  bullish: { label: 'Bullish', icon: TrendingUp, pillClass: 'bg-buy-bg text-buy border border-buy/30' },
  bearish: { label: 'Bearish', icon: TrendingDown, pillClass: 'bg-sell-bg text-sell border border-sell/30' },
  neutral: { label: 'Neutral', icon: Minus, pillClass: 'bg-hold-bg text-hold border border-hold/30' },
} as const;

export default function NewsCard({ news }: NewsCardProps) {
  const config = sentimentConfig[news.overallSentiment];
  const SentimentIcon = config.icon;

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 animate-fade-in space-y-7">
      {/* ── Header ── */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-accent" />
        News &amp; Sentiment
      </h2>

      {/* ── Sentiment banner & summary ── */}
      <div className="space-y-3">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.pillClass}`}>
            <SentimentIcon className="w-4 h-4" />
            {config.label}
          </span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{news.summary}</p>
      </div>

      {/* ── Key Catalysts & Risks ── */}
      {(news.keyPositiveCatalysts.length > 0 || news.keyRisks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border pt-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-buy mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Positive Catalysts
            </h4>
            <ul className="space-y-2">
              {news.keyPositiveCatalysts.map((c, i) => (
                <li key={i} className="text-xs text-text-secondary leading-relaxed list-disc list-inside">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sell mb-3 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              Identified Risks
            </h4>
            <ul className="space-y-2">
              {news.keyRisks.map((r, i) => (
                <li key={i} className="text-xs text-text-secondary leading-relaxed list-disc list-inside">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Articles ── */}
      <div className="border-t border-border pt-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Recent Headlines
        </h3>
        {news.articles.length > 0 ? (
          <ul className="space-y-4">
            {news.articles.map((article, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 -mx-3 rounded-lg transition-colors duration-200 hover:bg-white/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-primary hover:text-accent transition-colors line-clamp-2 font-medium"
                  >
                    {article.title}
                  </a>
                  <p className="text-xs text-text-muted mt-1">
                    {article.source} · {formatRelativeDate(article.publishedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted italic">No recent articles found.</p>
        )}
      </div>
    </div>
  );
}
