import { ChatMessage } from './types';

export interface BotResponse {
  text: string;
  isCrisis: boolean;
  suggestions?: string[];
}

const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die", "self-harm", "hurt myself"
];

const EMOTIONAL_KEYWORDS = {
  exhausted: ["tired", "exhausted", "fatigued", "no energy", "drained", "sleepy", "burned out", "burnout"],
  overwhelmed: ["stressed", "overwhelmed", "too much", "piling up", "pressure", "can't cope", "suffocating", "stuck"],
  sad: ["sad", "lonely", "unhappy", "depressed", "crying", "miserable", "hurt", "grief", "empty"],
  anxious: ["anxious", "anxiety", "scared", "panicked", "panic", "worried", "nervous", "shaking", "fear"],
  angry: ["angry", "mad", "furious", "annoyed", "frustrated", "irritated", "hate"],
  numb: ["numb", "nothing", "blank", "detached", "don't care", "hollow"]
};

export function detectCrisis(text: string): boolean {
  const cleanText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => cleanText.includes(keyword));
}

export function generateBotResponse(
  message: string,
  history: ChatMessage[],
  userName: string = "friend"
): BotResponse {
  const cleanMessage = message.toLowerCase();

  // Check Crisis first
  if (detectCrisis(cleanMessage)) {
    return {
      text: "Please pause for a moment. Your life and your pain matter, and you do not have to carry this alone.",
      isCrisis: true
    };
  }

  // Count negative turns in the last 5 turns of conversation
  // Filter for user messages that contain any emotional negative keywords
  const isNegativeMessage = (txt: string) => {
    const lowerTxt = txt.toLowerCase();
    const allKeywords = [
      ...EMOTIONAL_KEYWORDS.exhausted,
      ...EMOTIONAL_KEYWORDS.overwhelmed,
      ...EMOTIONAL_KEYWORDS.sad,
      ...EMOTIONAL_KEYWORDS.anxious,
      ...EMOTIONAL_KEYWORDS.angry,
      ...EMOTIONAL_KEYWORDS.numb
    ];
    return allKeywords.some(kw => lowerTxt.includes(kw));
  };

  const userMessages = history.filter(h => h.sender === 'user');
  const lastUserMessages = userMessages.slice(-4); // last 4 messages in history plus current
  const negativeCount = lastUserMessages.filter(m => isNegativeMessage(m.text)).length + (isNegativeMessage(message) ? 1 : 0);

  // If high negative frequency (e.g. 4 or more negative user inputs in recent history)
  if (negativeCount >= 3) {
    return {
      text: `Dear ${userName}, I hear how much pain and heaviness you are carrying right now. It is okay to reach for help when things feel like too much. You do not have to carry this alone. Would it feel okay to reach out to someone who cares about you, or a gentle support resource today?`,
      isCrisis: false,
      suggestions: ["View Crisis Resources", "Try a 1-Minute Breathing Space", "Let's sit in quiet"]
    };
  }

  // Detect specific emotion groups
  if (EMOTIONAL_KEYWORDS.exhausted.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `I hear you, ${userName}. Feeling exhausted to your core makes even the smallest task feel like a mountain. You've been holding so much. Please know that it is completely okay to let everything go for a little while. Can we try a simple 1-minute breathing space together to let your body soften, or would you prefer to just sit quietly with no expectations?`,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "Suggest a tiny rest action", "Just sit in quiet"]
    };
  }

  if (EMOTIONAL_KEYWORDS.overwhelmed.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `It sounds like things are incredibly intense and piling up, ${userName}. When we are overwhelmed, our nervous system is working in overdrive. It is totally natural to feel frozen or stressed. Would you like to try to name just one tiny thing we can gently lay aside for today, or would a short breathing space feel comforting?`,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "Give me a micro-tip for overwhelm", "Let's pause and reset"]
    };
  }

  if (EMOTIONAL_KEYWORDS.sad.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `I'm so sorry there's sadness and loneliness touching your heart today, ${userName}. It can feel so heavy and isolating, like being on a cold island. I am right here holding space with you. Your feelings are completely welcome here. Is there a tiny warm comfort, like a hot drink or a soft blanket, that you can wrap yourself in right now?`,
      isCrisis: false,
      suggestions: ["Give me a warm comfort tip", "Try 1-Min Breathing Space", "I want to share more"]
    };
  }

  if (EMOTIONAL_KEYWORDS.anxious.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `Anxiety is so noisy and feels so intensely real in the body, ${userName}. You are completely safe here. Let's try to gently anchor you back to the present. Feel the ground beneath you—stable and steady. Would you like to try a slow, grounding box-breathing exercise with me right now?`,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "A grounding exercise", "Let's talk slowly"]
    };
  }

  if (EMOTIONAL_KEYWORDS.angry.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `It is completely valid to feel angry, ${userName}. Anger is a powerful emotion, often protecting a very tender, hurt, or exhausted part of you. I want to give you full space to express it without any judgment. Would you like to vent about what is fueling this heat, or would a gentle physical reset feel better?`,
      isCrisis: false,
      suggestions: ["Vent a bit more", "Suggest a physical release", "Breathing Space"]
    };
  }

  if (EMOTIONAL_KEYWORDS.numb.some(kw => cleanMessage.includes(kw))) {
    return {
      text: `Feeling numb or empty can be your mind's very natural way of protecting you when things have been too intense or exhausting for too long, ${userName}. You don't have to force yourself to feel anything right now. It is okay to just be. Would you like a simple, gentle sensory tip to softly reconnect, or would you like to just rest?`,
      isCrisis: false,
      suggestions: ["Gentle sensory tip", "Just rest in silence", "Breathing Space"]
    };
  }

  // Greeting replies
  if (cleanMessage.includes("hello") || cleanMessage.includes("hi") || cleanMessage.includes("hey") || cleanMessage.includes("noor")) {
    return {
      text: `Hello, ${userName}. I'm Noor, your gentle companion. How is your energy holding up today? I'm here to listen, guide you through a soft breathing space, or help you build a small, restful step for your routine.`,
      isCrisis: false,
      suggestions: ["Do a quick check-in", "Try 1-Min Breathing Space", "Suggest a tiny routine"]
    };
  }

  // Default gentle replies
  return {
    text: `Thank you for sharing that with me, ${userName}. You are carrying things one breath, one small moment at a time, and that is more than enough. Is there any way I can support you right now? We could try a breathing space, explore a calming routine, or just talk.`,
    isCrisis: false,
    suggestions: ["Try 1-Min Breathing Space", "Suggest a routine", "I'd like to share more"]
  };
}

export function getMicroTip(category: string): string {
  switch (category) {
    case 'exhausted':
      return "Place both feet flat on the floor, close your eyes, and allow your shoulders to drop half an inch. Let your breath fall into its own natural, easy rhythm.";
    case 'overwhelmed':
      return "Look around and name three blue things. This gently coaxes your brain out of the fight-or-flight loops and back into your physical space.";
    case 'sad':
      return "Offer yourself a warm embrace, or wrap a soft blanket tightly around your shoulders. The gentle physical pressure can signal safety to your nervous system.";
    case 'anxious':
      return "Breathe in for a count of 4, hold for 4, breathe out for a count of 6. A longer exhale activates your body's relaxation response.";
    case 'angry':
      return "Tense your hands into tight fists for 5 seconds, then slowly, fully open them, letting your fingers go completely limp. Repeat this twice.";
    default:
      return "Place a warm hand over your chest, feel the gentle rise and fall of your breath, and whisper to yourself: 'I am allowed to move slowly today.'";
  }
}
