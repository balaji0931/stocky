import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  FMP_API_KEY: z.string().min(1, "FMP_API_KEY is required"),
  FINNHUB_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  PORT: z.string().default("3001"),
  NODE_ENV: z.string().default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Missing environment variables:");
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  });
  console.error("\n   Copy .env.example to server/.env and fill in your API keys.");
  process.exit(1);
}

export const env = parsed.data;
