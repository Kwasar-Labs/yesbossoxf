import { createLogger } from "@yesboss/utils";
import { connectToDatabase } from "./database/connection.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { ensureKnowledgeIndexes } from "./database/knowledge-repository.js";
import { ensureUserMemoryIndexes } from "./database/user-memory-repository.js";
import { ensureSessionIndexes } from "./database/session-repository.js";

const log = createLogger("workforce");

async function start() {
  await connectToDatabase(env.MONGO_URI);
  await Promise.all([
    ensureKnowledgeIndexes().catch((e) => log.error("knowledge index err", e)),
    ensureUserMemoryIndexes().catch((e) => log.error("user-memory index err", e)),
    ensureSessionIndexes().catch((e) => log.error("session index err", e)),
  ]);
  app.listen(env.PORT, () => {
    log.info(`Workforce service running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  log.error("Failed to start workforce service", err);
  process.exit(1);
});
