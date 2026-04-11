"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddInColumn: () => void;
}

export function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onCardClick,
  onAddInColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-full md:w-[300px] shrink-0">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-2">
          {/* Vertical Colored line / dot */}
          <div className={cn("w-1 h-4 rounded-full", color)} />
          <h3 className="font-bold text-base tracking-wide uppercase text-foreground">{label}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <button className="p-1 hover:bg-muted rounded"><Plus className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-muted rounded"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>
      
      {/* Subheader info stats from screenshot: "3 Tasks Update 4 hours ago" */}
      <div className="flex items-center justify-between px-2 pb-3 text-xs text-muted-foreground border-b border-border/20 mb-3">
        <span>{tasks.length} Tasks</span>
        <span>Update 4 hours ago</span>
      </div>

      {/* Cards list container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 min-h-[300px] rounded-lg p-2 transition-colors",
          isOver ? "bg-muted/30" : "bg-transparent"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </SortableContext>
        
        {/* Add new button at the bottom of the list */}
        <button
          onClick={onAddInColumn}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium p-2"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>
    </div>
  );
}
