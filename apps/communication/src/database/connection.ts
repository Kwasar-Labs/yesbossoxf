import { MongoClient, Db } from "mongodb";
import { createLogger } from "@yesboss/utils";

const log = createLogger("communication:db");
let db: Db;

export async function connectToDatabase(uri: string): Promise<void> {
  const maxRetries = 8;
  let delay = 1000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      db = client.db();
      log.info("Connected to MongoDB");
      return;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      log.warn(`MongoDB connection failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 15000);
    }
  }
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase first.");
  return db;
}
