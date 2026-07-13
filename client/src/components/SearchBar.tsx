import { useState, useEffect, useRef, type FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchTickers } from "../lib/api";

interface SearchBarProps {
  onSearch: (company: string, ticker?: string) => void;
  isLoading: boolean;
}

interface Suggestion {
  symbol: string;
  name: string;
  exchange: string;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce suggest search Suggestion fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchTickers(query);
        setSuggestions(res);
        setIsOpen(true);
      } catch (err) {
        console.error("Suggestions fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !isLoading) {
      // Analyze the first suggestion if available, else use query
      if (suggestions.length > 0) {
        const best = suggestions[0];
        onSearch(best.name, best.symbol);
        setQuery(`${best.name} (${best.symbol})`);
      } else {
        onSearch(trimmed);
      }
      setIsOpen(false);
    }
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(`${s.name} (${s.symbol})`);
    onSearch(s.name, s.symbol);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-2 w-full">
        <div className="flex items-center gap-2">
          {/* Input with search icon & search progress */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(suggestions.length > 0)}
              placeholder="Search companies or tickers (e.g. Visa, TSLA, Apple)"
              className="w-full bg-bg-input text-text-primary text-lg rounded-xl p-4 pl-12 pr-12 border border-border focus:border-accent focus:outline-none transition-colors placeholder:text-text-muted"
              disabled={isLoading}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-spin" />
            )}
          </div>

          {/* Analyze button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing…
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[300px] overflow-y-auto">
          {suggestions.map((s, index) => (
            <button
              key={`${s.symbol}-${index}`}
              onClick={() => handleSelect(s)}
              className="w-full text-left p-3.5 hover:bg-bg-card-hover border-b border-border/40 last:border-0 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center">
                <span className="font-bold text-accent font-mono text-base group-hover:underline">
                  {s.symbol}
                </span>
                <span className="text-text-primary text-sm font-medium ml-4 truncate max-w-[250px] sm:max-w-[400px]">
                  {s.name}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-text-muted px-2 py-0.5 rounded bg-white/5 border border-white/5 group-hover:border-accent/40 group-hover:text-text-primary">
                {s.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
