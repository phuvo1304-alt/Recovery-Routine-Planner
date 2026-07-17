import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { generateBotResponse } from "./src/chatBotLogic";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Empathetic Chatbot API Route
app.post("/api/chat", async (req, res) => {
  const { message, history, userName } = req.body || {};
  try {
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `Hello ${userName || 'friend'}, I hear you. However, I notice that the GEMINI_API_KEY environment variable is not configured in this local/server environment. Please make sure you have defined GEMINI_API_KEY in your settings or .env file.`,
        isCrisis: false,
        suggestions: ["Setup Guide", "Try 1-Min Breathing Space"]
      });
    }

    // Build chat context from history
    const contextHistory = (Array.isArray(history) ? history : [])
      .slice(-10) // Only take recent 10 messages to avoid context overflow and keep latency low
      .map((h: any) => {
        if (!h || !h.text) return '';
        const senderLabel = h.sender === 'user' ? (userName || 'User') : 'Noor (companion)';
        return `${senderLabel}: ${h.text}`;
      })
      .filter((line: string) => line !== '')
      .join("\n");

    const systemInstruction = `You are "Noor", a gentle, warm, wise, and deeply supportive recovery companion for someone experiencing stress, burnout, homework burden, or emotional heaviness.
The user's name is "${userName || 'friend'}".
Guidelines for your voice and behavior:
- Tone: Validate their pain/exhaustion first, be comforting, non-judgmental, warm, and highly personalized to what they share.
- Human-like, dedicated, and helpful. Actively address what the user writes. Do not give generic template replies.
- Keep responses warm, deeply understanding, but highly concise (strictly under 3 sentences, maximum 60-80 words). Short, focused, and conversational responses make the interaction feel live, fast, and intimate. Actively address their exact situation (e.g. if they want to rest but have too much homework, validate how stressful that conflict feels, encourage gentle pacing, and remind them that doing even a tiny bit or resting guilt-free is okay).
- Suggest 2 to 3 very short, actionable suggestion chips matching their emotional state (e.g., "Try 1-Min Breathing Space", "Suggest a tiny rest", "Just sit in quiet"). Keep suggestion text short (1-4 words each).
- Set isCrisis to true ONLY if they show active intent of self-harm, suicide, or severe danger.

CRITICAL: You must respond ONLY with raw JSON matching the specified schema. Never include any introductory text, concluding text, markdown code block ticks, or preamble like "Here is the JSON requested". Start directly with '{' and end with '}'.`;

    const prompt = `Context of past conversation:\n${contextHistory}\n\nLatest user message: "${message}"\n\nPlease respond to the user as Noor. Output ONLY the raw JSON schema without any markdown formatting, backticks, or preamble.`;

    // Helper function to extract JSON from potentially messy model output
    const extractJSON = (text: string): any => {
      const trimmed = text.trim();
      
      // 1. Try direct parsing
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Continue to extraction
      }

      // 2. Try to extract JSON from code block
      const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = trimmed.match(markdownRegex);
      if (match && match[1]) {
        try {
          return JSON.parse(match[1].trim());
        } catch (e) {
          // Continue
        }
      }

      // 3. Try to find first '{' and last '}'
      const startIdx = trimmed.indexOf('{');
      const endIdx = trimmed.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const candidate = trimmed.substring(startIdx, endIdx + 1);
        try {
          return JSON.parse(candidate);
        } catch (e) {
          // Continue
        }
      }

      throw new Error(`Could not parse JSON from response: "${text.substring(0, 100)}..."`);
    };

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    let botJSON: any = null;
    let apiCallSuccessful = false;
    const ai = getAiClient();

    for (const model of modelsToTry) {
      try {
        console.log(`[Companion Bot] Attempting chat with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            maxOutputTokens: 800,
            temperature: 0.7,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "The comforting, deeply personalized, yet concise response from Noor."
                },
                isCrisis: {
                  type: Type.BOOLEAN,
                  description: "True only if immediate self-harm, suicide, or crisis is detected."
                },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2 to 3 short contextually-appropriate suggestion chips (1-4 words each)."
                }
              },
              required: ["text", "isCrisis", "suggestions"]
            }
          }
        });

        const botResponseText = response.text;
        if (botResponseText) {
          botJSON = extractJSON(botResponseText);
          apiCallSuccessful = true;
          console.log(`[Companion Bot] Successfully generated response using model: ${model}`);
          break; // successfully got response and parsed JSON!
        }
      } catch (err: any) {
        console.warn(`[Companion Bot] Model ${model} failed or returned invalid JSON: ${err?.message || err}. Trying next model...`);
      }
    }

    // If API failed for all models, trigger the local fallback response system
    if (!apiCallSuccessful || !botJSON) {
      console.warn("[Companion Bot] All Gemini API models failed. Activating local companion fallback logic.");
      botJSON = generateBotResponse(message, history || [], userName || "friend");
    }

    res.json(botJSON);

  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    try {
      const fallbackJSON = generateBotResponse(message || "", history || [], userName || "friend");
      res.json(fallbackJSON);
    } catch (fallbackErr) {
      res.json({
        text: "I'm here, and I'm listening. Let's take a slow, gentle breath together.",
        isCrisis: false,
        suggestions: ["Try 1-Min Breathing Space", "Suggest a calming tip"]
      });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
