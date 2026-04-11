import { MongoClient, Db } from "mongodb";
import { createLogger } from "@yesboss/utils";

const log = createLogger("communication:db");
let db: Db;

export async function connectToDatabase(uri: string): Promise<void> {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  log.info("Connected to MongoDB");
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase first.");
  return db;
}
