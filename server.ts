import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent set for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Empathetic Chatbot API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Build chat context from history
    const contextHistory = (history || [])
      .slice(-10) // Only take recent 10 messages to avoid context overflow and keep latency low
      .map((h: any) => {
        const senderLabel = h.sender === 'user' ? (userName || 'User') : 'Noor (companion)';
        return `${senderLabel}: ${h.text}`;
      })
      .join("\n");

    const systemInstruction = `You are "Noor", a gentle, warm, wise, and deeply supportive recovery companion for someone experiencing stress, burnout, homework burden, or emotional heaviness.
The user's name is "${userName || 'friend'}".
Guidelines for your voice and behavior:
- Tone: Validate their pain/exhaustion first, be comforting, non-judgmental, warm, and highly personalized to what they share.
- Human-like, dedicated, and helpful. Actively address what the user writes. Do not give generic template replies.
- Keep responses warm, deeply understanding, but highly concise (strictly under 3 sentences, maximum 60-80 words). Short, focused, and conversational responses make the interaction feel live, fast, and intimate. Actively address their exact situation (e.g. if they want to rest but have too much homework, validate how stressful that conflict feels, encourage gentle pacing, and remind them that doing even a tiny bit or resting guilt-free is okay).
- Suggest 2 to 3 very short, actionable suggestion chips matching their emotional state (e.g., "Try 1-Min Breathing Space", "Suggest a tiny rest", "Just sit in quiet"). Keep suggestion text short (1-4 words each).
- Set isCrisis to true ONLY if they show active intent of self-harm, suicide, or severe danger.`;

    const prompt = `Context of past conversation:\n${contextHistory}\n\nLatest user message: "${message}"\n\nPlease respond to the user as Noor using the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 200,
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
    if (!botResponseText) {
      throw new Error("No response text from Gemini API.");
    }

    const botJSON = JSON.parse(botResponseText.trim());
    res.json(botJSON);

  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    // Provide a gentle fallback response
    res.status(500).json({
      text: "I'm here, and I'm listening. I'm having a little trouble connecting with my thoughts right now, but please take a gentle deep breath with me. You are doing enough.",
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "Suggest a calming tip"]
    });
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
