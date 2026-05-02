/**
 * YesBoss OpenClaw Plugin Entry Point
 */

// @ts-ignore
import type { AnyAgentTool } from "openclaw/plugin-sdk";

import {
  createCreateTaskTool, createListTasksTool, createGetTaskTool,
  createUpdateTaskTool, createDeleteTaskTool, createUpdateTaskStatusTool,
} from "./src/tools/task-tools.js";

import {
  createCreateProjectTool, createListProjectsTool, createGetProjectTool,
  createUpdateProjectTool, createDeleteProjectTool,
} from "./src/tools/project-tools.js";

import {
  createAssignTaskTool, createUnassignTaskTool, createListMyTasksTool,
} from "./src/tools/assignment-tools.js";

import { createLookupUserTool } from "./src/tools/user-tools.js";

import {
  createListUsersTool, createGetUserTool, createListPhoneMappingsTool,
  createListTeamsTool, createGetTeamTool, createCreateTeamTool,
  createUpdateTeamTool, createAddTeamMemberTool, createRemoveTeamMemberTool,
} from "./src/tools/team-tools.js";

import { createLearnFactTool, createSearchKnowledgeTool } from "./src/tools/knowledge-tools.js";

import {
  createGetUserMemoryTool, createUpsertUserMemoryTool,
  createPushRecentTool, createAddUserSkillTool,
} from "./src/tools/user-memory-tools.js";

import {
  createGetSessionTool, createAppendTurnTool,
  createSetIntentTool, createSetConfirmationTool,
} from "./src/tools/session-tools.js";

import { createDecomposeTaskTool } from "./src/tools/decompose-tools.js";

import { createSendWaMessageTool } from "./src/tools/messaging-tools.js";

const plugin = {
  id: "yesboss",
  name: "YesBoss Workforce Management",
  description: "Manage tasks, projects, teams, users, and org knowledge via WhatsApp.",

  register(api: any) {
    const config = (api.pluginConfig || api.config?.plugins?.entries?.yesboss?.config) as
      | { apiUrl?: string; apiKey?: string }
      | undefined;

    console.log("[yesboss-plugin] register() config:", JSON.stringify(config));

    // Tasks
    api.registerTool(createCreateTaskTool(config) as AnyAgentTool);
    api.registerTool(createListTasksTool(config) as AnyAgentTool);
    api.registerTool(createGetTaskTool(config) as AnyAgentTool);
    api.registerTool(createUpdateTaskTool(config) as AnyAgentTool);
    api.registerTool(createDeleteTaskTool(config) as AnyAgentTool);
    api.registerTool(createUpdateTaskStatusTool(config) as AnyAgentTool);

    // Projects
    api.registerTool(createCreateProjectTool(config) as AnyAgentTool);
    api.registerTool(createListProjectsTool(config) as AnyAgentTool);
    api.registerTool(createGetProjectTool(config) as AnyAgentTool);
    api.registerTool(createUpdateProjectTool(config) as AnyAgentTool);
    api.registerTool(createDeleteProjectTool(config) as AnyAgentTool);

    // Assignment
    api.registerTool(createAssignTaskTool(config) as AnyAgentTool);
    api.registerTool(createUnassignTaskTool(config) as AnyAgentTool);
    api.registerTool(createListMyTasksTool(config) as AnyAgentTool);

    // Users & teams (full org access)
    api.registerTool(createLookupUserTool(config) as AnyAgentTool);
    api.registerTool(createListUsersTool(config) as AnyAgentTool);
    api.registerTool(createGetUserTool(config) as AnyAgentTool);
    api.registerTool(createListPhoneMappingsTool(config) as AnyAgentTool);
    api.registerTool(createListTeamsTool(config) as AnyAgentTool);
    api.registerTool(createGetTeamTool(config) as AnyAgentTool);
    api.registerTool(createCreateTeamTool(config) as AnyAgentTool);
    api.registerTool(createUpdateTeamTool(config) as AnyAgentTool);
    api.registerTool(createAddTeamMemberTool(config) as AnyAgentTool);
    api.registerTool(createRemoveTeamMemberTool(config) as AnyAgentTool);

    // Knowledge base
    api.registerTool(createLearnFactTool(config) as AnyAgentTool);
    api.registerTool(createSearchKnowledgeTool(config) as AnyAgentTool);

    // User memory
    api.registerTool(createGetUserMemoryTool(config) as AnyAgentTool);
    api.registerTool(createUpsertUserMemoryTool(config) as AnyAgentTool);
    api.registerTool(createPushRecentTool(config) as AnyAgentTool);
    api.registerTool(createAddUserSkillTool(config) as AnyAgentTool);

    // Session
    api.registerTool(createGetSessionTool(config) as AnyAgentTool);
    api.registerTool(createAppendTurnTool(config) as AnyAgentTool);
    api.registerTool(createSetIntentTool(config) as AnyAgentTool);
    api.registerTool(createSetConfirmationTool(config) as AnyAgentTool);

    // Decomposition
    api.registerTool(createDecomposeTaskTool(config) as AnyAgentTool);

    // Outbound messaging
    api.registerTool(createSendWaMessageTool(config) as AnyAgentTool);
  },
};

export default plugin;
