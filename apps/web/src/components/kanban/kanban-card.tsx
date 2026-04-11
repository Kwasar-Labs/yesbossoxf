"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Calendar, User, Eye, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-[#22c55e] text-black';
    case 'medium': return 'bg-[#f97316] text-black';
    case 'high': return 'bg-[#ef4444] text-white';
    case 'critical': return 'bg-[#dc2626] text-white';
    default: return 'bg-blue-500 text-white';
  }
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab overflow-hidden border-border/40 transition-shadow hover:shadow-md active:cursor-grabbing bg-card rounded-xl",
        isDragging && "opacity-50 shadow-lg"
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Top Priority Banner */}
      <div className={cn("w-full text-center text-[10px] font-bold py-1 uppercase", priorityColor)}>
        {task.priority || "Standard"} Priority
      </div>
      
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight text-foreground">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {/* Fake Assignee Avatars matching screenshot */}
            <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-card flex items-center justify-center text-[10px] object-cover">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="px-2 py-0.5 rounded text-[10px] bg-muted/50 border border-border/50 text-muted-foreground">
            {task.status.replace('_', ' ')}
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 8</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 4</span>
            <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> 12</span>
          </div>
          {task.dueDate && (
            <span>
              {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
