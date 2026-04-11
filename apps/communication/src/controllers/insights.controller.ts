import type { Response } from "express";
import { asyncHandler, ok, createLogger } from "@yesboss/utils";
import { AuthenticatedRequest } from "../middlewares/auth-guard.js";
import { getDb } from "../database/connection.js";
import { ObjectId } from "mongodb";
import { sendToOpenClaw, type OpenClawMessage } from "../services/openclaw.service.js";

const log = createLogger("insights-controller");

export const getInsights = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const orgId = req.user!.organizationId;

  const db = getDb();
  
  // Aggregate operations data
  const tasks = await db.collection("tasks").find({ organizationId: new ObjectId(orgId), status: { $ne: "done" } }).toArray();
  const users = await db.collection("users").find({ organizationId: new ObjectId(orgId) }).toArray();
  const recentActivities = await db.collection("chat_messages").find({ organizationId: new ObjectId(orgId) }).sort({ createdAt: -1 }).limit(5).toArray();

  const operationsContext = JSON.stringify({
    totalActiveTasks: tasks.length,
    users: users.map(u => ({ name: u.name, role: u.role })),
    tasksSummary: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, assigneeId: t.assigneeId })),
    recentChatActivity: recentActivities.length
  });

  const systemPrompt: OpenClawMessage = {
    role: "system",
    content: "You are an elite AI Operations Manager. Read the following JSON operations data for the organization and provide a concise, sharp 3-bullet executive summary of what is happening, what is falling behind, or what needs attention right now. Format your response strictly as a Markdown list. Do not use conversational filler, just the insights.\n\nDATA:\n" + operationsContext
  };

  const response = await sendToOpenClaw([systemPrompt], "yesboss-agent");
  
  const content = response || "No insights generated.";
  
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-') || line.startsWith('*'))
    .map(line => line.substring(1).trim());

  const insights = lines.length > 0 ? lines : [content];

  ok(res, { insights });
});