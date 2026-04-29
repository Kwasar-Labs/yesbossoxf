"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useTaskStore } from "@/stores/task-store";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Activity, Circle, Clock, AlertCircle } from "lucide-react";
import { ProjectStatus, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
const statusBadge: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  [ProjectStatus.ON_HOLD]:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [ProjectStatus.COMPLETED]: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  [ProjectStatus.ARCHIVED]:  "bg-muted text-muted-foreground",
};

export default function ProjectDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const { projects, fetchProjects }     = useProjectStore();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [loaded, setLoaded] = useState(false);

  const projectId = params.id as string;
  const project   = projects.find(p => p._id === projectId);

  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetchTasks({ projectId, limit: "200" }),
    ]).then(() => setLoaded(true));
  }, [fetchProjects, fetchTasks, projectId]);

  if (!loaded) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm">Project not found</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to projects
        </Button>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const total    = projectTasks.length;
  const todoCount   = projectTasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgCount = projectTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const inRevCount  = projectTasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
  const doneCount   = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
  const cancelCount = projectTasks.filter(t => t.status === TaskStatus.CANCELLED).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const stats = [
    { label: "Total",       value: total,      icon: Circle,       color: "text-muted-foreground", bg: "bg-muted" },
    { label: "To Do",       value: todoCount,   icon: Circle,       color: "text-neutral-500",      bg: "bg-neutral-100 dark:bg-neutral-800" },
    { label: "In Progress", value: inProgCount, icon: Activity,     color: "text-amber-600",        bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "In Review",   value: inRevCount,  icon: Clock,        color: "text-orange-600",       bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Done",        value: doneCount,   icon: CheckCircle2, color: "text-emerald-600",      bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Cancelled",   value: cancelCount, icon: AlertCircle,  color: "text-rose-500",         bg: "bg-rose-50 dark:bg-rose-900/20" },
  ];

  return (
    <div className="space-y-5 pb-10 w-full max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5 flex-shrink-0" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground tracking-tight">{project.name}</h2>
            <Badge variant="secondary" className={cn("text-[10px] font-semibold border-0", statusBadge[project.status])}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Demographics stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60">
            <CardContent className="p-3 text-center">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      {total > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Completion</span>
              <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{doneCount} of {total} tasks complete</p>
          </CardContent>
        </Card>
      )}

      {/* Kanban board */}
      <KanbanBoard projectId={projectId} />
    </div>
  );
}
