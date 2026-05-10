import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

// Re-export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

// Check-ins table
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // users.id is varchar
  date: text("date").notNull(), // YYYY-MM-DD
  time: timestamp("time").defaultNow(),
  mood: text("mood"), // 'good', 'neutral', 'bad', etc.
  response: text("response"),
  activities: jsonb("activities"), // Array of strings or object
  skipped: boolean("skipped").default(false),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  checkinTime: text("checkin_time").default("20:00"), // 8 PM default
  notifications: boolean("notifications").default(true),
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true, time: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

// Explicit API Types
export type CreateCheckinRequest = InsertCheckin;
export type UpdateSettingsRequest = Partial<InsertSetting>;
