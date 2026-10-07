# Recovery Routine Planner 🌱

A gentle, mobile-first web app for people recovering from burnout, stress, or emotional overload — built around the idea that recovery doesn't need to be another checklist you fail at. It pairs daily check-ins and bite-sized recovery routines with **Noor**, a warm AI companion that responds to how you're actually feeling instead of generic advice.

> Built as a personal project to practice full-stack app development — React/TypeScript on the frontend, Firebase for auth, and a serverless function proxying the Gemini API for the companion chat.

## Why I built this

Burnout recovery apps tend to feel like more homework: habit trackers, streaks, guilt if you miss a day. I wanted the opposite — something that meets you where your energy actually is that day, celebrates showing up at 10%, and never punishes you for resting. "Noor" (the chat companion) is designed to validate first and suggest second, and a crisis-keyword safety check routes anyone in real distress to real support resources instead of a chatbot reply.

## Features

- **Morning Intention Setting** — pick how your energy feels (low / steady / restless) and get a tailored daily approach, not a generic motivational quote
- **Daily Check-In** — mood, energy, sleep quality, and stress logged in a few taps, which generates 3 personalized micro-recovery steps for the day
- **Recovery Routines** — pre-built and fully custom step-by-step routines you can activate, edit, or build from scratch
- **Reflection Journal** — rotating gentle prompts, saved entries you can revisit
- **Noor, the AI companion** — a Gemini-powered chat that validates how you're feeling and suggests small, concrete next steps (with a local rule-based fallback if the API is unavailable, so the app still feels supportive offline)
- **Built-in safety net** — messages containing crisis language (self-harm, suicidal ideation) immediately surface real crisis resources instead of an AI reply
- **1-Minute Breathing Space** — a guided breathing exercise for in-the-moment grounding
- **Accounts via Firebase Auth** — email/password with in-app email verification, or a guest/anonymous mode that keeps data session-only

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion (`motion`), Lucide icons |
| Auth | Firebase Authentication |
| AI companion | Google Gemini API (`@google/genai`), called from a serverless function — never exposed to the client |
| Hosting | Netlify (serverless function + static build), with an Express dev server for local parity |
| Storage | LocalStorage / SessionStorage per-user (no backend database yet — see Roadmap) |

## How it's put together

```
src/
  App.tsx                 # Top-level state, routing between tabs, all data mutators
  components/              # Screens: onboarding, auth, check-in, chat, breathing space...
  chatBotLogic.ts          # Local rule-based fallback for Noor if the Gemini call fails
  firebase.ts              # Firebase app/auth init
  seedData.ts               # Default routines, journal prompts, seed content
netlify/functions/chat.ts  # Serverless endpoint: builds Noor's system prompt, calls Gemini,
                            # falls back through multiple models, then to the local logic
server.ts                  # Local Express server mirroring the Netlify function for `npm run dev`
```

The chat flow is the part I spent the most time on: the frontend never talks to Gemini directly — it POSTs to `/api/chat`, which runs server-side (so the API key stays off the client), tries a short list of Gemini models in order, enforces a strict JSON response schema, and falls back to a local response generator if every model call fails. That was a deliberate choice so the companion never just breaks if the AI backend has an outage.

## Running locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set your own `GEMINI_API_KEY` (get one from [Google AI Studio](https://aistudio.google.com/apikey))
3. Run the app:
   ```
   npm run dev
   ```

This runs a local Express server (`server.ts`) that serves the Vite app and proxies `/api/chat` the same way the Netlify function does in production.

## Roadmap / known limitations

- Data is currently stored in LocalStorage/SessionStorage per user rather than a real database — migrating check-ins, journals, and routines to Firestore is next
- No automated tests yet
- Guest mode data is intentionally wiped on logout (session-only) — that's by design, not a bug

## A note on AI use
I used Google AI Studio to generate the first scaffold of this project — initial component structure and a first pass at styling — then took it from there myself: structuring the data model (types.ts), building out the check-in and recovery-step logic, wiring up Firebase auth and the verification flow, and designing how the Noor companion chat should behave, including the safety fallback system in netlify/functions/chat.ts. I used Gemini throughout as a coding assistant for code review and catching bugs, the way a developer might use a linter or pair-programming tool — not to generate the product decisions themselves.

I used Google AI Studio to scaffold the initial version of this project (component structure and first-pass styling) and used Gemini as a coding assistant throughout for code review and workflow efficiency. The product idea, feature design, data model, and the ongoing changes/bug fixes are my own work.
