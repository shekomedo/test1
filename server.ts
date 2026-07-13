import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// ─── Rate limiter (in-memory, per IP) ───────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;   // max 20 requests per minute per IP

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();

  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }

  entry.count++;

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetTime / 1000)));

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: "Too many requests. Please wait before trying again.",
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
    return;
  }

  next();
}

// ─── Payload size middleware ────────────────────────────────────────────────
function validatePayloadSize(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Express already has a 50mb limit, but add a safety check on the body
  const bodySize = req.headers["content-length"];
  if (bodySize && parseInt(bodySize, 10) > 5 * 1024 * 1024) {
    // API requests shouldn't exceed 5MB payload
    res.status(413).json({ error: "Request payload too large. Max 5 MB for API calls." });
    return;
  }
  next();
}

// ─── Validate API key exists ────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
  console.warn(
    "⚠️  WARNING: GEMINI_API_KEY is not set or is still the placeholder value. " +
    "AI features will not work. Set it in your .env file."
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Apply rate limiting and payload validation to API routes
  app.use("/api/", validatePayloadSize);
  app.use("/api/", rateLimit);

  app.post("/api/smart-insights", async (req, res) => {
    try {
      const { profile, sampleData } = req.body;
      if (!profile || !sampleData) {
        return res.status(400).json({ error: "Missing profile or sampleData" });
      }

      // Validate sampleData is an array and not too large
      if (!Array.isArray(sampleData) || sampleData.length > 100) {
        return res.status(400).json({ error: "sampleData must be an array with at most 100 rows" });
      }

      const systemInstruction = `You are DataForge AI's Smart Insights engine.
Your task is to generate a natural-language summary of a dataset based on its profile and a sample of rows.
Generate a 3-paragraph summary covering:
1. Dataset shape and overview.
2. Key quality issues (missing values, duplicates, outliers).
3. Statistical findings and notable anomalies based on the sample.

Write in a professional, clear, and concise tone.`;

      const prompt = `Dataset Profile:
${JSON.stringify(profile, null, 2)}

Sample Data (first few rows):
${JSON.stringify(sampleData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
            },
            required: ["summary"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate insights" });
    }
  });

  app.post("/api/ai-clean", async (req, res) => {
    try {
      const { prompt, samples } = req.body;
      if (!prompt || !samples) {
        return res.status(400).json({ error: "Missing prompt or samples" });
      }

      // Validate prompt length
      if (typeof prompt !== "string" || prompt.length > 500) {
        return res.status(400).json({ error: "Prompt must be a string under 500 characters" });
      }

      // Validate samples
      if (!Array.isArray(samples) || samples.length > 20) {
        return res.status(400).json({ error: "Samples must be an array with at most 20 items" });
      }

      const systemInstruction = `You are an AI code generator.
Your task is to write the body of a JavaScript function that takes a string argument 'value' and returns the transformed 'value' based on the user's instructions.
The function body should ONLY contain valid JavaScript code that can be executed inside a new Function('value', '...your code...').
DO NOT include function signatures or backticks, JUST the code logic. Example: 'return value.trim();' or 'return value.replace(/[^0-9]/g, "");'. If the operation fails or is impossible, just return the original value.`;

      const aiPrompt = `User Request: ${prompt}
Sample values to transform:
${JSON.stringify(samples, null, 2)}

Write the JS function body to transform 'value'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: aiPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              functionBody: { type: Type.STRING },
            },
            required: ["functionBody"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate cleaning function" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();