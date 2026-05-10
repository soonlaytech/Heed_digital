/**
 * HEED Behavior Pattern Detection Engine
 * ----------------------------------------
 * Analyzes user chat history + check-in data to detect patterns like:
 *  - poor sleep, fatigue, low energy
 *  - skipped meals / poor eating habits
 *  - low productivity / lack of motivation
 *  - stress / anxiety signals
 *  - social isolation
 *  - positive streaks (to reinforce)
 *
 * All logic is rule-based — no ML needed.
 * Each detected pattern returns a "condition" string that drives
 * how the AI system prompt is enriched with empathy & suggestions.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PatternCondition =
  | "poor_sleep"
  | "fatigue"
  | "skipped_meals"
  | "low_productivity"
  | "stress"
  | "social_isolation"
  | "positive_mood"
  | "good_streak"
  | "none";

export interface DetectedPattern {
  condition: PatternCondition;
  confidence: "low" | "medium" | "high";
  evidence: string[]; // human-readable reasons
  count: number;      // how many signals found
}

export interface BehaviorProfile {
  userId: string;
  patterns: DetectedPattern[];
  dominantCondition: PatternCondition;
  recentMoods: string[];
  missedMealsCount: number;
  poorSleepCount: number;
  streakDays: number;
  lastAnalyzed: Date;
}

// ─── Keyword Dictionaries ─────────────────────────────────────────────────────

const SLEEP_KEYWORDS = [
  "didn't sleep", "can't sleep", "no sleep", "insomnia", "tired",
  "exhausted", "up all night", "poor sleep", "bad sleep", "barely slept",
  "3am", "4am", "2am", "awake all night", "restless", "fatigue", "fatigued",
  "couldn't sleep", "sleep deprived", "not sleeping well", "haven't slept"
];

const MEAL_KEYWORDS = [
  "didn't eat", "skipped lunch", "skipped breakfast", "skipped dinner",
  "forgot to eat", "no appetite", "haven't eaten", "not hungry",
  "skipped meal", "missed meal", "don't feel like eating", "not eating",
  "starving", "haven't had food"
];

const PRODUCTIVITY_KEYWORDS = [
  "can't focus", "unproductive", "procrastinating", "distracted",
  "no motivation", "don't want to work", "behind on work", "stuck",
  "can't concentrate", "lost focus", "demotivated", "no energy to work",
  "overwhelmed", "too much to do", "nothing done", "wasted day"
];

const STRESS_KEYWORDS = [
  "stressed", "anxious", "anxiety", "worried", "nervous", "panic",
  "overwhelmed", "can't cope", "too much", "breaking down", "pressure",
  "freaking out", "burned out", "burnout", "on edge", "tense", "dread"
];

const ISOLATION_KEYWORDS = [
  "lonely", "alone", "no one to talk to", "isolated", "no friends",
  "haven't talked", "nobody cares", "feel invisible", "disconnected",
  "left out", "excluded", "miss people", "haven't seen anyone"
];

const POSITIVE_KEYWORDS = [
  "feeling good", "great day", "productive", "happy", "excited",
  "accomplished", "slept well", "ate well", "energized", "motivated",
  "positive", "doing well", "feeling better", "had a good", "proud",
  "successful", "grateful", "thankful"
];

// ─── Keyword Matcher ──────────────────────────────────────────────────────────

function countMatches(text: string, keywords: string[]): { count: number; matches: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw)) found.push(kw);
  }
  return { count: found.length, matches: found };
}

function confidenceLevel(count: number): "low" | "medium" | "high" {
  if (count >= 3) return "high";
  if (count >= 2) return "medium";
  return "low";
}

// ─── Core Analyzer ────────────────────────────────────────────────────────────

export interface AnalysisInput {
  chatMessages: Array<{ role: string; content: string; createdAt?: Date }>;
  checkins: Array<{
    mood?: string | null;
    activities?: Record<string, unknown> | unknown;
    skipped?: boolean | null;
    date?: string | null;
  }>;
  userId: string;
}

export function analyzeUserBehavior(input: AnalysisInput): BehaviorProfile {
  const { chatMessages, checkins, userId } = input;

  // Only analyze last 20 user messages for recency
  const recentUserMessages = chatMessages
    .filter(m => m.role === "user")
    .slice(-20)
    .map(m => m.content)
    .join(" ");

  // Analyze recent check-ins (last 7)
  const recentCheckins = checkins.slice(0, 7);

  // ── Sleep & Fatigue Detection ──────────────────────────────────────────────
  const sleepMatches = countMatches(recentUserMessages, SLEEP_KEYWORDS);
  const poorSleepCheckins = recentCheckins.filter(c => {
    const acts = c.activities as Record<string, unknown> | null;
    return acts?.sleep === false || acts?.sleep === "poor";
  }).length;
  const totalSleepSignals = sleepMatches.count + poorSleepCheckins;

  const sleepPattern: DetectedPattern = {
    condition: "poor_sleep",
    confidence: confidenceLevel(totalSleepSignals),
    evidence: [
      ...sleepMatches.matches.slice(0, 3).map(m => `Said: "${m}"`),
      poorSleepCheckins > 0 ? `${poorSleepCheckins} check-in(s) noted poor sleep` : "",
    ].filter(Boolean),
    count: totalSleepSignals,
  };

  const fatigueMatches = countMatches(recentUserMessages, ["tired", "exhausted", "no energy", "drained", "worn out"]);
  const fatiguePattern: DetectedPattern = {
    condition: "fatigue",
    confidence: confidenceLevel(fatigueMatches.count + poorSleepCheckins),
    evidence: fatigueMatches.matches.map(m => `Said: "${m}"`),
    count: fatigueMatches.count + poorSleepCheckins,
  };

  // ── Meal Detection ─────────────────────────────────────────────────────────
  const mealMatches = countMatches(recentUserMessages, MEAL_KEYWORDS);
  const skippedMealCheckins = recentCheckins.filter(c => {
    const acts = c.activities as Record<string, unknown> | null;
    return acts?.meals === false || c.skipped === true;
  }).length;
  const totalMealSignals = mealMatches.count + skippedMealCheckins;

  const mealPattern: DetectedPattern = {
    condition: "skipped_meals",
    confidence: confidenceLevel(totalMealSignals),
    evidence: [
      ...mealMatches.matches.slice(0, 2).map(m => `Said: "${m}"`),
      skippedMealCheckins > 0 ? `${skippedMealCheckins} check-in(s) with skipped meals` : "",
    ].filter(Boolean),
    count: totalMealSignals,
  };

  // ── Productivity Detection ─────────────────────────────────────────────────
  const prodMatches = countMatches(recentUserMessages, PRODUCTIVITY_KEYWORDS);
  const lowActivityCheckins = recentCheckins.filter(c => {
    const acts = c.activities as Record<string, unknown> | null;
    return acts?.activity === false;
  }).length;
  const totalProdSignals = prodMatches.count + lowActivityCheckins;

  const prodPattern: DetectedPattern = {
    condition: "low_productivity",
    confidence: confidenceLevel(totalProdSignals),
    evidence: [
      ...prodMatches.matches.slice(0, 2).map(m => `Said: "${m}"`),
      lowActivityCheckins > 0 ? `${lowActivityCheckins} inactive check-in(s)` : "",
    ].filter(Boolean),
    count: totalProdSignals,
  };

  // ── Stress Detection ───────────────────────────────────────────────────────
  const stressMatches = countMatches(recentUserMessages, STRESS_KEYWORDS);
  const badMoodCheckins = recentCheckins.filter(c => c.mood === "bad").length;
  const totalStressSignals = stressMatches.count + badMoodCheckins;

  const stressPattern: DetectedPattern = {
    condition: "stress",
    confidence: confidenceLevel(totalStressSignals),
    evidence: [
      ...stressMatches.matches.slice(0, 2).map(m => `Said: "${m}"`),
      badMoodCheckins > 0 ? `${badMoodCheckins} bad-mood check-in(s)` : "",
    ].filter(Boolean),
    count: totalStressSignals,
  };

  // ── Social Isolation Detection ─────────────────────────────────────────────
  const isoMatches = countMatches(recentUserMessages, ISOLATION_KEYWORDS);
  const isolationPattern: DetectedPattern = {
    condition: "social_isolation",
    confidence: confidenceLevel(isoMatches.count),
    evidence: isoMatches.matches.slice(0, 2).map(m => `Said: "${m}"`),
    count: isoMatches.count,
  };

  // ── Positive Mood Detection ────────────────────────────────────────────────
  const posMatches = countMatches(recentUserMessages, POSITIVE_KEYWORDS);
  const goodMoodCheckins = recentCheckins.filter(c => c.mood === "good").length;
  const posPattern: DetectedPattern = {
    condition: "positive_mood",
    confidence: confidenceLevel(posMatches.count + goodMoodCheckins),
    evidence: [
      ...posMatches.matches.slice(0, 2).map(m => `Said: "${m}"`),
      goodMoodCheckins > 0 ? `${goodMoodCheckins} positive check-in(s)` : "",
    ].filter(Boolean),
    count: posMatches.count + goodMoodCheckins,
  };

  // ── Good Streak Detection ─────────────────────────────────────────────────
  const streakDays = calculateStreak(recentCheckins);
  const streakPattern: DetectedPattern = {
    condition: "good_streak",
    confidence: streakDays >= 3 ? "high" : streakDays >= 2 ? "medium" : "low",
    evidence: streakDays > 0 ? [`${streakDays} consecutive good check-in day(s)`] : [],
    count: streakDays,
  };

  // ── Gather All Significant Patterns ───────────────────────────────────────
  const allPatterns: DetectedPattern[] = [
    sleepPattern, fatiguePattern, mealPattern, prodPattern,
    stressPattern, isolationPattern, posPattern, streakPattern,
  ].filter(p => p.count > 0);

  // ── Dominant Condition (highest count among negatives) ────────────────────
  const negativePatterns = allPatterns.filter(
    p => p.condition !== "positive_mood" && p.condition !== "good_streak"
  );
  const dominantNegative = negativePatterns.sort((a, b) => b.count - a.count)[0];
  const dominantCondition: PatternCondition =
    dominantNegative && dominantNegative.count > 0
      ? dominantNegative.condition
      : posPattern.count > 0
      ? "positive_mood"
      : "none";

  // ── Recent Moods Summary ───────────────────────────────────────────────────
  const recentMoods = recentCheckins
    .map(c => c.mood)
    .filter(Boolean) as string[];

  return {
    userId,
    patterns: allPatterns,
    dominantCondition,
    recentMoods,
    missedMealsCount: totalMealSignals,
    poorSleepCount: totalSleepSignals,
    streakDays,
    lastAnalyzed: new Date(),
  };
}

// ─── Streak Calculator ────────────────────────────────────────────────────────

function calculateStreak(checkins: Array<{ mood?: string | null; date?: string | null }>): number {
  const goodCheckins = checkins.filter(c => c.mood === "good");
  // Simple: count consecutive good moods from most recent
  let streak = 0;
  for (const c of goodCheckins) {
    if (c.mood === "good") streak++;
    else break;
  }
  return streak;
}

// ─── System Prompt Builder ────────────────────────────────────────────────────
/**
 * Takes the behavior profile and builds a rich system prompt for the AI
 * that makes it respond with empathy and targeted suggestions.
 */
