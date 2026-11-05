import { Router } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

const DEFAULT_MODEL = "gemini-3.8-flash";
const MAX_HISTORY = 10;
const MAX_CHARS = 1000;

const SYSTEM_PROMPT = `You are the ParkShare assistant.
ParkShare ("Smart Parking for a Smarter Tomorrow") is a community parking platform that connects drivers with owners of unused private parking spaces.

What you can help with:
- Drivers: how to search for parking, compare spaces, book a slot, cancel, and pay.
- Owners: how to list a space, set pricing and availability hours, and track earnings.
- General questions about how ParkShare works.

Rules:
- Keep answers short, friendly and practical (2-5 sentences, or a short list).
- ParkShare is still under development. Do not invent specific prices, availability, policies, refund rules or phone numbers. If you don't know something, say so and suggest contacting the ParkShare team.
- Never ask for passwords, card numbers, OTPs or other sensitive details.
- Stay on topic (parking, bookings, ParkShare). Politely decline unrelated requests.`;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please wait a minute and try again." },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.trim().slice(0, MAX_CHARS),
    }))
    .slice(-MAX_HISTORY);

  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  return cleaned;
}

async function callGemini(model, apiKey, messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 1500, temperature: 0.6 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

router.post("/", limiter, async (req, res) => {
  // Read env values per request so they are always the ones loaded from .env.
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "";

  if (!apiKey) {
    return res.status(503).json({ error: "The assistant is not configured yet." });
  }

  const messages = cleanMessages(req.body?.messages);
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Please send a message." });
  }

  try {
    // Try the main model twice, then the fallback model (if set) when Google is overloaded.
    const attempts = [model, model, ...(fallbackModel ? [fallbackModel] : [])];
    let result = null;

    for (let i = 0; i < attempts.length; i++) {
      result = await callGemini(attempts[i], apiKey, messages);
      if (result.response.ok) break;

      console.error(`Gemini error (${attempts[i]}):`, result.response.status, result.data?.error?.message);
      const retryable = [429, 500, 503].includes(result.response.status);
      if (!retryable) break;
      if (i < attempts.length - 1) await sleep(2000);
    }

    if (!result.response.ok) {
      const busy = [429, 503].includes(result.response.status);
      return res.status(busy ? 503 : 502).json({
        error: busy
          ? "The assistant is busy right now. Please try again in a minute."
          : "The assistant is unavailable right now. Please try again.",
      });
    }

    const reply = (result.data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    return res.json({ reply: reply || "Sorry, I couldn't come up with an answer." });
  } catch (err) {
    console.error("Chat error:", err?.message);
    return res.status(502).json({ error: "The assistant is unavailable right now. Please try again." });
  }
});

export default router;