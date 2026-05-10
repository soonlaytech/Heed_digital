import { checkins, settings, goals, quotes, type Checkin, type InsertCheckin, type Setting, type InsertSetting, type Goal, type InsertGoal, type Quote, type InsertQuote } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Checkins
  getCheckins(userId: string): Promise<Checkin[]>;
  getLatestCheckin(userId: string): Promise<Checkin | undefined>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  
  // Settings
  getSettings(userId: string): Promise<Setting | undefined>;
  createSettings(setting: InsertSetting): Promise<Setting>;
  updateSettings(userId: string, setting: Partial<InsertSetting>): Promise<Setting>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;
  
  // Quotes
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
}

export class DatabaseStorage implements IStorage {
  // Checkins
  async getCheckins(userId: string): Promise<Checkin[]> {
    return await db.select()
      .from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.time));
  }

  async getLatestCheckin(userId: string): Promise<Checkin | undefined> {
    const [checkin] = await db.select()
      .from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.time))
      .limit(1);
    return checkin;
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    const [newCheckin] = await db.insert(checkins)
      .values(checkin)
      .returning();
    return newCheckin;
  }

  // Settings
  async getSettings(userId: string): Promise<Setting | undefined> {
    const [setting] = await db.select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return setting;
  }

  async createSettings(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db.insert(settings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateSettings(userId: string, updates: Partial<InsertSetting>): Promise<Setting> {
    // Check if settings exist, if not create them
    let existing = await this.getSettings(userId);
    if (!existing) {
      return this.createSettings({ userId, ...updates } as InsertSetting);
    }

    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.userId, userId))
      .returning();
    return updated;
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal> {
    const [updated] = await db.update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals)
      .where(eq(goals.id, id));
  }

  // Quotes
  async getAllQuotes(): Promise<Quote[]> {
    return await db.select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes)
      .values(quote)
      .returning();
    return newQuote;
  }
}

export const storage = new DatabaseStorage();
