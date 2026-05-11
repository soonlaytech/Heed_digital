import { MongoClient, type Db } from "mongodb";

const databaseUrl = process.env.DATABASE_URL ?? process.env.MONGODB_URI;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a MongoDB database?");
}

const databaseName = (() => {
  try {
    const parsed = new URL(databaseUrl);
    const path = parsed.pathname.replace(/^\/+/, "");
    return path || process.env.MONGODB_DB_NAME || "heed";
  } catch {
    return process.env.MONGODB_DB_NAME || "heed";
  }
})();

let mongoClient: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

export async function getDb(): Promise<Db> {
  if (!dbPromise) {
    mongoClient = new MongoClient(databaseUrl as string);
    dbPromise = mongoClient.connect().then((client) => client.db(databaseName));
  }

  return dbPromise;
}

export async function nextSequence(name: string): Promise<number> {
  const db = await getDb();
  const counters = db.collection<{ _id: string; seq: number }>("counters");
  await counters.updateOne(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true }
  );

  const existing = await counters.findOne({ _id: name });
  return existing?.seq ?? 1;
}
