import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-bg-card border border-border rounded-2xl p-12 max-w-lg w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-sell" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Something went wrong
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {error}
          </p>
        </div>

        {/* Retry button */}
        <button
          onClick={onRetry}
          className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
