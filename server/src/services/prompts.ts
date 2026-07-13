// ============================================
// Prompt templates for all LLM-powered nodes
// ============================================

// ============================================
// NEWS SENTIMENT
// ============================================

export const NEWS_SENTIMENT_PROMPT = `
You are an experienced financial news analyst.

Analyze the following recent news articles about {companyName}.

Articles:
{articles}

Return ONLY valid JSON.

{{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "sentimentScore": <number between -1.0 and 1.0>,
  "keyPositiveCatalysts": [
    "<positive factor>",
    "<positive factor>",
    "<positive factor>"
  ],
  "keyRisks": [
    "<risk>",
    "<risk>",
    "<risk>"
  ],
  "summary": "<Maximum 100 words summarizing the news>"
}}

Rules:
- Do NOT repeat article titles.
- Do NOT explain your reasoning.
- Return valid JSON only.
`;

// ============================================
// INDUSTRY + BUSINESS QUALITY
// ============================================

export const INDUSTRY_AND_QUALITATIVE_SCORING_PROMPT = `
You are a senior equity research analyst.

Company Information

Company: {companyName}
Sector: {sector}
Industry: {industry}
Description: {description}

Financial Highlights

Revenue Growth: {revenueGrowth}%
PE Ratio: {peRatio}
Debt-to-Equity: {debtToEquity}
Market Cap: {marketCap}

News

Sentiment: {newsSentiment}

Summary:
{newsSummary}

Evaluate the company's qualitative business quality and overall risk.

Return ONLY valid JSON.

{
  "industrySummary":"<Maximum 120 words>",

  "businessQuality":{
    "score":<0-20>,
    "reasoning":"<Maximum 80 words>"
  },

  "riskProfile":{
    "score":<0-20>,
    "reasoning":"<Maximum 80 words>",
    "topRisks":[
      {"factor": "<e.g. Regulatory Pressure>", "deduction": <positive score deduction number, usually 2 to 5>},
      {"factor": "<e.g. Valuation Multiple>", "deduction": <positive score deduction number, usually 2 to 5>},
      {"factor": "<e.g. Competitive Saturation>", "deduction": <positive score deduction number, usually 2 to 5>}
    ]
  }
}

Rules

- Do not invent financial numbers.
- Base scores on available information.
- Keep responses concise.
- Return JSON only.
`;

// ============================================
// FINAL RECOMMENDATION
// ============================================

export const RECOMMENDATION_WITH_REASONING_PROMPT = `
You are a senior investment analyst.

Company

{companyName} ({ticker})

Company Summary

{companyInfo}

Financial Summary

{financials}

News Summary

{news}

Industry Summary

{industry}

Investment Score

Overall Score: {totalScore}/100

Decision: {decision}

Score Breakdown

Financial Health: {financialHealthScore}/30

Growth: {growthScore}/20

Business Quality: {businessScore}/20

Risk Profile: {riskScore}/20

Valuation: {valuationScore}/10

Your job is NOT to calculate the decision.

The decision has already been determined.

Explain WHY this decision is appropriate.

Return ONLY valid JSON.

{
  "confidence": <0-100>,
  "thesis": "<Maximum 80 words summarizing the core investment thesis>",
  "pros": [
    "<pro factor 1>",
    "<pro factor 2>",
    "<pro factor 3>"
  ],
  "cons": [
    "<con factor 1>",
    "<con factor 2>",
    "<con factor 3>"
  ],
  "catalysts": [
    "<key catalyst 1>",
    "<key catalyst 2>"
  ],
  "verdict": "<Maximum 80 words detailing the final verdict explanation>",
  "shortTermOutlook": "<Maximum 60 words for short term perspective>",
  "longTermOutlook": "<Maximum 60 words for long term perspective>"
}

Rules

- Do not change the investment decision.
- Do not invent financial numbers.
- Reference only supplied data.
- Keep responses concise.
- Return JSON only.
`;
