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
    if (!txt) return false;
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

  const safeHistory = Array.isArray(history) ? history : [];
  const userMessages = safeHistory.filter(h => h && h.sender === 'user' && h.text);
  const lastUserMessages = userMessages.slice(-4); // last 4 messages in history plus current
  const negativeCount = lastUserMessages.filter(m => m && m.text && isNegativeMessage(m.text)).length + (message && isNegativeMessage(message) ? 1 : 0);

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
    const options = [
      `I hear you, ${userName}. Feeling exhausted to your core makes even the smallest task feel like a mountain. You've been holding so much. Please know that it is completely okay to let everything go for a little while. Can we try a simple 1-minute breathing space together to let your body soften, or would you prefer to just sit quietly with no expectations?`,
      `I hear how depleted you are, ${userName}. When you have no energy left, even breathing feels like effort. You don't have to push, perform, or get anything done right now. Your only job is to exist. Would it feel good to try a micro-tip to relax, or just rest in silence?`,
      `Burnout and exhaustion are your body's urgent request for quiet, ${userName}. Please let yourself rest without guilt or self-judgment today. Let's take a slow pause together—no pressure, no demands.`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "Suggest a tiny rest action", "Just sit in quiet"]
    };
  }

  if (EMOTIONAL_KEYWORDS.overwhelmed.some(kw => cleanMessage.includes(kw))) {
    const options = [
      `It sounds like things are incredibly intense and piling up, ${userName}. When we are overwhelmed, our nervous system is working in overdrive. It is totally natural to feel frozen or stressed. Would you like to try to name just one tiny thing we can gently lay aside for today, or would a short breathing space feel comforting?`,
      `The waves feel so high right now, don't they, ${userName}? When everything demands your attention at once, your mind naturally gets crowded. Let's gently pause the noise. We don't have to solve everything today. Shall we try a brief grounding exercise, or would you like to share what's on your mind?`,
      `I hear the pressure you're under, ${userName}. It's too much for one person to carry. Let's take a step back from the mountain of tasks. We can focus on just this single, immediate moment. Would you like a tiny, quick tip to manage this overwhelm?`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "Give me a micro-tip for overwhelm", "Let's pause and reset"]
    };
  }

  if (EMOTIONAL_KEYWORDS.sad.some(kw => cleanMessage.includes(kw))) {
    const options = [
      `I'm so sorry there's sadness and loneliness touching your heart today, ${userName}. It can feel so heavy and isolating, like being on a cold island. I am right here holding space with you. Your feelings are completely welcome here. Is there a tiny warm comfort, like a hot drink or a soft blanket, that you can wrap yourself in right now?`,
      `I feel the quiet heaviness of your heart, ${userName}, and I'm sitting right here with you in it. You don't have to put on a brave face or try to cheer up. Your sadness is honored and safe with me. Would you like to sit in quiet comfort, or share more of what is hurting?`,
      `It is completely okay to feel sad and shed tears, ${userName}. Grief and pain are deep reflections of our humanity. Let's take a slow breath together. Is there a simple, comforting activity we can focus on, or would you prefer some gentle breathing?`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Give me a warm comfort tip", "Try 1-Min Breathing Space", "I want to share more"]
    };
  }

  if (EMOTIONAL_KEYWORDS.anxious.some(kw => cleanMessage.includes(kw))) {
    const options = [
      `Anxiety is so noisy and feels so intensely real in the body, ${userName}. You are completely safe here. Let's try to gently anchor you back to the present. Feel the ground beneath you—stable and steady. Would you like to try a slow, grounding box-breathing exercise with me right now?`,
      `I can hear how fast your thoughts are racing, ${userName}. Anxiety is like a strong wind, but you are the steady tree. Let's bring your attention back to your body, your breath, and the physical room around you. Would a quick, soothing grounding tip help settle your heart?`,
      `Your breathing might feel shallow right now, ${userName}, but you are safe and secure. I am right here holding a calm, steady space for you. Let's take a slow, deep breath in together... and let it go. Would you like to try a guided breathing pace?`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Try 1-Min Breathing Space", "A grounding exercise", "Let's talk slowly"]
    };
  }

  if (EMOTIONAL_KEYWORDS.angry.some(kw => cleanMessage.includes(kw))) {
    const options = [
      `It is completely valid to feel angry, ${userName}. Anger is a powerful emotion, often protecting a very tender, hurt, or exhausted part of you. I want to give you full space to express it without any judgment. Would you like to vent about what is fueling this heat, or would a gentle physical reset feel better?`,
      `I hear the frustration and heat in your words, ${userName}, and I completely validate it. Anger is a healthy signal that your boundaries have been pushed or you are hurting. I'm listening. Please feel free to vent everything out—this is a completely safe space.`,
      `Anger can feel like an overwhelming fire inside, ${userName}. It's okay to feel this way. Let's make sure you have a safe outlet for this energy. Would you like to vent about it further, or try a tiny, physical release tip to help soothe the nervous system?`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Vent a bit more", "Suggest a physical release", "Breathing Space"]
    };
  }

  if (EMOTIONAL_KEYWORDS.numb.some(kw => cleanMessage.includes(kw))) {
    const options = [
      `Feeling numb or empty can be your mind's very natural way of protecting you when things have been too intense or exhausting for too long, ${userName}. You don't have to force yourself to feel anything right now. It is okay to just be. Would you like a simple, gentle sensory tip to softly reconnect, or would you like to just rest?`,
      `I hear you, ${userName}. Sometimes, when the nervous system gets overloaded, it goes quiet to protect us. It's okay to feel flat, hollow, or distant right now. You don't need to perform or force feelings. Let's just sit together in this quiet space.`,
      `When everything feels blank, ${userName}, know that there is no right or wrong way to be. Your mind is resting. We can just take things one slow breath at a time, with absolutely no expectations.`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Gentle sensory tip", "Just rest in silence", "Breathing Space"]
    };
  }

  // Greeting replies
  if (cleanMessage.includes("hello") || cleanMessage.includes("hi") || cleanMessage.includes("hey") || cleanMessage.includes("noor")) {
    const options = [
      `Hello, ${userName}. I'm Noor, your gentle companion. How is your energy holding up today? I'm here to listen, guide you through a soft breathing space, or help you build a small, restful step for your routine.`,
      `Hi, ${userName}. It's so good to connect with you. Take a slow breath, let your shoulders drop, and let me know how you're feeling right now. I'm right here with you.`,
      `Welcome back, ${userName}. I'm here, ready to hold a warm and gentle space for you today. How has your day been, or would you prefer to dive into a calming practice?`
    ];
    const text = options[Math.floor(Math.random() * options.length)];
    return {
      text,
      isCrisis: false,
      suggestions: ["Do a quick check-in", "Try 1-Min Breathing Space", "Suggest a tiny routine"]
    };
  }

  // Default gentle replies
  const options = [
    `Thank you for sharing that with me, ${userName}. You are carrying things one breath, one small moment at a time, and that is more than enough. Is there any way I can support you right now? We could try a breathing space, explore a calming routine, or just talk.`,
    `I'm listening closely, ${userName}. Your path and your feelings are completely valid, and you are doing the best you can in this moment. Would you like to explore a restful micro-tip, do a quick breathing pause, or just continue sharing?`,
    `I hear you deeply, ${userName}. It takes gentle courage to speak your truth and navigate each day. Remember to be kind to yourself. Let me know if you'd like a breathing space, a peaceful tip, or just a listening companion.`
  ];
  const text = options[Math.floor(Math.random() * options.length)];
  return {
    text,
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
