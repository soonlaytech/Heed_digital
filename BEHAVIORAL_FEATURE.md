# HEED Smart Behavioral Feature — Implementation Guide

## What Was Added & Why

HEED now learns from each conversation and check-in to understand how the user has
been doing. Instead of giving generic AI replies, the chatbot detects patterns like
poor sleep, stress, skipped meals, or low productivity, and then responds with empathy
and targeted suggestions.

No machine learning is needed — the system uses simple keyword matching and check-in
data analysis.

---

## Files Changed / Created

```
server/
  behaviorEngine.ts          ← NEW: Core pattern detection logic
  replit_integrations/
    chat/
      routes.ts              ← MODIFIED: Now injects behavioral context into AI prompt

client/src/pages/
  Chat.tsx                   ← MODIFIED: Shows detected patterns in the UI
```

---

## Step-by-Step: How It Works

### Step 1 — User sends a message

When a user types in the chat, the request hits `POST /api/conversations/:id/messages`.

### Step 2 — Fetch user history (new)

Before calling the AI, the server now fetches:
- All past chat messages (across all conversations)
- All check-ins for this user (mood, meals, activities)

```typescript
const [checkins, allConversations] = await Promise.all([
  storage.getCheckins(userId),
  chatStorage.getAllConversations(),
]);
```

### Step 3 — Run behavior analysis (new)

`analyzeUserBehavior()` scans the last 20 user messages + recent check-ins for signals:

| What it looks for | How it detects it |
|---|---|
| Poor sleep | Keywords: "didn't sleep", "tired", "insomnia", + check-in sleep data |
| Skipped meals | Keywords: "didn't eat", "skipped lunch", + check-in meals=false |
| Low productivity | Keywords: "can't focus", "procrastinating", + no-activity check-ins |
| Stress | Keywords: "stressed", "anxious", "overwhelmed", + bad mood check-ins |
| Isolation | Keywords: "lonely", "alone", "no one to talk to" |
| Positive mood | Keywords: "feeling good", "productive", "happy", + good check-ins |
| Good streak | 2+ consecutive good-mood check-ins |

Each detected condition has a confidence level (low / medium / high) based on
how many signals were found.

### Step 4 — Build smart system prompt (new)

`buildSmartSystemPrompt()` takes the detected patterns and builds a rich system
prompt that tells the AI:
- What the user has been struggling with
- How to respond (with examples)
- The "golden rules" for empathetic replies

Example system prompt excerpt when poor sleep is detected:
```
The user has been struggling with sleep.
Acknowledge their tiredness with empathy first. You might gently suggest:
- Winding down with a short relaxing routine before bed
- A short nap if it's daytime
Example: "You've been having a rough time sleeping lately — that can really make
everything feel harder. Have you been able to rest at all today?"
```

### Step 5 — Stream AI response with context

The AI reply is streamed back as before, but now the system prompt is personalized.
The profile summary is also sent to the frontend as a metadata SSE event.

### Step 6 — Frontend shows detected patterns

The Chat page displays small badges showing what HEED has noticed:
- A brief banner appears when patterns are first detected
- Below the input bar, the dominant condition is shown
- The empty state shows what HEED already knows from history

---

## Example Responses for Each Condition

### Poor Sleep
> "You've mentioned being tired a lot lately — that can make everything feel so much
> harder. Have you been able to get any rest today? Even a short break might help
> your body recharge a little."

### Skipped Meals
> "Hey, I noticed you've been forgetting to eat lately. Your energy and mood are
> really connected to food — is there something small and easy you could grab
> right now, like a banana or a handful of nuts?"

### Stress / Anxiety
> "It sounds like you're carrying a lot right now, and that's really tough.
> You don't have to solve everything today. Would it help to talk about what's
> feeling most overwhelming, or would you prefer some ideas to take the edge off?"

### Low Productivity
> "Feeling stuck happens to everyone — it really doesn't mean you're failing.
> What's the smallest possible step you could take on what's weighing on you?
> Even 5 minutes on something can break the paralysis."

### Social Isolation
> "Feeling disconnected can be really painful — I'm glad you shared that with me.
> Is there one person, even someone you haven't talked to in a while, you've been
> meaning to reach out to?"

### Good Streak / Positive Mood
> "It's so good to hear you're doing well! What's been making things click lately?
> It's worth noticing what's working so you can keep building on it."

---

## How to Add More Patterns

To detect a new pattern (e.g., "exercise habit"):

1. Open `server/behaviorEngine.ts`
2. Add your keywords to a new array:
```typescript
const EXERCISE_KEYWORDS = [
  "didn't exercise", "skipped gym", "too lazy to work out", "no movement today"
];
```
3. Add detection logic inside `analyzeUserBehavior()`:
```typescript
const exerciseMatches = countMatches(recentUserMessages, EXERCISE_KEYWORDS);
const exercisePattern: DetectedPattern = {
  condition: "skipped_exercise",
  confidence: confidenceLevel(exerciseMatches.count),
  evidence: exerciseMatches.matches.map(m => `Said: "${m}"`),
  count: exerciseMatches.count,
};
```
4. Add its guidance in `getConditionGuidance()`:
```typescript
case "skipped_exercise":
  return `The user has been skipping exercise. Encourage them gently...`;
```
5. Add the `PatternCondition` type and a badge config in `Chat.tsx`.

---

## Database — No Changes Needed

The feature uses the existing `checkins` and `messages` tables. No migration needed.

---

## Environment Variables — No Changes

Uses the same `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
as before.

---

## Testing the Feature

To see the behavioral responses immediately:

1. Go to Check-In and submit a check-in with mood = "bad" and meals = false
2. Open Chat and type: "I didn't sleep well and I'm really tired today"
3. HEED will respond with empathy about sleep and fatigue instead of a generic reply
4. Type a few more messages with "stressed" or "can't focus"
5. After 2-3 such messages, you'll see the pattern badges appear in the UI

---

## Architecture Diagram

```
User types message
        │
        ▼
POST /api/conversations/:id/messages
        │
        ├──► Fetch check-in history (DB)
        │
        ├──► Fetch all chat messages (DB)
        │
        ├──► analyzeUserBehavior()
        │         │
        │         ├── Keyword scan on chat messages
        │         ├── Pattern match on check-in data
        │         └── Returns: BehaviorProfile
        │
        ├──► buildSmartSystemPrompt(profile)
        │         └── Returns: empathy-driven system prompt
        │
        ├──► OpenAI API (with smart system prompt)
        │
        └──► Stream response back to client
                  │
                  ├── data: { type: "profile", profile: {...} }  ← metadata
                  ├── data: { content: "..." }                   ← streamed text
                  └── data: { done: true }
```
