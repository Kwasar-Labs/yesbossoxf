import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as KBRepo from "../database/knowledge-repository.js";
import { FactCategory } from "@yesboss/types";

/**
 * Decomposition endpoint.
 * Non-LLM: returns a candidate subtask list built from (a) matching SOPs in the KB
 * and (b) a set of built-in templates. The agent (OpenClaw) uses this as a
 * starting plan to present to the user, then calls create_task for each.
 */

type TemplateSubtask = {
  title: string;
  tags: string[];
  priority?: "low" | "medium" | "high" | "critical";
  suggested_skill?: string;
};

const BUILTIN_TEMPLATES: Record<string, TemplateSubtask[]> = {
  launch: [
    { title: "design mockups", tags: ["design"], suggested_skill: "design" },
    { title: "backend API", tags: ["backend"], suggested_skill: "backend" },
    { title: "frontend build", tags: ["frontend"], suggested_skill: "frontend" },
    { title: "QA smoke tests", tags: ["qa"], suggested_skill: "qa" },
    { title: "go-live checklist", tags: ["ops"], suggested_skill: "ops" },
    { title: "post-launch monitor", tags: ["ops"], suggested_skill: "ops" },
  ],
  deploy: [
    { title: "pre-deploy checks", tags: ["ops"], suggested_skill: "ops" },
    { title: "run migrations", tags: ["db"], suggested_skill: "backend" },
    { title: "deploy backend", tags: ["ops"], suggested_skill: "ops" },
    { title: "deploy frontend", tags: ["ops"], suggested_skill: "ops" },
    { title: "smoke tests", tags: ["qa"], suggested_skill: "qa" },
    { title: "monitor 1h", tags: ["ops"], suggested_skill: "ops" },
  ],
  migrate: [
    { title: "inventory current data", tags: ["planning"] },
    { title: "migration dry-run in staging", tags: ["db", "ops"] },
    { title: "backup + snapshot", tags: ["ops"] },
    { title: "run migration in prod", tags: ["db", "ops"] },
    { title: "verify + rollback plan ready", tags: ["ops"] },
  ],
  onboard: [
    { title: "accounts + access", tags: ["ops"] },
    { title: "intro to codebase", tags: ["docs"] },
    { title: "shadow team member (1wk)", tags: ["onboarding"] },
    { title: "first ticket", tags: ["onboarding"] },
    { title: "30-day check-in", tags: ["onboarding"] },
  ],
  feature: [
    { title: "spec + design", tags: ["design"] },
    { title: "backend implementation", tags: ["backend"] },
    { title: "frontend implementation", tags: ["frontend"] },
    { title: "tests", tags: ["qa"] },
    { title: "docs", tags: ["docs"] },
    { title: "rollout", tags: ["ops"] },
  ],
  bug: [
    { title: "reproduce", tags: ["bug"], priority: "high" },
    { title: "root-cause analysis", tags: ["bug"], priority: "high" },
    { title: "fix + unit test", tags: ["bug", "qa"], priority: "high" },
    { title: "deploy fix", tags: ["ops"], priority: "high" },
  ],
};

function detectTemplate(desc: string): TemplateSubtask[] | null {
  const d = desc.toLowerCase();
  if (/\b(launch|ship|rollout|release)\b/.test(d)) return BUILTIN_TEMPLATES.launch;
  if (/\b(deploy|deployment)\b/.test(d)) return BUILTIN_TEMPLATES.deploy;
  if (/\b(migrate|migration)\b/.test(d)) return BUILTIN_TEMPLATES.migrate;
  if (/\b(onboard|onboarding|new hire)\b/.test(d)) return BUILTIN_TEMPLATES.onboard;
  if (/\b(bug|fix|broken|crash)\b/.test(d)) return BUILTIN_TEMPLATES.bug;
  if (/\b(feature|build|implement|add)\b/.test(d)) return BUILTIN_TEMPLATES.feature;
  return null;
}

export const decomposeTask = asyncHandler(async (req: Request, res: Response) => {
  const { description, organizationId, projectId } = req.body as any;
  if (!description) throw HttpError.badRequest("description is required");
  if (!organizationId) throw HttpError.badRequest("organizationId is required");

  // 1. Check KB for matching SOPs.
  const sops = await KBRepo.searchFacts({
    organizationId,
    q: description,
    category: FactCategory.SOP,
    limit: 5,
  });

  // 2. Pick a builtin template as fallback.
  const template = detectTemplate(description);

  // 3. Compose parent title from first non-empty line.
  const parentTitle = description.split(/\n/)[0].slice(0, 120);

  const subtasks = (template || [
    { title: "scope + plan", tags: ["planning"] },
    { title: "build", tags: [] },
    { title: "test", tags: ["qa"] },
    { title: "ship", tags: ["ops"] },
  ]).map((s) => ({
    title: s.title,
    tags: s.tags,
    priority: s.priority || "medium",
    suggested_skill: s.suggested_skill,
  }));

  // 4. For each subtask, look up USER_SKILL facts for the suggested skill.
  for (const s of subtasks as any[]) {
    if (!s.suggested_skill) continue;
    const skillFacts = await KBRepo.searchFacts({
      organizationId,
      q: s.suggested_skill,
      category: FactCategory.USER_SKILL,
      limit: 1,
    });
    if (skillFacts.length && skillFacts[0].referenceId) {
      s.suggested_assignee_id = skillFacts[0].referenceId;
    }
  }

  ok(res, {
    parent: { title: parentTitle, projectId: projectId || null },
    subtasks,
    matched_sops: sops.map((f) => ({ id: f._id.toHexString(), content: f.content })),
    template_used: template ? Object.keys(BUILTIN_TEMPLATES).find((k) => BUILTIN_TEMPLATES[k] === template) : "generic",
  });
});
