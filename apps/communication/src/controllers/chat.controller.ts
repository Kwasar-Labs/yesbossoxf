import type { Response } from "express";
import { asyncHandler, ok, createLogger } from "@yesboss/utils";
import { AuthenticatedRequest } from "../middlewares/auth-guard.js";
import { getDb } from "../database/connection.js";
import { ObjectId } from "mongodb";
import { sendToOpenClaw, type OpenClawMessage } from "../services/openclaw.service.js";

const log = createLogger("chat-controller");

interface ChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

export const chat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { message, context } = req.body as ChatRequest;

  if (!message?.trim()) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Message is required" } });
  }

  const userId = req.user!.userId;
  const orgId = req.user!.organizationId;

  const db = getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

  // Save incoming message
  await db.collection("chat_messages").insertOne({
    userId,
    organizationId: orgId,
    role: "user",
    content: message,
    context: context ?? null,
    createdAt: new Date(),
  });

  // Fetch recent conversation history
  const historyCursor = await db
    .collection("chat_messages")
    .find({ userId, organizationId: orgId })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const history = historyCursor.reverse().map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  })) as OpenClawMessage[];

  // Automatically fetch highly relevant context from the latest Knowledge Base entries
  let relevantFactContext = "";
  try {
    const recentFacts = await db.collection("knowledge_facts")
      .find({ organizationId: new ObjectId(orgId) })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
      
    if (recentFacts.length > 0) {
      relevantFactContext = "\n\nCRITICAL CONTEXT FROM KNOWLEDGE BASE:\n" + 
        recentFacts.map(f => `- [${f.category}] ${f.content}`).join("\n");
    }
  } catch (err) {
    log.error(`Failed to inject knowledge base context: ${err}`);
  }

  // Prepend a system message specifically for this invocation
  // to ensure OpenClaw tool calls know which user/org ID to act on.
  const systemPrompt: OpenClawMessage = {
    role: "system",
    content: `You are chatting with a user in the web application.
Current user ID: ${userId}
Current organization ID: ${orgId}
User Name: ${user?.name || "Unknown"}${relevantFactContext}

When executing tools that require organization_id or assignee_id, use these specific IDs as default unless specified otherwise. Keep your responses concise and markdown formatted.`,
  };

  const messages: OpenClawMessage[] = [systemPrompt, ...history];

  try {
    const response = await sendToOpenClaw(messages, "yesboss-agent");

    // Save response
    await db.collection("chat_messages").insertOne({
      userId,
      organizationId: orgId,
      role: "assistant",
      content: response,
      createdAt: new Date(),
    });

    return res.json({ response });
  } catch (error) {
    log.error("OpenClaw agent error:", error);
    res.status(500).json({ 
      error: { code: "OPENCLAW_ERROR", message: "Failed to get AI response from OpenClaw." } 
    });
  }
});
