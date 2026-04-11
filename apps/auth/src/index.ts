import { createLogger } from "@yesboss/utils";
import { connectToDatabase } from "./database/connection.js";
import app from "./app.js";
import { env } from "./config/env.js";

const log = createLogger("auth");

async function start() {
  await connectToDatabase(env.MONGO_URI);
  app.listen(env.PORT, () => {
    log.info(`Auth service running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  log.error("Failed to start auth service", err);
  process.exit(1);
});
