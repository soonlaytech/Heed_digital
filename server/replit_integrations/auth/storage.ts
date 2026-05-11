import { type User, type UpsertUser } from "@shared/models/auth";
import { getDb } from "../../db";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDb();
    return (await db.collection<User>("users").findOne({ id })) || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const db = await getDb();
    const users = db.collection<User>("users");
    const now = new Date();
    const id = userData.id ?? "local-user";
    const existing = await users.findOne({ id });

    if (existing) {
      const updated: User = {
        ...existing,
        ...userData,
        id,
        email: userData.email ?? null,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        profileImageUrl: userData.profileImageUrl ?? null,
        createdAt: existing.createdAt ?? now,
        updatedAt: now,
      };
      await users.updateOne({ id }, { $set: updated });
      return updated;
    }

    const document: User = {
      ...userData,
      id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await users.insertOne(document);
    return document;
  }
}

export const authStorage = new AuthStorage();
