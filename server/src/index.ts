import express from "express";
import cors from "cors";
import { env } from "./config.js";
import investmentRoutes from "./routes/investment.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", investmentRoutes);

// Uptime monitor keep-alive route
app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    analysis: null,
    error: "Internal server error.",
  });
});

app.listen(parseInt(env.PORT), () => {
  logger.log(`\n  Stocky Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]\n`);
});
