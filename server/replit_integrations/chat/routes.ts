/**
 * Enhanced Chat Routes — with Smart Behavioral Pattern Detection
 */

import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { storage } from "../../storage";
import { analyzeUserBehavior, buildSmartSystemPrompt, summarizeProfile } from "../../behaviorEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. Chat will fall back to demo responses only if OpenAI cannot be reached.");
}

const DEFAULT_USER_ID = "local-user";

function getUserId(req: Request) {
  const authUserId = (req.user as any)?.claims?.sub;
  const headerUserId = req.header("x-heed-user-id");
  return authUserId || headerUserId || DEFAULT_USER_ID;
}

type Intent = {
  name: string;
  patterns: RegExp[];
  responses: string[];
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const INTENTS: Intent[] = [
  {
    name: "crisis",
    patterns: [
      /\bsuic[iy]d/i,
      /kill\s+myself/i,
      /end\s+(it|my\s+life|everything)/i,
      /\bhurt\s+myself/i,
      /\bself.?harm/i,
      /don'?t\s+want\s+to\s+(live|be\s+here|exist)/i,
      /no\s+reason\s+to\s+live/i,
      /want\s+to\s+die/i,
    ],
    responses: [
      "I'm really glad you reached out, and I want you to know your life matters. What you're feeling is heavy — please don't carry it alone tonight.\n\nIf you're in India, you can call iCall at 9152987821 (Mon–Sat, 8am–10pm) or AASRA at +91-9820466726 (24x7).\nOutside India, https://befrienders.org has helplines worldwide.\n\nIs there someone close to you you could be with right now? I'm here too — tell me what's happening.",
    ],
  },

  {
    name: "plan_help",
    patterns: [
      /(make|build|create|give|plan|prepare)\s+(me\s+)?(a\s+)?plan/i,
      /plan\s+my\s+(day|week|life|time|tomorrow)/i,
      /organi[sz]e\s+(my|the)/i,
      /schedule\s+(my|the)/i,
      /\btime\s+manage/i,
      /\bto.?do\s+list/i,
      /help\s+me\s+plan/i,
    ],
    responses: [
      "Let's build a plan together. Tell me three things:\n\n1. What do you need to get done today?\n2. What's been weighing on you?\n3. One thing that would make today feel like a win.\n\nShare them and I'll help you sort them into 'must today', 'can wait', and 'not yours to carry'.",
      "Of course — I'd love to help plan. To keep it realistic, tell me:\n\n• How many hours do you actually have today?\n• What are the 2–3 things that matter most?\n• Anything you're dreading?\n\nWe'll keep it gentle and doable.",
      "A good plan starts with a clear head. Before we list tasks, take one slow breath. Now share with me what's on your plate — and I'll help you order it.",
    ],
  },

  {
    name: "dizzy_physical",
    patterns: [
      /\bdizz/i,
      /\bheadache/i,
      /chest\s+(hurt|tight|pain)/i,
      /can'?t\s+breathe/i,
      /\bshaky\b/i,
      /\bnause/i,
      /feeling\s+(weak|sick|ill)/i,
      /\bmigraine/i,
    ],
    responses: [
      "I'm sorry you're feeling that way. Please sit somewhere safe, sip water slowly, and breathe gently — in for 4, out for 6.\n\nIf the symptoms feel sharp, sudden, or come with chest pain, please reach a doctor or emergency service. Your body matters.\n\nWhen you feel a little steadier, tell me what's been happening today — sometimes the body speaks for the mind.",
      "Take it slow. Sit down, drink some water, rest your eyes. Physical symptoms often follow emotional stress.\n\nIf it feels severe or scary, please call a doctor — don't wait. Otherwise, share what's been going on, and let's talk through it together.",
    ],
  },

  {
    name: "anxious",
    patterns: [
      /\banxi/i,
      /\bnervous/i,
      /\bpanic/i,
      /\bworri/i,
      /\bscared\b/i,
      /\bafraid\b/i,
      /on\s+edge/i,
      /racing\s+(thoughts|heart|mind)/i,
      /can'?t\s+calm/i,
    ],
    responses: [
      "Anxiety can feel like everything at once. Let's slow it down together — try this with me:\n\n• Breathe in for 4 seconds\n• Hold for 4\n• Breathe out for 6\n• Repeat 3 times\n\nAfter that, tell me — what's the loudest worry in your head right now?",
      "I hear you. When worry takes over, the body reacts before the mind catches up. Notice three things you can see around you, two you can hear, one you can touch. That's called grounding.\n\nThen tell me — what triggered this?",
      "It's okay to feel anxious. You're not broken for feeling this way. Can you describe what's happening in your body — tight chest, restless hands, racing thoughts? Let's name it first.",
    ],
  },

  {
    name: "stressed_overwhelmed",
    patterns: [
      /\bstress/i,
      /\boverwhelm/i,
      /burn[ -]?(t|ed)?\s*out/i,
      /too\s+much/i,
      /\bhectic\b/i,
      /can'?t\s+(handle|cope|deal|do\s+this)/i,
      /under\s+pressure/i,
      /\bdrowning\b/i,
      /falling\s+behind/i,
    ],
    responses: [
      "Feeling hectic is a signal, not a weakness. Your brain can't tell what's urgent from what's just loud right now.\n\nLet's try this — name 3 things on your plate. We'll sort them into:\n• Must today\n• Can wait\n• Not yours to carry\n\nWhat are the 3?",
      "When everything piles up, the smallest task feels impossible. Take a slow breath with me.\n\nNow — what's ONE thing you can let go of, even just for the next hour? Sometimes permission to pause is the real fix.",
      "It sounds like a lot is coming at you. Can you tell me what the next 24 hours look like? I'll help you break it into smaller, gentler steps.",
    ],
  },

  {
    name: "sad",
    patterns: [
      /\bsad\b/i,
      /\bdepres/i,
      /feeling\s+(low|down|blue|empty|numb)/i,
      /\bmiserable/i,
      /heart\s*broken/i,
      /\bcry(ing)?\b/i,
      /not\s+(okay|ok|fine)/i,
      /feeling\s+bad/i,
      /feels?\s+awful/i,
    ],
    responses: [
      "I'm really sorry you're feeling this way. You don't have to explain everything at once.\n\nWhat's the heaviest part right now? Even one sentence is enough — I'm listening.",
      "That sounds painful. Sometimes naming what triggered the sadness helps a little. Would you like to tell me what happened?",
      "I'm here with you. Even just sitting with the feeling is okay — you don't have to fix it this second.\n\nWould it help to talk about what's going on, or would you rather try a small grounding exercise first?",
    ],
  },

  {
    name: "lonely",
    patterns: [
      /\blonely\b/i,
      /feel\s+alone/i,
      /\bisolat/i,
      /no\s+one\s+(cares|understands|listens|gets\s+me)/i,
      /\bnobody\s+(cares|understands|likes)/i,
      /\bby\s+myself\b/i,
    ],
    responses: [
      "Loneliness is one of the hardest feelings — even when people are around. I'm here, and I'm listening.\n\nWhat's making it feel sharpest right now?",
      "I'm glad you reached out. You're not as alone as the feeling makes it seem.\n\nWould you like to talk about who you wish you could connect with, or what kind of company you're missing most?",
    ],
  },

  {
    name: "tired_exhausted",
    patterns: [
      /\btired\b/i,
      /\bexhaust/i,
      /\bdrain/i,
      /\bsleepy\b/i,
      /\bfatigue/i,
      /no\s+energy/i,
      /\bworn\s+out/i,
      /can'?t\s+sleep/i,
      /\binsomn/i,
    ],
    responses: [
      "Being tired isn't just physical — emotional weight makes the body heavy too.\n\nWhen was the last time you rested without guilt? Even 10 minutes counts. What would feel like the smallest possible rest right now?",
      "I hear you. Sometimes 'tired' is the only word the body has for 'too much, too long'.\n\nWould you like help finding a tiny reset — water, fresh air, a short break — or do you want to talk about what's draining you?",
      "Exhaustion deserves to be taken seriously. Tell me — is it your body that's tired, your mind, or both? We can talk through either.",
    ],
  },

  {
    name: "angry",
    patterns: [
      /\bangry\b/i,
      /\bmad\b/i,
      /\bfurious\b/i,
      /\birritat/i,
      /\bfrustrat/i,
      /piss(ed)?\s+off/i,
      /\brage\b/i,
      /\bhate\s+(my|this|everyone|him|her|them)/i,
    ],
    responses: [
      "Anger is information — it usually points to a boundary that got crossed or a need that wasn't met.\n\nWhat happened? I'm listening, no judgment.",
      "It's okay to feel angry. Let's not push it away. Can you tell me what set this off?",
      "Frustration this strong is real. Take one slow breath. Now — what's the part that hurts most underneath the anger?",
    ],
  },

  {
    name: "happy_positive",
    patterns: [
      /\bhappy\b/i,
      /feeling\s+(good|great|better|amazing|wonderful)/i,
      /\bexcit/i,
      /\bbest\s+day/i,
      /going\s+well/i,
      /\bgrateful/i,
      /\bblessed\b/i,
    ],
    responses: [
      "That's so lovely to hear. What's making today feel good?",
      "I love that for you. Tell me — what's been the best part?",
      "Beautiful. Holding onto these small joys matters more than people think. What would help you remember this feeling later?",
    ],
  },

  {
    name: "who_are_you",
    patterns: [
      /who\s+are\s+you/i,
      /what\s+are\s+you/i,
      /what'?s\s+heed/i,
      /your\s+name/i,
      /tell\s+me\s+about\s+(you|yourself)/i,
    ],
    responses: [
      "I'm HEED — a gentle companion you can talk to about your feelings, your day, or things you'd like help organising. I'm not a replacement for a therapist, but I'm here to listen and walk through things with you. What brings you here today?",
    ],
  },

  {
    name: "what_can_you_do",
    patterns: [
      /what\s+can\s+you\s+do/i,
      /how\s+can\s+you\s+help/i,
      /what\s+do\s+you\s+do/i,
      /your\s+features/i,
      /\bcapabilit/i,
    ],
    responses: [
      "Here's what I can do with you:\n\n• Listen when things feel heavy\n• Help you talk through emotions\n• Walk you through a calming breathing or grounding exercise\n• Help you plan your day or break a task into smaller steps\n• Suggest a small reset when you're overwhelmed\n\nWhat would feel most helpful right now?",
    ],
  },

  {
    name: "how_are_you",
    patterns: [
      /how\s+are\s+you/i,
      /how('?s|\s+is)\s+(it|things|life)/i,
      /what'?s\s+up/i,
    ],
    responses: [
      "Thanks for asking — I'm doing alright! More importantly, how are you feeling right now?",
      "I'm here and ready to listen. So tell me — how are you, really?",
    ],
  },

  {
    name: "advice_help",
    patterns: [
      /help\s+me/i,
      /need\s+(help|guidance|support|advice)/i,
      /\badvice\b/i,
      /\bsuggest/i,
      /what\s+(should|do)\s+i\s+do/i,
      /tell\s+me\s+what\s+to\s+do/i,
      /don'?t\s+know\s+what\s+to\s+do/i,
      /pls\s+(help|understand)/i,
      /please\s+(help|understand)/i,
    ],
    responses: [
      "I'm here for you. To help in a useful way, can you tell me a bit more — is this about feelings, something specific that happened, or a decision you're stuck on?",
      "Of course. Share what's going on — even one sentence is enough to start. I'm listening without judgement.",
      "I'd love to help. Where would you like to start: how you're feeling, what happened, or what you want to do next?",
    ],
  },

  {
    name: "thanks",
    patterns: [
      /\bthank/i,
      /\bappreciate/i,
      /\bgrateful\s+(for|to)\s+you/i,
    ],
    responses: [
      "You're welcome. I'm glad I could be here. Is there anything else on your mind?",
      "Anytime. Come back whenever you need to talk — I'll be here.",
    ],
  },

  {
    name: "bye",
    patterns: [
      /^bye\b/i,
      /good\s*bye/i,
      /\bsee\s+you\b/i,
      /talk\s+later/i,
      /good\s+night/i,
      /\bgn\b/i,
    ],
    responses: [
      "Take care of yourself. I'll be here whenever you come back.",
      "Goodbye for now. Be gentle with yourself today.",
    ],
  },

  {
    name: "greeting",
    patterns: [
      /^(hi+|hello+|hey+|yo|namaste|hola)\b/i,
      /^good\s+(morning|afternoon|evening)\b/i,
    ],
    responses: [
      "Hi, I'm HEED. How are you feeling today?",
      "Hello — I'm glad you're here. What's on your mind?",
      "Hey there. Is there something weighing on you, or do you just want to chat?",
      "Hi. How has your day been so far?",
    ],
  },
];

function detectIntent(message: string): Intent | undefined {
  if (!message) return undefined;
  return INTENTS.find((intent) => intent.patterns.some((pattern) => pattern.test(message)));
}

function getFallbackReply(message: string): string {
  const intent = detectIntent(message ?? "");
  if (intent) {
    return pick(intent.responses);
  }

  const defaults = [
    "I hear you. Tell me a little more about what's going on?",
    "Thank you for sharing. Can you say a bit more so I can understand better?",
    "I'm listening. What's been on your mind today?",
    "That sounds important. Would you like to share more details?",
    "I'm here for you. Take your time — what would you like to talk about?",
  ];
  return pick(defaults);
}

export function registerChatRoutes(app: Express): void {

  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations(getUserId(req));
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const userId = getUserId(req);
      const conversation = await chatStorage.getConversation(id, userId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id, userId);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat", getUserId(req));
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      await chatStorage.deleteConversation(id, getUserId(req));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // NEW: Behavior profile endpoint
  app.get("/api/behavior-profile", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const checkins = await storage.getCheckins(userId);
      const allConversations = await chatStorage.getAllConversations(userId);
      const allMessages: Array<{ role: string; content: string }> = [];
      for (const conv of allConversations) {
        const msgs = await chatStorage.getMessagesByConversation(conv.id, userId);
        allMessages.push(...msgs);
      }
      const profile = analyzeUserBehavior({
        chatMessages: allMessages,
        checkins: checkins.map(c => ({
          mood: c.mood,
          activities: c.activities as Record<string, unknown>,
          skipped: c.skipped,
          date: c.date,
        })),
        userId,
      });
      res.json(summarizeProfile(profile));
    } catch (error) {
      console.error("Error building behavior profile:", error);
      res.status(500).json({ error: "Failed to build behavior profile" });
    }
  });

  // Enhanced message endpoint with behavioral context
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    const { content } = req.body ?? {};
    try {
      const conversationId = parseInt(String(req.params.id), 10);
      const userId = getUserId(req);

      console.log("Incoming message:", content);

      await chatStorage.createMessage(conversationId, userId, "user", content);

      const [checkins, allConversations] = await Promise.all([
        storage.getCheckins(userId),
        chatStorage.getAllConversations(userId),
      ]);

      const allHistoricalMessages: Array<{ role: string; content: string }> = [];
      for (const conv of allConversations) {
        const msgs = await chatStorage.getMessagesByConversation(conv.id, userId);
        allHistoricalMessages.push(...msgs);
      }

      const behaviorProfile = analyzeUserBehavior({
        chatMessages: allHistoricalMessages,
        checkins: checkins.map(c => ({
          mood: c.mood,
          activities: c.activities as Record<string, unknown>,
          skipped: c.skipped,
          date: c.date,
        })),
        userId,
      });

      const systemPrompt = buildSmartSystemPrompt(behaviorProfile);

      const thisConversationMessages = await chatStorage.getMessagesByConversation(conversationId, userId);
      const chatMessages = thisConversationMessages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      let assistantReply = "";

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatMessages,
          ],
          temperature: 0.2,
          max_tokens: 512,
        });

        assistantReply = completion.choices?.[0]?.message?.content?.trim() || "";
        console.log("OpenAI response:", assistantReply);

        if (!assistantReply) {
          throw new Error("OpenAI returned an empty assistant response.");
        }
      } catch (openaiError) {
        console.error("OpenAI failed:", openaiError);
        console.error(
          "OpenAI full error:",
          openaiError instanceof Error ? openaiError.stack || openaiError.message : JSON.stringify(openaiError, Object.getOwnPropertyNames(openaiError))
        );

        assistantReply = getFallbackReply(content);
        console.log("Using fallback response:", assistantReply);
      }

      await chatStorage.createMessage(conversationId, userId, "assistant", assistantReply);

      res.json({ reply: assistantReply, message: assistantReply, content: assistantReply });

    } catch (error) {
      console.error("Error sending message:", error instanceof Error ? error.message : error);
      console.error("Full error:", error);

      const emergencyFallback = getFallbackReply(content);
      res.json({ reply: emergencyFallback, message: emergencyFallback, content: emergencyFallback });
    }
  });
}
