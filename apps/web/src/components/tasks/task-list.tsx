"use client";

import { useTaskStore } from "@/stores/task-store";
import { TaskStatus, Priority, Task } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar, Flag, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TaskDetailDrawer } from "@/components/kanban/task-detail-drawer";

const statusIcons: Record<string, React.ElementType> = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.IN_REVIEW]: AlertCircle,
  [TaskStatus.DONE]: CheckCircle2,
  [TaskStatus.CANCELLED]: AlertCircle,
};

const priorityColors: Record<Priority, string> = {
  [Priority.CRITICAL]: "text-red-500",
  [Priority.HIGH]: "text-orange-500",
  [Priority.MEDIUM]: "text-blue-500",
  [Priority.LOW]: "text-slate-400",
};

export function TaskList() {
  const { tasks, isLoading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Group tasks by status
  const groups = [
    { status: TaskStatus.TODO, label: "To Do" },
    { status: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { status: TaskStatus.IN_REVIEW, label: "In Review" },
    { status: TaskStatus.DONE, label: "Completed" },
  ];

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.status);
        if (groupTasks.length === 0) return null;
        
        return (
          <div key={group.status} className="rounded-lg border bg-card overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
              <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
                {group.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-transparent hover:bg-transparent">
                  <TableRow className="border-none">
                    <TableHead className="w-[400px]">Task Name</TableHead>
                    <TableHead className="w-[150px]">Assignee</TableHead>
                    <TableHead className="w-[150px]">Due Date</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[200px]">Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {groupTasks.map((task) => {
                  const StatusIcon = statusIcons[task.status] ?? Circle;
                  return (
                    <TableRow 
                      key={task._id} 
                      className="group hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span>{task.title}</span>
                          {task.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] ml-2">
                              - {task.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.assigneeId ? (
                          <Badge variant="outline" className="gap-1 rounded-full"><UserIcon className="w-3 h-3"/> Assigned</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                            <Flag className={cn("h-3.5 w-3.5", priorityColors[task.priority])} />
                            <span className="text-xs capitalize">{task.priority.toLowerCase()}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>
            </div>
          </div>
        );
      })}

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
