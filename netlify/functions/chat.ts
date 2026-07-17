import { GoogleGenAI, Type } from "@google/genai";

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

export const handler = async (event: any, context: any) => {
  // CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { message, history, userName } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Message is required." }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          text: `Hello ${userName || 'friend'}, I hear you. However, I notice that my GEMINI_API_KEY is not configured in your Netlify Environment Variables.

To fix this and activate your AI companion:
1. Go to your Netlify Dashboard.
2. Select your site.
3. Go to Site configuration > Environment variables.
4. Add a variable named "GEMINI_API_KEY" with your Gemini API key value.
5. Go to the "Deploys" tab, click "Trigger deploy", and choose "Clear cache and deploy site" to apply the changes.`,
          isCrisis: false,
          suggestions: ["Setup Guide Completed", "Try 1-Min Breathing Space"]
        }),
      };
    }

    // Build chat context from history (up to last 10 messages)
    const contextHistory = (history || [])
      .slice(-10)
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

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(botJSON),
    };

  } catch (error: any) {
    console.error("Gemini API Error in Netlify Function:", error);
    const errMsg = error?.message || String(error);
    
    let userFriendlyMsg = "I'm here, listening. I had a little trouble processing that, but please take a deep breath with me. You are doing enough.";
    if (errMsg.includes("API key") || errMsg.includes("API_KEY") || errMsg.includes("key not valid") || errMsg.includes("invalid")) {
      userFriendlyMsg = "I hear you, but the GEMINI_API_KEY configured on your hosting provider is invalid or expired. Please check your Netlify environment variables.";
    } else {
      userFriendlyMsg = `I'm here, listening. I ran into an error: "${errMsg}". Please take a gentle breath with me. You are doing enough.`;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        text: userFriendlyMsg,
        isCrisis: false,
        suggestions: ["Try 1-Min Breathing Space", "Suggest a calming tip"]
      }),
    };
  }
};
