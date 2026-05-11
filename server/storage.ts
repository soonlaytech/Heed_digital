import { type Checkin, type InsertCheckin, type Setting, type InsertSetting, type Goal, type InsertGoal, type Quote, type InsertQuote } from "@shared/schema";
import { getDb, nextSequence } from "./db";

type CheckinDoc = Checkin & { createdAt?: Date };
type SettingDoc = Setting;
type GoalDoc = Goal & { createdAt?: Date };
type QuoteDoc = Quote & { createdAt?: Date };

function normalizeCheckin(checkin: InsertCheckin & { id: number; time: Date }): Checkin {
  return {
    ...checkin,
    mood: checkin.mood ?? null,
    response: checkin.response ?? null,
    activities: checkin.activities ?? null,
    skipped: checkin.skipped ?? null,
  };
}

function normalizeSetting(setting: InsertSetting & { id: number }): Setting {
  return {
    ...setting,
    checkinTime: setting.checkinTime ?? null,
    notifications: setting.notifications ?? null,
  };
}

function normalizeGoal(goal: InsertGoal & { id: number; createdAt: Date }): Goal {
  return {
    ...goal,
    description: goal.description ?? null,
    completed: goal.completed ?? null,
    createdAt: goal.createdAt,
  };
}

function normalizeQuote(quote: InsertQuote & { id: number; createdAt: Date }): Quote {
  return {
    ...quote,
    createdAt: quote.createdAt ?? null,
  };
}

async function getCollections() {
  const db = await getDb();
  return {
    checkins: db.collection<CheckinDoc>("checkins"),
    settings: db.collection<SettingDoc>("settings"),
    goals: db.collection<GoalDoc>("goals"),
    quotes: db.collection<QuoteDoc>("quotes"),
  };
}

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
    const { checkins } = await getCollections();
    return checkins.find({ userId }).sort({ time: -1, id: -1 }).toArray();
  }

  async getLatestCheckin(userId: string): Promise<Checkin | undefined> {
    const { checkins } = await getCollections();
    return (await checkins.findOne({ userId }, { sort: { time: -1, id: -1 } })) || undefined;
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    const { checkins } = await getCollections();
    const document = normalizeCheckin({
      ...checkin,
      mood: checkin.mood ?? null,
      response: checkin.response ?? null,
      activities: checkin.activities ?? null,
      skipped: checkin.skipped ?? null,
      id: await nextSequence("checkins"),
      time: new Date(),
    });
    await checkins.insertOne(document as CheckinDoc);
    return document;
  }

  // Settings
  async getSettings(userId: string): Promise<Setting | undefined> {
    const { settings } = await getCollections();
    return (await settings.findOne({ userId })) || undefined;
  }

  async createSettings(setting: InsertSetting): Promise<Setting> {
    const { settings } = await getCollections();
    const document = normalizeSetting({
      ...setting,
      checkinTime: setting.checkinTime ?? null,
      notifications: setting.notifications ?? null,
      id: await nextSequence("settings"),
    });
    await settings.updateOne(
      { userId: document.userId },
      { $set: document },
      { upsert: true }
    );
    return document;
  }

  async updateSettings(userId: string, updates: Partial<InsertSetting>): Promise<Setting> {
    const { settings } = await getCollections();
    const existing = await this.getSettings(userId);
    if (!existing) {
      return this.createSettings({ userId, ...updates } as InsertSetting);
    }

    const updated = normalizeSetting({
      ...existing,
      ...updates,
      userId,
      id: existing.id,
    });
    await settings.updateOne({ userId }, { $set: updated });
    return updated;
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    const { goals } = await getCollections();
    return goals.find({ userId }).sort({ createdAt: -1, id: -1 }).toArray();
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const { goals } = await getCollections();
    const document = normalizeGoal({
      ...goal,
      description: goal.description ?? null,
      completed: goal.completed ?? false,
      id: await nextSequence("goals"),
      createdAt: new Date(),
    });
    await goals.insertOne(document as GoalDoc);
    return document;
  }

  async updateGoal(id: number, updates: Partial<InsertGoal>): Promise<Goal> {
    const { goals } = await getCollections();
    const existing = await goals.findOne({ id });
    if (!existing) {
      throw new Error("Goal not found");
    }

    const updated = normalizeGoal({
      ...existing,
      ...updates,
      id,
      description: updates.description ?? existing.description ?? null,
      completed: updates.completed ?? existing.completed ?? false,
      createdAt: existing.createdAt ?? new Date(),
    });
    await goals.updateOne({ id }, { $set: updated as GoalDoc });
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    const { goals } = await getCollections();
    await goals.deleteOne({ id });
  }

  // Quotes
  async getAllQuotes(): Promise<Quote[]> {
    const { quotes } = await getCollections();
    return quotes.find().sort({ createdAt: -1, id: -1 }).toArray();
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const { quotes } = await getCollections();
    const existing = await quotes.findOne({ text: quote.text });
    if (existing) {
      return existing;
    }

    const document = normalizeQuote({
      ...quote,
      id: await nextSequence("quotes"),
      createdAt: new Date(),
    });
    await quotes.insertOne(document as QuoteDoc);
    return document;
  }
}

export const storage = new DatabaseStorage();
