/**
 * YesBoss Reminder Dispatcher
 * Runs on the EC2 host (outside Docker) as a systemd timer every 60s.
 * Polls MongoDB Atlas for due task reminders and delivers them via
 * `openclaw agent --deliver` → Venus → WhatsApp.
 *
 * Timezone: All reminder dates stored as UTC. Venus converts "10 AM IST"
 * to UTC (04:30 UTC) when setting reminders.
 */

import { MongoClient } from "mongodb";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";

const ENV_FILE = "/opt/yesboss/.env";
const OPENCLAW_BIN = "/usr/bin/openclaw";

// Parse .env
const env = {};
readFileSync(ENV_FILE, "utf8")
  .split("\n")
  .forEach((line) => {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim();
      if (k) env[k] = v;
    }
  });

const MONGO_URI = env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not found in", ENV_FILE);
  process.exit(1);
}

async function dispatch() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db("yesboss");
    const now = new Date();

    // Find tasks with at least one reminder date <= now
    const tasks = await db
      .collection("tasks")
      .find({ reminders: { $elemMatch: { $lte: now } } })
      .toArray();

    if (tasks.length === 0) return;

    for (const task of tasks) {
      const fired = (task.firedReminders || []).map((d) => new Date(d).getTime());
      const due = (task.reminders || []).filter((r) => {
        const t = new Date(r).getTime();
        return t <= now.getTime() && !fired.includes(t);
      });

      if (due.length === 0) continue;

      // Resolve phone: prefer assignee, fall back to any org member
      let phone = null;
      if (task.assigneeId) {
        const m = await db
          .collection("phone_user_mappings")
          .findOne({ userId: task.assigneeId.toString() });
        if (m) phone = m.phoneE164;
      }
      if (!phone) {
        const m = await db
          .collection("phone_user_mappings")
          .findOne({ organizationId: task.organizationId.toString() });
        if (m) phone = m.phoneE164;
      }

      if (!phone) {
        console.warn(`[reminder-dispatcher] No phone for task ${task._id} "${task.title}" — skipped`);
        continue;
      }

      const msg = `⏰ Reminder: *${task.title}*`;

      try {
        execFileSync(
          OPENCLAW_BIN,
          ["agent", "--to", phone, "--deliver", "--channel", "whatsapp", "--message", msg],
          { timeout: 30_000, stdio: "pipe" },
        );
        console.log(`[reminder-dispatcher] Sent "${task.title}" → ${phone}`);

        // Mark all fired reminders atomically
        await db.collection("tasks").updateOne(
          { _id: task._id },
          { $addToSet: { firedReminders: { $each: due.map((d) => new Date(d)) } } },
        );
      } catch (err) {
        console.error(
          `[reminder-dispatcher] Failed to send "${task.title}":`,
          err.stderr?.toString() || err.message,
        );
      }
    }
  } finally {
    await client.close();
  }
}

dispatch().catch((err) => {
  console.error("[reminder-dispatcher] Fatal:", err.message);
  process.exit(1);
});
