"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
// Duplicate removed
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Priority, TaskStatus, type Task } from "@/types";
import { useUserStore } from "@/stores/user-store";
import { Textarea } from "@/components/ui/textarea";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.TODO, label: "To Do", color: "bg-[#22c55e]" },
  { status: TaskStatus.IN_PROGRESS, label: "In Progress", color: "bg-[#f97316]" },
  { status: TaskStatus.IN_REVIEW, label: "In Review", color: "bg-[#f97316]" },
  { status: TaskStatus.DONE, label: "Done", color: "bg-[#ef4444]" },
];

interface KanbanBoardProps {
  projectId?: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, fetchTasks, updateTaskStatus, createTask, isLoading } = useTaskStore();
  const { projects } = useProjectStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterProject, setFilterProject] = useState<string>(projectId ?? "all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>(Priority.MEDIUM);
  const [newProjectId, setNewProjectId] = useState<string>('none');
  const [newAssigneeId, setNewAssigneeId] = useState<string>('none');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newFollowUpDate, setNewFollowUpDate] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');
  const [newRecurrence, setNewRecurrence] = useState<string>('');
  
  const { users, fetchUsers } = useUserStore();

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  
  useEffect(() => {
     if(createOpen) {
       setNewTitle(''); 
       setNewDesc(''); 
       setNewPriority(Priority.MEDIUM);
       setNewProjectId('none'); 
       setNewAssigneeId('none');
       setNewDueDate(''); 
       setNewFollowUpDate(''); 
       setNewTags(''); 
       setNewRecurrence('');
     }
  }, [createOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const filters: Record<string, string> = { limit: "200" };
    if (filterProject && filterProject !== "all") {
      filters.projectId = filterProject;
    }
    fetchTasks(filters);
  }, [fetchTasks, filterProject]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      await updateTaskStatus(taskId, newStatus);
    }
  }, [tasks, updateTaskStatus]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority: newPriority,
      assigneeId: newAssigneeId !== 'none' ? newAssigneeId : undefined,
      dueDate: newDueDate || undefined,
      followUpDate: newFollowUpDate || undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      recurrenceRule: newRecurrence || undefined,
      projectId: filterProject !== "all" ? filterProject : (newProjectId !== 'none' ? newProjectId : undefined),
    });
    setNewTitle("");
    setNewDesc("");
    setCreateOpen(false);
  }

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={filterProject} onValueChange={(v) => v && setFilterProject(v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
            {columns.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                color={col.color}
                tasks={tasks.filter((t) => t.status === col.status)}
                onCardClick={(task) => setSelectedTask(task)}
                onAddInColumn={() => setCreateOpen(true)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <KanbanCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task detail drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
        />
      )}

      {/* Create task dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col pt-6">
          <DialogTitle>New Task</DialogTitle>
          <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
                  <Textarea className="min-h-[90px]" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Priority</label>
                  <Select value={newPriority} onValueChange={(v) => v && setNewPriority(v as Priority)}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                        {Object.values(Priority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Project</label>
                  <Select value={newProjectId} onValueChange={(v) => v && setNewProjectId(v)}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Assignee</label>
                  <Select value={newAssigneeId} onValueChange={(v) => v && setNewAssigneeId(v)}>
                     <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map(u => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Due Date</label>
                  <Input type="datetime-local" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Follow-up Date</label>
                  <Input type="datetime-local" value={newFollowUpDate} onChange={(e) => setNewFollowUpDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tags (comma separated)</label>
                  <Input placeholder="tag1, tag2" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recurrence Rule</label>
                  <Input placeholder="e.g. FREQ=WEEKLY" value={newRecurrence} onChange={(e) => setNewRecurrence(e.target.value)} />
                </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
