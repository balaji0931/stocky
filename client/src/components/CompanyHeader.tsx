import type { CompanyProfile } from '../types';

interface CompanyHeaderProps {
  profile: CompanyProfile;
  dataStatus?: "COMPLETE" | "PARTIAL" | "INSUFFICIENT";
  dataConfidence?: number;
}

export default function CompanyHeader({
  profile,
  dataStatus = "COMPLETE",
  dataConfidence = 5,
}: CompanyHeaderProps) {
  const firstLetter = profile.name.charAt(0).toUpperCase();

  // Generate a deterministic hue from the ticker string
  const hue = profile.ticker
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  const stars = "★".repeat(dataConfidence) + "☆".repeat(5 - dataConfidence);
  const confidenceLabel =
    dataStatus === "COMPLETE"
      ? "High"
      : dataStatus === "PARTIAL"
        ? "Medium"
        : "Low (Limited filings)";

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="flex items-start justify-between gap-8 flex-wrap">
        {/* ── Left: Logo + Company Info ── */}
        <div className="flex items-start gap-5 min-w-0 flex-1">
          {/* Logo / Fallback */}
          {profile.logo ? (
            <img
              src={profile.logo}
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white/10"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ring-2 ring-white/10"
              style={{ backgroundColor: `hsl(${hue}, 55%, 42%)` }}
            >
              {firstLetter}
            </div>
          )}

          <div className="min-w-0 space-y-2">
            {/* Name + Ticker pill */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary truncate">
                {profile.name}
              </h1>
              <span className="bg-accent/15 text-accent text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap tracking-wide">
                {profile.ticker}
              </span>
            </div>

            {/* Sector · Industry · Exchange */}
            <p className="text-sm text-text-secondary">
              {profile.sector}
              {profile.industry && <> · {profile.industry}</>}
              {profile.exchange && <> · {profile.exchange}</>}
            </p>

            {/* Data Confidence Stars */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-amber-400 font-mono text-sm tracking-wider leading-none">
                {stars}
              </span>
              <span className="text-xs text-text-muted">Data Confidence:</span>
              <span
                className={`text-xs font-bold ${
                  dataStatus === 'COMPLETE'
                    ? 'text-buy'
                    : dataStatus === 'PARTIAL'
                      ? 'text-hold'
                      : 'text-sell'
                }`}
              >
                {confidenceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