export function buildSmartSystemPrompt(profile: BehaviorProfile): string {
  const base = `You are HEED, a warm, empathetic, and caring daily companion app.
You genuinely care about the user's wellbeing. You are NOT a generic chatbot — you pay
close attention to how the user has been feeling recently and respond accordingly.
Always be kind, non-judgmental, and supportive. Keep responses concise (2-4 sentences
unless the user needs more). Never give clinical or preachy advice.`;

  if (profile.patterns.length === 0) {
    return `${base}\n\nNo strong behavioral patterns detected yet. Respond warmly and
check in gently about how they are feeling today.`;
  }

  const patternSummary = profile.patterns
    .filter(p => p.confidence !== "low")
    .map(p => `- ${p.condition.replace(/_/g, " ")} (${p.confidence} confidence): ${p.evidence.join(", ")}`)
    .join("\n");

  const conditionGuidance = getConditionGuidance(profile.dominantCondition, profile);

  const moodSummary = profile.recentMoods.length > 0
    ? `Recent moods from check-ins: ${profile.recentMoods.slice(0, 5).join(", ")}.`
    : "";

  const streakNote = profile.streakDays >= 2
    ? `The user has been on a good streak for ${profile.streakDays} days — acknowledge this warmly if appropriate.`
    : "";

  return `${base}

## What you know about this user right now:
${patternSummary || "No strong patterns yet."}
${moodSummary}
${streakNote}

## How to respond based on what you know:
${conditionGuidance}

## Golden Rules:
- Reference their patterns naturally, not robotically. E.g., don't say "I detected poor sleep" — instead say "You've mentioned being tired lately..."
- If the user seems to be struggling, gently acknowledge it before giving any advice.
- Celebrate small wins warmly.
- Never overwhelm the user with too many suggestions at once — one thoughtful nudge is enough.
- If mood is poor but improving, recognize the progress.`;
}

