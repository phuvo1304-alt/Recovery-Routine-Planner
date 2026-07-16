import { CheckIn, JournalEntry, Routine } from './types';

export const JOURNAL_PROMPTS = [
  "What felt heavy today, and how can you hold it more gently?",
  "What small thing brought you a moment of ease or a tiny smile today?",
  "What are you letting go of tonight to give yourself room to rest?",
  "Name one thing that made you feel safe, comfortable, or warm today.",
  "What is a gentle promise you want to make to yourself for tomorrow?",
  "If your mind was a weather pattern today, what was it, and how can you shelter yourself?"
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'template-overwhelm',
    name: 'Overwhelm Relief Routine',
    description: 'A gentle, low-demand routine designed to quiet a racing mind and ease the body.',
    steps: [
      'Sit quietly for 2 minutes with eyes closed and no expectations.',
      'Drink a slow, full glass of water, noticing the cool sensation.',
      'Name 3 things in your immediate surroundings that feel stable.'
    ],
    isCustom: false,
    isActive: true
  },
  {
    id: 'template-exam',
    name: 'Exam Season Recovery Routine',
    description: 'Focus on pacing, gentle hydration, and giving your brain tiny moments to recharge.',
    steps: [
      'Step away from all screens and look out a window for 2 minutes.',
      'Stand up and do a slow, gentle shoulder roll to release tension.',
      'Write down one thing you completed, no matter how tiny.'
    ],
    isCustom: false,
    isActive: false
  }
];

export const SEED_CHECK_INS: CheckIn[] = [
  {
    id: 'seed-checkin-1',
    date: '2026-07-11',
    timestamp: new Date('2026-07-11T19:30:00').getTime(),
    mood: '😫 Struggling',
    energy: 1,
    sleepQuality: 2,
    stressLevel: 5,
    note: 'Work was extremely hectic. Felt like I could not catch my breath. Exhausted to my bones.'
  },
  {
    id: 'seed-checkin-2',
    date: '2026-07-12',
    timestamp: new Date('2026-07-12T20:15:00').getTime(),
    mood: '😔 Low',
    energy: 2,
    sleepQuality: 3,
    stressLevel: 4,
    note: 'Slept a bit better, but still feeling a strong mental fog. Tried to stay hydrated.'
  },
  {
    id: 'seed-checkin-3',
    date: '2026-07-13',
    timestamp: new Date('2026-07-13T21:00:00').getTime(),
    mood: '😐 Okay',
    energy: 3,
    sleepQuality: 4,
    stressLevel: 3,
    note: 'Felt a tiny bit of ease today. Took a short walk in the afternoon and sat under a tree.'
  }
];

export const SEED_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'seed-journal-1',
    prompt: 'What felt heavy today, and how can you hold it more gently?',
    content: 'Today the pressure to perform and answer everyone instantly felt incredibly heavy. I am learning that I can set boundaries and respond when my battery isn’t in the red. I let myself take a 10-minute quiet break without my phone.',
    date: 'Jul 12, 2026',
    timestamp: new Date('2026-07-12T21:10:00').getTime()
  },
  {
    id: 'seed-journal-2',
    prompt: 'What small thing brought you a moment of ease or a tiny smile today?',
    content: 'I sat outside on the grass for five minutes and watched a small sparrow search for seeds. It felt so uncomplicated and quiet. It reminded me that the world keeps turning even when I pause to rest.',
    date: 'Jul 13, 2026',
    timestamp: new Date('2026-07-13T21:30:00').getTime()
  }
];
