import { MongoClient, type Db } from "mongodb";
import { createLogger } from "@yesboss/utils";

const log = createLogger("auth:db");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(mongoUri: string): Promise<Db> {
  if (db) return db;

  const maxRetries = 8;
  let delay = 1000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db();
      log.info("Connected to MongoDB");
      return db;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      log.warn(`MongoDB connection failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 15000);
    }
  }
  throw new Error("Unreachable");
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase first.");
  return db;
}
