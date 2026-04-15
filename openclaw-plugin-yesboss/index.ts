/**
 * YesBoss OpenClaw Plugin Entry Point
 *
 * Registers all YesBoss management tools with the OpenClaw agent runtime.
 * Follows the Tavily plugin pattern from the OpenClaw extensions ecosystem.
 */

// @ts-ignore
import type { AnyAgentTool } from "openclaw/plugin-sdk";

// Task tools
import { createCreateTaskTool } from "./src/tools/task-tools.js";
import { createListTasksTool } from "./src/tools/task-tools.js";
import { createGetTaskTool } from "./src/tools/task-tools.js";
import { createUpdateTaskTool } from "./src/tools/task-tools.js";
import { createDeleteTaskTool } from "./src/tools/task-tools.js";
import { createUpdateTaskStatusTool } from "./src/tools/task-tools.js";

// Project tools
import { createCreateProjectTool } from "./src/tools/project-tools.js";
import { createListProjectsTool } from "./src/tools/project-tools.js";
import { createGetProjectTool } from "./src/tools/project-tools.js";
import { createUpdateProjectTool } from "./src/tools/project-tools.js";
import { createDeleteProjectTool } from "./src/tools/project-tools.js";

// Assignment tools
import { createAssignTaskTool } from "./src/tools/assignment-tools.js";
import { createUnassignTaskTool } from "./src/tools/assignment-tools.js";
import { createListMyTasksTool } from "./src/tools/assignment-tools.js";

// User tools
import { createLookupUserTool } from "./src/tools/user-tools.js";

// Knowledge Tools
import { createLearnFactTool, createSearchKnowledgeTool } from "./src/tools/knowledge-tools.js";

const plugin = {
  id: "yesboss",
  name: "YesBoss Workforce Management",
  description:
    "Manage tasks, projects, and teams through YesBoss via WhatsApp. Create tasks, update statuses, assign work, and query project progress.",

  register(api: any) {
    // OpenClaw provides the per-plugin config directly via api.pluginConfig
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
  },
};

export default plugin;
