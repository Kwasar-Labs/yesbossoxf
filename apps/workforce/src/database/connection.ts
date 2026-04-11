import { MongoClient, type Db } from "mongodb";
import { createLogger } from "@yesboss/utils";

const log = createLogger("workforce:db");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(mongoUri: string): Promise<Db> {
  if (db) return db;

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db();
  log.info("Connected to MongoDB");
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase first.");
  return db;
}
