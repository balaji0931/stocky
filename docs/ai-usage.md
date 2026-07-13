# AI Usage & Verification Log

In compliance with the take-home assignment guidelines, AI usage was mandatory during the building of Stocky. This document details the orchestration, utilization, and manual validation of AI outputs throughout the development cycle.

---

## 1. AI Tools & Models Used

| Tool / Assistant | Purpose | Models Used |
|---|---|---|
| **Antigravity Coding Assistant** | Core code generation, file manipulation, and system compilation validation. | Claude 3.5 Sonnet / Gemini 1.5 Pro |
| **Google AI Studio** | Testing prompts, formatting schemas, and testing token usage. | Gemini 2.0 Flash / Gemini 2.0 Flash Lite |
| **OpenRouter** | Testing fallback behavior and validating response schemas on alternative providers. | google/gemini-2.0-flash-lite:free |

---

## 2. Code Generation & Attribution

### 🤖 What AI Generated
- **Component Boilerplates:** The basic visual structure of cards like `ScoreCard.tsx` (SVG logic), `CompanyHeader.tsx`, and `FinancialCard.tsx` (ratios table mapping).
- **LangGraph Class Definitions:** The initial boilerplate for wrapping Express routes around `investmentAgent.invoke()`.
- **Zod Schemas:** Initial drafts of Zod type matching structures to parse incoming JSON strings from the model.

### 🧠 What was Hand-Coded / Architected Manually
- **Hybrid Scoring Formula:** The deterministic mathematical rubric (6 binary health checks, growth bands, and valuation thresholds) was entirely human-designed to ensure reproducibility.
- **Robust Ticker Matcher (FMP):** The scoring system that parses multi-exchange search results (e.g. prioritizing NASDAQ listings and USD listings over regional suffixes) was custom-written.
- **Exclusive OpenRouter Integration:** Pure HTTP fetch client inside `llm.ts` to route all synthesis queries directly to OpenRouter models (free and paid tiers), completely bypassing Google API credentials.
- **GNews Query Cleaner:** The regex utility that strips dots and corporate suffixes (`cleanQueryForGNews`) to bypass GNews query syntax validation errors (400 Bad Requests).
- **Graceful Partial Analysis States:** The error-handling strategy that allows the graph to proceed with partial data when downstream API endpoints fail.

---

## 3. Prompt Engineering Iterations

### News Sentiment Prompt
- **Draft 1:** *"Tell me if the news is good or bad."*
- **Issue:** Returned freeform chat paragraphs that broke the backend parser.
- **Revision:** Instructed to return structured JSON format only, and explicitly defined the sentiment rating schema (`"sentiment": "positive" | "negative" | "neutral"`). Escaped double braces for template variables.

### Industry & Qualitative Scoring Prompt (Consolidated)
- **Draft 1:** 3 separate prompts for industry analysis, business quality scoring, and risk analysis.
- **Issue:** Hit Gemini free-tier rate limits (429 requests per minute) after only 2 company lookups.
- **Revision:** Combined into one single prompt (`INDUSTRY_AND_QUALITATIVE_SCORING_PROMPT`). Reduced overall API token requests by 65% while keeping prompt reasoning scope aligned.

---

## 4. Verification & Validation Process

To ensure output quality and avoid common hallucinations:
1. **TypeScript Validation:** Both `client/` and `server/` codebase compilation was verified using strict checking (`npx tsc --noEmit`).
2. **JSON Validation checks:** Added try/catch JSON parsers inside `invokeAndParseJSON` to log malformed returns and cleanly downgrade response statuses instead of crashing the server.
3. **Punctuation Filtering:** Discovered and patched punctuation constraints in the GNews API to guarantee search execution across companies containing dots (e.g., `Apple Inc.`).
