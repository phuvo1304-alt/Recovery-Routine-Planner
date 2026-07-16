/**
 * Types for Recovery Routine Planner
 */

export interface UserProfile {
  name: string;
  energyLevel: 'low' | 'fluctuating' | 'okay' | '';
  mainDrain: 'work' | 'overthinking' | 'sleep' | 'change' | '';
  onboardingComplete: boolean;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: '😫 Struggling' | '😔 Low' | '😐 Okay' | '🙂 Good' | '😌 Calm';
  energy: number; // 1-5
  sleepQuality: number; // 1-5
  stressLevel: number; // 1-5
  note: string;
}

export interface RecoveryStep {
  id: string;
  text: string;
  completed: boolean;
  category: 'sleep' | 'energy' | 'stress' | 'general';
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: string[];
  isCustom: boolean;
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  date: string; // Formatting like "July 14, 2026"
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'noor' | 'system';
  text: string;
  timestamp: number;
  suggestions?: string[];
}
