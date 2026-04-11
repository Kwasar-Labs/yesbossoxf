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
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusGroups: { status: ProjectStatus; label: string }[] = [
  { status: ProjectStatus.ACTIVE, label: "Active" },
  { status: ProjectStatus.ON_HOLD, label: "On Hold" },
  { status: ProjectStatus.COMPLETED, label: "Completed" },
  { status: ProjectStatus.ARCHIVED, label: "Archived" },
];

const statusBadge: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "bg-green-100 text-green-700",
  [ProjectStatus.ON_HOLD]: "bg-yellow-100 text-yellow-700",
  [ProjectStatus.COMPLETED]: "bg-blue-100 text-blue-700",
  [ProjectStatus.ARCHIVED]: "bg-slate-100 text-slate-600",
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

  function getTaskCount(projectId: string) {
    return tasks.filter((t) => t.projectId === projectId).length;
  }

  function getDoneCount(projectId: string) {
    return tasks.filter((t) => t.projectId === projectId && t.status === TaskStatus.DONE).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        statusGroups.map((group) => {
          const groupProjects = projects.filter((p) => p.status === group.status);
          if (groupProjects.length === 0) return null;

          return (
            <div key={group.status}>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupProjects.map((project) => (
                  <Link key={project._id} href={`/projects/${project._id}`}>
                    <Card className="transition-shadow hover:shadow-md cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium text-sm">{project.name}</h4>
                          </div>
                          <Badge variant="secondary" className={cn("text-xs", statusBadge[project.status])}>
                            {group.label}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{getTaskCount(project._id)} tasks</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${Math.min(100, (getDoneCount(project._id) / Math.max(1, getTaskCount(project._id))) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}

      {projects.length === 0 && !isLoading && (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
          <FolderKanban className="mb-2 h-10 w-10" />
          <p>No projects yet. Create your first project!</p>
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
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
