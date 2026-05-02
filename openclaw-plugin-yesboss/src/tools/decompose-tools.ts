import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

const DecomposeTaskSchema = Type.Object({
  description: Type.String({ description: "Free-form description of the epic / large task to decompose." }),
  organization_id: Type.String({ description: "Organization ID" }),
  project_id: Type.Optional(Type.String({ description: "Project ID if the plan lives under a project." })),
});

export function createDecomposeTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_decompose_task",
    label: "Decompose Task",
    description:
      "Break a large task/epic into suggested subtasks. Returns { parent, subtasks[], matched_sops[], template_used }. Uses KB SOPs + built-in templates (launch, deploy, migrate, onboard, feature, bug). Call before proposing a plan to the user.",
    parameters: DecomposeTaskSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          description: raw.description,
          organizationId: raw.organization_id,
        };
        if (raw.project_id) body.projectId = raw.project_id;
        const result = await callYesBossApi("POST", "/workforce/decompose/task", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}
