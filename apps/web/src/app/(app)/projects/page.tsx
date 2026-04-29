"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useTaskStore } from "@/stores/task-store";
import { ProjectStatus, TaskStatus, type Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderKanban, CheckCircle2, Activity, Circle, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusGroups: { status: ProjectStatus; label: string }[] = [
  { status: ProjectStatus.ACTIVE, label: "Active" },
  { status: ProjectStatus.ON_HOLD, label: "On Hold" },
  { status: ProjectStatus.COMPLETED, label: "Completed" },
  { status: ProjectStatus.ARCHIVED, label: "Archived" },
];

const statusBadge: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  [ProjectStatus.ON_HOLD]:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [ProjectStatus.COMPLETED]: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  [ProjectStatus.ARCHIVED]:  "bg-muted text-muted-foreground",
};

const statusDot: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]:    "bg-emerald-500",
  [ProjectStatus.ON_HOLD]:   "bg-amber-500",
  [ProjectStatus.COMPLETED]: "bg-teal-500",
  [ProjectStatus.ARCHIVED]:  "bg-muted-foreground",
};

export default function ProjectsPage() {
  const { projects, fetchProjects, createProject, isLoading } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchTasks({ limit: "200" });
  }, [fetchProjects, fetchTasks]);

  async function handleCreate() {
    if (!newName.trim()) return;
    await createProject({ name: newName.trim(), description: newDesc.trim() || undefined });
    setNewName("");
    setNewDesc("");
    setCreateOpen(false);
  }

  function getProjectTasks(projectId: string) {
    return tasks.filter(t => t.projectId === projectId);
  }

  return (
    <div className="space-y-8 pb-10 w-full max-w-6xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        statusGroups.map((group) => {
          const groupProjects = projects.filter(p => p.status === group.status);
          if (groupProjects.length === 0) return null;

          return (
            <div key={group.status}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-2 h-2 rounded-full", statusDot[group.status])} />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h3>
                <span className="text-xs text-muted-foreground">({groupProjects.length})</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupProjects.map((project) => {
                  const ptasks = getProjectTasks(project._id);
                  const total = ptasks.length;
                  const done  = ptasks.filter(t => t.status === TaskStatus.DONE).length;
                  const inProg = ptasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
                  const inRev  = ptasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
                  const todo   = ptasks.filter(t => t.status === TaskStatus.TODO).length;
                  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <Link key={project._id} href={`/projects/${project._id}`}>
                      <Card className="transition-all hover:shadow-md hover:border-border cursor-pointer h-full border-border/60">
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FolderKanban className="h-4 w-4 text-primary" />
                              </div>
                              <h4 className="font-semibold text-sm text-foreground truncate">{project.name}</h4>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn("text-[10px] flex-shrink-0 ml-2 font-semibold border-0", statusBadge[project.status])}
                            >
                              {group.label}
                            </Badge>
                          </div>

                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                              {project.description}
                            </p>
                          )}

                          {/* Task stats */}
                          {total > 0 && (
                            <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Circle className="h-3 w-3 text-neutral-400" />
                                {todo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-amber-500" />
                                {inProg}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-orange-500" />
                                {inRev}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                {done}
                              </span>
                              <span className="ml-auto text-[10px] font-semibold">{total} tasks</span>
                            </div>
                          )}

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Progress</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {projects.length === 0 && !isLoading && (
        <div className="flex h-52 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <FolderKanban className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Create your first project to get started</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
