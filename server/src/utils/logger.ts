import { env } from "../config.js";

/**
 * Unified logger utility.
 * Silences info, log, and warning logs in production to prevent terminal noise.
 * Always prints error logs for production error tracking.
 */
export const logger = {
  log: (...args: any[]): void => {
    if (env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  info: (...args: any[]): void => {
    if (env.NODE_ENV !== "production") {
      console.info(...args);
    }
  },
  warn: (...args: any[]): void => {
    if (env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  },
  error: (...args: any[]): void => {
    console.error(...args);
  },
};
