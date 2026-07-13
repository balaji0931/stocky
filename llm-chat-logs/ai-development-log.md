# Stocky — AI Development Log

This document records the AI-assisted development process followed while building **Stocky**. It focuses on the engineering decisions, design iterations, debugging process, architectural trade-offs, and lessons learned throughout the project. It is intended to accompany the README and demonstrate how AI was used as an engineering assistant during development.

> **Note:** This document is a development log, not a verbatim export of every AI conversation. It captures the major technical discussions and the resulting implementation decisions.

---

## 1. Initial Architecture

### Context
The assignment required an AI Investment Research Agent using React/Next.js, Node.js and LangChain/LangGraph.

### Final Decision
- React (Vite) + TypeScript frontend
- Express + TypeScript backend
- LangGraph orchestration
- REST communication

Why:
- Independent deployment
- Faster frontend development
- Clear separation of concerns

---

## 2. LangGraph Workflow

Rather than relying on one large prompt, the application was designed as a 7-stage pipeline:

1. Input Parser
2. Company Lookup
3. Financial Research
4. News Research
5. Industry Analysis
6. Deterministic Scoring
7. Final Recommendation

Reasons:
- Smaller prompts
- Better maintainability
- Easier debugging
- Fault isolation

---

## 3. Deterministic Scoring

A hybrid scoring approach was adopted.

Deterministic:
- Revenue Growth
- Operating Margin
- Debt
- Liquidity
- Valuation

LLM:
- Business Quality
- Competitive Position
- Risks
- Final Thesis

Reason:
Numeric scores remain reproducible while qualitative analysis benefits from LLM reasoning.

---

## 4. Financial APIs

Primary provider:
- Financial Modeling Prep

Additional improvements:
- Finnhub integration
- Fallback handling
- 24-hour in-memory cache

Reason:
Increase reliability while staying within free-tier limits.

---

## 5. LLM Migration

Initial provider:
- Gemini

Issue:
Repeated quota (429) errors.

Final provider:
- OpenRouter

Additional work:
- JSON sanitization
- Markdown fence removal
- Robust parsing

---

## 6. UI Refinement

Major improvements:
- Single scrolling report
- Better dashboard hierarchy
- Smaller score gauge
- Improved spacing
- Standardized cards

Goal:
Present the output as a professional investment report.

---

## 7. Production Readiness

Implemented:
- Centralized logger
- Production log suppression
- /ping health endpoint
- Environment-based API URLs
- Build verification
- Code cleanup

---

## 8. Documentation

Expanded documentation includes:
- Architecture
- Scoring methodology
- API documentation
- Engineering decisions
- Trade-offs
- Deployment
- Example runs

---

## 9. Lessons Learned

- Deterministic calculations improve consistency.
- LangGraph simplifies multi-step AI workflows.
- API fallbacks and caching improve robustness.
- Production polish matters as much as functionality.

---

## AI Usage Summary

AI assisted throughout development in:
- Architecture exploration
- LangGraph workflow design
- Prompt engineering
- API integration
- Debugging
- OpenRouter migration
- UI refinement
- Documentation

All implementation decisions were reviewed, tested, and integrated into the final application before submission.
