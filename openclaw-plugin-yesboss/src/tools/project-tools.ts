/**
 * Project management tools for the YesBoss OpenClaw plugin.
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- Create Project ---
const CreateProjectSchema = Type.Object({
  name: Type.String({ description: "Project name" }),
  description: Type.Optional(Type.String({ description: "Project description" })),
  organization_id: Type.String({ description: "Organization ID" }),
  owner_ids: Type.Optional(Type.Array(Type.String(), { description: "User IDs of project owners" })),
});

export function createCreateProjectTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_create_project",
    label: "Create Project",
    description: "Create a new project. Requires name and organization_id. Admin only.",
    parameters: CreateProjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          name: rawParams.name,
          organizationId: rawParams.organization_id,
        };
        if (rawParams.description) body.description = rawParams.description;
        if (rawParams.owner_ids) body.ownerIds = rawParams.owner_ids;
        const result = await callYesBossApi("POST", "/workforce/projects", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- List Projects ---
const ListProjectsSchema = Type.Object({
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createListProjectsTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_projects",
    label: "List Projects",
    description: "List all projects in an organization.",
    parameters: ListProjectsSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "GET",
          `/workforce/projects?organizationId=${rawParams.organization_id}`,
          undefined,
          config,
        );
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Get Project ---
const GetProjectSchema = Type.Object({
  project_id: Type.String({ description: "Project ID" }),
});

export function createGetProjectTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_project",
    label: "Get Project",
    description: "Get detailed information about a specific project.",
    parameters: GetProjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi("GET", `/workforce/projects/${rawParams.project_id}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Update Project ---
const UpdateProjectSchema = Type.Object({
  project_id: Type.String({ description: "Project ID" }),
  name: Type.Optional(Type.String({ description: "New name" })),
  description: Type.Optional(Type.String({ description: "New description" })),
  status: Type.Optional(Type.String({ description: "New status: active, on_hold, completed, archived" })),
});

export function createUpdateProjectTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_update_project",
    label: "Update Project",
    description: "Update a project's fields. Admin only.",
    parameters: UpdateProjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const { project_id, ...updates } = rawParams;
        const body: Record<string, unknown> = {};
        if (updates.name) body.name = updates.name;
        if (updates.description) body.description = updates.description;
        if (updates.status) body.status = updates.status;
        const result = await callYesBossApi("PATCH", `/workforce/projects/${project_id}`, body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Delete Project (destructive) ---
const DeleteProjectSchema = Type.Object({
  project_id: Type.String({ description: "Project ID to delete" }),
  confirmed: Type.Optional(Type.Boolean({ description: "Must be true to confirm deletion" })),
});

export function createDeleteProjectTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_delete_project",
    label: "Delete Project",
    description: "Delete a project permanently. Destructive — requires confirmed=true. Admin only.",
    parameters: DeleteProjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        if (!rawParams.confirmed) {
          return toolResult({
            warning: "This is a destructive operation. Confirm with the user first by asking them to reply YES. Then call again with confirmed=true.",
            project_id: rawParams.project_id,
          });
        }
        const result = await callYesBossApi("DELETE", `/workforce/projects/${rawParams.project_id}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}
