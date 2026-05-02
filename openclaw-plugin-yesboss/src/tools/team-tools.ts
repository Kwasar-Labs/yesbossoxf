/**
 * Team and user management tools — gives Venus full access to org members,
 * teams, and phone mappings via API key auth.
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- List Users ---
const ListUsersSchema = Type.Object({
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createListUsersTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_users",
    label: "List Org Users",
    description: "List all users (team members) in the organization. Returns id, name, email, role, phoneE164, teamIds.",
    parameters: ListUsersSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "GET",
          `/auth/users?organizationId=${encodeURIComponent(raw.organization_id as string)}`,
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

// --- Get User ---
const GetUserSchema = Type.Object({
  user_id: Type.String({ description: "User ID" }),
});

export function createGetUserTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_user",
    label: "Get User",
    description: "Get a single user by ID. Returns name, email, role, phoneE164, teamIds.",
    parameters: GetUserSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi("GET", `/auth/users/${raw.user_id}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- List Phone Mappings ---
const ListPhoneMappingsSchema = Type.Object({
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createListPhoneMappingsTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_phone_mappings",
    label: "List Phone Mappings",
    description: "List all registered WhatsApp phone numbers in the org. Use this to find a user's phone number when you only have their name or user_id.",
    parameters: ListPhoneMappingsSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "GET",
          `/auth/phone-mappings?organizationId=${encodeURIComponent(raw.organization_id as string)}`,
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

// --- List Teams ---
const ListTeamsSchema = Type.Object({
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createListTeamsTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_teams",
    label: "List Teams",
    description: "List all teams in the organization. Returns id, name, description, memberIds, leadId.",
    parameters: ListTeamsSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "GET",
          `/auth/teams?organizationId=${encodeURIComponent(raw.organization_id as string)}`,
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

// --- Get Team ---
const GetTeamSchema = Type.Object({
  team_id: Type.String({ description: "Team ID" }),
});

export function createGetTeamTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_team",
    label: "Get Team",
    description: "Get a team by ID. Returns name, description, memberIds, leadId.",
    parameters: GetTeamSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi("GET", `/auth/teams/${raw.team_id}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Create Team ---
const CreateTeamSchema = Type.Object({
  name: Type.String({ description: "Team name" }),
  organization_id: Type.String({ description: "Organization ID" }),
  description: Type.Optional(Type.String({ description: "Team description" })),
  lead_id: Type.Optional(Type.String({ description: "User ID of team lead" })),
  member_ids: Type.Optional(Type.Array(Type.String(), { description: "Initial member user IDs" })),
});

export function createCreateTeamTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_create_team",
    label: "Create Team",
    description: "Create a new team in the organization. Admin only.",
    parameters: CreateTeamSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          name: raw.name,
          organizationId: raw.organization_id,
        };
        if (raw.description) body.description = raw.description;
        if (raw.lead_id) body.leadId = raw.lead_id;
        if (raw.member_ids) body.memberIds = raw.member_ids;
        const result = await callYesBossApi("POST", "/auth/teams", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Update Team ---
const UpdateTeamSchema = Type.Object({
  team_id: Type.String({ description: "Team ID" }),
  name: Type.Optional(Type.String({ description: "New name" })),
  description: Type.Optional(Type.String({ description: "New description" })),
  lead_id: Type.Optional(Type.String({ description: "New lead user ID" })),
  is_active: Type.Optional(Type.Boolean({ description: "Set false to deactivate" })),
});

export function createUpdateTeamTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_update_team",
    label: "Update Team",
    description: "Update a team's name, description, or lead. Admin only.",
    parameters: UpdateTeamSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {};
        if (raw.name !== undefined) body.name = raw.name;
        if (raw.description !== undefined) body.description = raw.description;
        if (raw.lead_id !== undefined) body.leadId = raw.lead_id;
        if (raw.is_active !== undefined) body.isActive = raw.is_active;
        const result = await callYesBossApi("PATCH", `/auth/teams/${raw.team_id}`, body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Add Team Member ---
const TeamMemberSchema = Type.Object({
  team_id: Type.String({ description: "Team ID" }),
  user_id: Type.String({ description: "User ID to add" }),
});

export function createAddTeamMemberTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_add_team_member",
    label: "Add Team Member",
    description: "Add a user to a team. Admin only.",
    parameters: TeamMemberSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "POST",
          `/auth/teams/${raw.team_id}/members`,
          { userId: raw.user_id },
          config,
        );
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Remove Team Member ---
export function createRemoveTeamMemberTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_remove_team_member",
    label: "Remove Team Member",
    description: "Remove a user from a team. Admin only.",
    parameters: TeamMemberSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "DELETE",
          `/auth/teams/${raw.team_id}/members`,
          { userId: raw.user_id },
          config,
        );
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}
