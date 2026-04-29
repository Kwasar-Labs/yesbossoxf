"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityStyles: Record<string, { bar: string; label: string }> = {
  low:      { bar: "bg-emerald-500", label: "text-emerald-600 dark:text-emerald-400" },
  medium:   { bar: "bg-amber-500",   label: "text-amber-600 dark:text-amber-400" },
  high:     { bar: "bg-orange-500",  label: "text-orange-600 dark:text-orange-400" },
  critical: { bar: "bg-rose-500",    label: "text-rose-600 dark:text-rose-400" },
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const { users } = useUserStore();

  const style = { transform: CSS.Transform.toString(transform), transition };
  const priority = priorityStyles[task.priority] ?? priorityStyles.medium;
  const assignee = task.assigneeId ? users.find(u => u._id === task.assigneeId) : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab overflow-hidden border-border/50 transition-all hover:shadow-md hover:border-border active:cursor-grabbing bg-card rounded-xl select-none",
        isDragging && "opacity-40 shadow-xl ring-2 ring-primary/30"
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Priority bar */}
      <div className={cn("w-full h-0.5", priority.bar)} />

      <div className="p-3 space-y-2.5">
        {/* Priority label */}
        <div className="flex items-center justify-between">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", priority.label)}>
            {task.priority} priority
          </span>
          {task.tags && task.tags.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              {task.tags[0]}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-snug text-foreground">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Assignee + due date */}
        <div className="flex items-center justify-between pt-0.5">
          {assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0">
                {assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground">{assignee.name.split(" ")[0]}</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">Unassigned</span>
          )}

          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
