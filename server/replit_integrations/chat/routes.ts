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

function getFallbackReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
    return "Hi, I am HEED. How are you feeling today?";
  }

  if (
    text.includes("sad") ||
    text.includes("bad") ||
    text.includes("not feeling good") ||
    text.includes("tired") ||
    text.includes("stressed") ||
    text.includes("anxious") ||
    text.includes("worried")
  ) {
    return "I'm sorry you're feeling this way. Do you want to tell me what happened?";
  }

  if (
    text.includes("happy") ||
    text.includes("good") ||
    text.includes("fine") ||
    text.includes("great")
  ) {
    return "That's nice to hear. What made your day good?";
  }

  const replies = [
    "I'm here for you. Tell me more.",
    "That sounds important. How has your day been?",
    "I understand. Would you like to talk more about it?",
    "Thank you for sharing that with me. What happened next?"
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

export function registerChatRoutes(app: Express): void {

  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // NEW: Behavior profile endpoint
  app.get("/api/behavior-profile", async (req: Request, res: Response) => {
    try {
      const userId = DEFAULT_USER_ID;
      const checkins = await storage.getCheckins(userId);
      const allConversations = await chatStorage.getAllConversations();
      const allMessages: Array<{ role: string; content: string }> = [];
      for (const conv of allConversations) {
        const msgs = await chatStorage.getMessagesByConversation(conv.id);
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
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = DEFAULT_USER_ID;

      console.log("Incoming message:", content);

      await chatStorage.createMessage(conversationId, "user", content);

      const [checkins, allConversations] = await Promise.all([
        storage.getCheckins(userId),
        chatStorage.getAllConversations(),
      ]);

      const allHistoricalMessages: Array<{ role: string; content: string }> = [];
      for (const conv of allConversations) {
        const msgs = await chatStorage.getMessagesByConversation(conv.id);
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

      const thisConversationMessages = await chatStorage.getMessagesByConversation(conversationId);
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

        // Use smart fallback function based on user message
        assistantReply = getFallbackReply(content);
        console.log("Using fallback response:", assistantReply);
      }

      await chatStorage.createMessage(conversationId, "assistant", assistantReply);

      res.json({ reply: assistantReply, message: assistantReply, content: assistantReply });

    } catch (error) {
      console.error("Error sending message:", error instanceof Error ? error.message : error);
      console.error("Full error:", error);

      // Emergency fallback using smart function
      const emergencyFallback = getFallbackReply(content);
      res.json({ reply: emergencyFallback, message: emergencyFallback, content: emergencyFallback });
    }
  });
}
