"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusBadge: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "bg-green-100 text-green-700",
  [ProjectStatus.ON_HOLD]: "bg-yellow-100 text-yellow-700",
  [ProjectStatus.COMPLETED]: "bg-blue-100 text-blue-700",
  [ProjectStatus.ARCHIVED]: "bg-slate-100 text-slate-600",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, fetchProjects } = useProjectStore();
  const [loaded, setLoaded] = useState(false);

  const projectId = params.id as string;
  const project = projects.find((p) => p._id === projectId);

  useEffect(() => {
    fetchProjects().then(() => setLoaded(true));
  }, [fetchProjects]);

  if (!loaded) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
        <p>Project not found</p>
        <Button variant="link" onClick={() => router.push("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <Badge variant="secondary" className={cn("text-xs", statusBadge[project.status])}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <KanbanBoard projectId={projectId} />
    </div>
  );
}
