import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface LoadingStateProps {
  companyName: string;
}

interface Step {
  label: string;
  delay: number; // in milliseconds
}

const STEPS: Step[] = [
  { label: "Finding Company", delay: 0 },
  { label: "Fetching Financials", delay: 2500 },
  { label: "Reading News & Sentiment", delay: 6500 },
  { label: "Assessing Business Moat & Risks", delay: 13500 },
  { label: "Calculating Scores", delay: 24000 },
  { label: "Writing final Recommendation", delay: 30000 },
];

export default function LoadingState({ companyName }: LoadingStateProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, idx) => {
      if (idx === 0) return null;
      return setTimeout(() => {
        setActiveStepIndex(idx);
      }, step.delay);
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-bg-card border border-border rounded-2xl pulse-glow p-8 max-w-md w-full text-center space-y-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3.5 }} />
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text-primary">
            Analyzing {companyName}…
          </h2>
          <p className="text-text-muted text-xs">
            Executing the Reasearch
          </p>
        </div>

        {/* Progress List */}
        <div className="bg-white/5 rounded-xl p-4 text-left space-y-3.5 border border-white/5">
          {STEPS.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isActive = index === activeStepIndex;

            let icon = <Circle className="w-4.5 h-4.5 text-text-muted/40" />;
            let textClass = "text-text-muted/50";

            if (isCompleted) {
              icon = <CheckCircle2 className="w-4.5 h-4.5 text-buy shrink-0" />;
              textClass = "text-text-secondary font-medium";
            } else if (isActive) {
              icon = <Loader2 className="w-4.5 h-4.5 text-accent animate-spin shrink-0" />;
              textClass = "text-text-primary font-semibold";
            }

            return (
              <div key={index} className={`flex items-center gap-3 text-sm ${textClass}`}>
                {icon}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
