import { env } from "../config.js";
import { logger } from "../utils/logger.js";

const MODEL_NAME = process.env.OPENROUTER_MODEL || "openrouter/free";

logger.log(`🤖 LLM Provider: OpenRouter | Model: ${MODEL_NAME}`);

/**
 * Execute chat completion via OpenRouter REST API using native fetch.
 */
async function callOpenRouter(prompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://github.com/InsideIIM/Stocky",
      "X-Title": "Stocky Investment Research Agent",
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${errorBody}`);
  }

  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Invoke OpenRouter and parse JSON from the response.
 * Strips markdown code fences if present.
 */
export async function invokeAndParseJSON<T>(prompt: string): Promise<T> {
  let content = "";

  try {
    content = await callOpenRouter(prompt);
  } catch (error) {
    logger.error("   ❌ OpenRouter call failed:", (error as Error).message);
    throw error;
  }

  content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  try {
    return JSON.parse(content) as T;
  } catch (parseError) {
    logger.error("Failed to parse LLM JSON response:", content.substring(0, 500));
    throw new Error(`OpenRouter returned invalid JSON: ${(parseError as Error).message}`);
  }
}