// ─── Per-Condition Response Guidance ─────────────────────────────────────────

function getConditionGuidance(condition: PatternCondition, profile: BehaviorProfile): string {
  switch (condition) {
    case "poor_sleep":
      return `The user has been struggling with sleep. ${profile.poorSleepCount > 3 ? "This has been going on for a while." : ""}
Acknowledge their tiredness with empathy first. You might gently suggest:
- Winding down with a short relaxing routine before bed (no screens 30 min before)
- A short nap if it's daytime and they can manage
- Staying hydrated — dehydration worsens fatigue
- That poor sleep is temporary and they're doing their best
Example: "You've been having a rough time sleeping lately — that can really make everything feel harder. Have you been able to rest at all today?"`;

    case "fatigue":
      return `The user feels exhausted or drained. Respond with care and gentleness.
Suggestions to offer (pick ONE naturally):
- Remind them it's okay to rest — rest is productive
- Suggest a short walk or stretching to boost energy gently
- Hydration and a light snack if they haven't eaten
- That pushing through exhaustion rarely helps
Example: "It sounds like your body is asking for a break today. Even 10 minutes of rest can make a real difference — have you had a chance to pause?"`;

    case "skipped_meals":
      return `The user has been skipping meals or forgetting to eat. ${profile.missedMealsCount > 3 ? "This seems to be a recurring pattern." : ""}
Be caring and non-judgmental. Gently encourage:
- Eating something small even if not hungry (banana, crackers, yogurt)
- That their energy and mood are directly tied to nutrition
- Remind them to take care of themselves as they'd care for a friend
Example: "Hey, I noticed you've been forgetting to eat lately. Even a small snack can help your brain and mood — is there something easy you could grab right now?"`;

    case "low_productivity":
      return `The user is feeling unproductive or unmotivated. Respond with understanding, not pressure.
Helpful nudges (choose what fits naturally):
- Break big tasks into tiny ones — even 5 minutes counts
- The "2-minute rule": if something takes under 2 minutes, do it now
- Acknowledge that some days are just harder — and that's okay
- Suggest a short break before returning to work (Pomodoro)
Example: "Feeling stuck happens to everyone — it doesn't mean you're failing. What's the smallest possible step you could take on what's weighing on you?"`;

    case "stress":
      return `The user appears stressed or anxious. Lead with empathy before anything else.
Gentle responses:
- Validate their feelings — stress is real and hard
- Suggest the 4-7-8 breathing technique if relevant
- Ask if they want to talk about what's bothering them
- Remind them they don't have to solve everything today
Example: "It sounds like you're carrying a lot right now. That's really tough. Do you want to talk about what's feeling most overwhelming, or would you like some ideas to take the edge off?"`;

    case "social_isolation":
      return `The user may be feeling lonely or disconnected. Respond with warmth and genuine connection.
Be careful not to be dismissive. Suggestions:
- Let them know HEED is here to listen (without being creepy)
- Gently encourage reaching out to one person they trust
- Suggest low-pressure social activities (a text, a walk with someone)
- Validate that loneliness is painful and real
Example: "Feeling disconnected can be really hard — I'm glad you shared that with me. Is there someone, even just one person, you've been meaning to catch up with?"`;

    case "positive_mood":
      return `The user seems to be in a good headspace. Celebrate this with genuine warmth.
- Acknowledge their positive energy
- Reinforce what seems to be working for them
- Encourage them to keep up their good habits
- Ask them what's been going well
Example: "It's so good to hear you're doing well today! What's been making things feel better lately? It's worth noticing what works."`;

    case "good_streak":
      return `The user has been on a positive streak. Celebrate meaningfully but authentically.
- Acknowledge the streak warmly
- Connect it to their effort and choices
- Gently encourage them to keep it going without pressure
Example: "Look at you — you've been doing really well lately! It's clear you've been putting in effort for yourself. That really matters."`;

    default:
      return `No strong pattern detected. Respond with warmth and curiosity. Gently ask how they're feeling and what's on their mind today.`;
  }
}

// ─── Pattern Summary for API Response ────────────────────────────────────────
/** Lightweight version sent to the frontend so it can show context badges */
export function summarizeProfile(profile: BehaviorProfile) {
  return {
    dominantCondition: profile.dominantCondition,
    activePatterns: profile.patterns
      .filter(p => p.confidence !== "low")
      .map(p => ({ condition: p.condition, confidence: p.confidence })),
    streakDays: profile.streakDays,
    lastAnalyzed: profile.lastAnalyzed,
  };
}
