import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  registerAuthRoutes(app);

  // Chat Routes
  registerChatRoutes(app);

  // Checkins
  app.get(api.checkins.list.path, async (req, res) => {
    const userId = "local-user";
    const checkins = await storage.getCheckins(userId);
    res.json(checkins);
  });

  app.get(api.checkins.latest.path, async (req, res) => {
    const userId = "local-user";
    const checkin = await storage.getLatestCheckin(userId);
    res.json(checkin || null);
  });

  app.post(api.checkins.create.path, async (req, res) => {
    const userId = "local-user";
    try {
      const input = api.checkins.create.input.parse({
        ...req.body,
        userId,
      });
      const checkin = await storage.createCheckin(input);
      res.status(201).json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const userId = "local-user";
    let settings = await storage.getSettings(userId);

    if (!settings) {
      settings = await storage.createSettings({
        userId,
        checkinTime: "20:00",
        notifications: true,
      });
    }

    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const userId = "local-user";
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(userId, input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    const userId = "local-user";
    const userGoals = await storage.getGoals(userId);
    res.json(userGoals);
  });

  app.post("/api/goals", async (req, res) => {
    const userId = "local-user";
    try {
      const input = { userId, ...req.body };
      const goal = await storage.createGoal(input);
      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const goal = await storage.updateGoal(id, req.body);
      res.json(goal);
    } catch (err) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteGoal(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    const allQuotes = await storage.getAllQuotes();
    res.json(allQuotes);
  });

  return httpServer;
}
