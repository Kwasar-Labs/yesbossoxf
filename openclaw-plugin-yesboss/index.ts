/**
 * YesBoss OpenClaw Plugin Entry Point
 *
 * Registers all YesBoss management tools with the OpenClaw agent runtime.
 */

// @ts-ignore
import type { AnyAgentTool } from "openclaw/plugin-sdk";

// Task tools
import {
  createCreateTaskTool,
  createListTasksTool,
  createGetTaskTool,
  createUpdateTaskTool,
  createDeleteTaskTool,
  createUpdateTaskStatusTool,
} from "./src/tools/task-tools.js";

// Project tools
import {
  createCreateProjectTool,
  createListProjectsTool,
  createGetProjectTool,
  createUpdateProjectTool,
  createDeleteProjectTool,
} from "./src/tools/project-tools.js";

// Assignment tools
import {
  createAssignTaskTool,
  createUnassignTaskTool,
  createListMyTasksTool,
} from "./src/tools/assignment-tools.js";

// User tools
import { createLookupUserTool } from "./src/tools/user-tools.js";

// Knowledge tools
import { createLearnFactTool, createSearchKnowledgeTool } from "./src/tools/knowledge-tools.js";

// User memory tools
import {
  createGetUserMemoryTool,
  createUpsertUserMemoryTool,
  createPushRecentTool,
  createAddUserSkillTool,
} from "./src/tools/user-memory-tools.js";

// Session tools
import {
  createGetSessionTool,
  createAppendTurnTool,
  createSetIntentTool,
  createSetConfirmationTool,
} from "./src/tools/session-tools.js";

// Decompose tools
import { createDecomposeTaskTool } from "./src/tools/decompose-tools.js";

const plugin = {
  id: "yesboss",
  name: "YesBoss Workforce Management",
  description:
    "Manage tasks, projects, teams, and org knowledge via WhatsApp. Create/update tasks, assign work, query the knowledge base, track conversation state, and decompose epics.",

  register(api: any) {
    const config = (api.pluginConfig || api.config?.plugins?.entries?.yesboss?.config) as
      | { apiUrl?: string; apiKey?: string }
      | undefined;

    console.log("[yesboss-plugin] register() config:", JSON.stringify(config));

    // Task tools
    api.registerTool(createCreateTaskTool(config) as AnyAgentTool);
    api.registerTool(createListTasksTool(config) as AnyAgentTool);
    api.registerTool(createGetTaskTool(config) as AnyAgentTool);
    api.registerTool(createUpdateTaskTool(config) as AnyAgentTool);
    api.registerTool(createDeleteTaskTool(config) as AnyAgentTool);
    api.registerTool(createUpdateTaskStatusTool(config) as AnyAgentTool);

    // Project tools
    api.registerTool(createCreateProjectTool(config) as AnyAgentTool);
    api.registerTool(createListProjectsTool(config) as AnyAgentTool);
    api.registerTool(createGetProjectTool(config) as AnyAgentTool);
    api.registerTool(createUpdateProjectTool(config) as AnyAgentTool);
    api.registerTool(createDeleteProjectTool(config) as AnyAgentTool);

    // Assignment tools
    api.registerTool(createAssignTaskTool(config) as AnyAgentTool);
    api.registerTool(createUnassignTaskTool(config) as AnyAgentTool);
    api.registerTool(createListMyTasksTool(config) as AnyAgentTool);

    // User lookup
    api.registerTool(createLookupUserTool(config) as AnyAgentTool);

    // Knowledge base
    api.registerTool(createLearnFactTool(config) as AnyAgentTool);
    api.registerTool(createSearchKnowledgeTool(config) as AnyAgentTool);

    // User memory
    api.registerTool(createGetUserMemoryTool(config) as AnyAgentTool);
    api.registerTool(createUpsertUserMemoryTool(config) as AnyAgentTool);
    api.registerTool(createPushRecentTool(config) as AnyAgentTool);
    api.registerTool(createAddUserSkillTool(config) as AnyAgentTool);

    // Conversation session
    api.registerTool(createGetSessionTool(config) as AnyAgentTool);
    api.registerTool(createAppendTurnTool(config) as AnyAgentTool);
    api.registerTool(createSetIntentTool(config) as AnyAgentTool);
    api.registerTool(createSetConfirmationTool(config) as AnyAgentTool);

    // Decomposition
    api.registerTool(createDecomposeTaskTool(config) as AnyAgentTool);
  },
};

export default plugin;
