"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/types";
import { TaskStatus, Priority, type TaskUpdateInput } from "@/types";
import { useTaskStore } from "@/stores/task-store";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore } from "@/stores/project-store";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { 
  Trash2, Save, ChevronRight, Edit3, AlertTriangle, Calendar, FileText,
  History, UserPlus, Smile, Paperclip, CheckCircle2, MessageSquare, ArrowRightLeft, File, Zap
} from "lucide-react";
import { toast } from "sonner";

interface TaskDetailDrawerProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateForInput(date?: Date | string | null): string {
  if (!date) return "";
  try {
    return new Date(date).toISOString().slice(0, 16);
  } catch (e) {
    return "";
  }
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const { projects, fetchProjects } = useProjectStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [projectId, setProjectId] = useState<string>(task.projectId || "none");
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId || "none");
  const [dueDate, setDueDate] = useState<string>(formatDateForInput(task.dueDate));
  const [followUpDate, setFollowUpDate] = useState<string>(formatDateForInput(task.followUpDate));
  const [tags, setTags] = useState<string>((task.tags || []).join(", "));
  const [recurrenceRule, setRecurrenceRule] = useState<string>(task.recurrenceRule || "");
  const [subtasks, setSubtasks] = useState<any[]>(task.subtasks || []);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers(true);
    fetchProjects();
  }, [fetchUsers, fetchProjects]);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setProjectId(task.projectId || "none");
      setAssigneeId(task.assigneeId || "none");
      setDueDate(formatDateForInput(task.dueDate));
      setFollowUpDate(formatDateForInput(task.followUpDate));
      setTags((task.tags || []).join(", "));
      setRecurrenceRule(task.recurrenceRule || "");
      setSubtasks(task.subtasks || []);
    }
  }, [task, open]);

  async function handleGenerateSubtasks() {
    setGeneratingSubtasks(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("yesboss_token") : "";
      const res = await fetch('/api/ai/generate-subtasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ title, description })
      });
      if (res.ok) {
        const data = await res.json();
        const newSubtasks = [...subtasks, ...(data.subtasks || [])];
        setSubtasks(newSubtasks);
        await updateTask(task._id, { subtasks: newSubtasks });
        toast.success('Generated subtasks using AI');
      } else {
        toast.error('Failed to generate subtasks');
      }
    } catch {
      toast.error('Error connecting to AI');
    } finally {
      setGeneratingSubtasks(false);
    }
  }

  async function toggleSubtask(id: string) {
    const newSubtasks = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    setSubtasks(newSubtasks);
    await updateTask(task._id, { subtasks: newSubtasks });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const input: TaskUpdateInput = {};
      if (title !== task.title) input.title = title;
      if (description !== (task.description ?? "")) input.description = description;
      if (priority !== task.priority) input.priority = priority;

      const newProjectId = projectId === "none" ? undefined : projectId;
      if (newProjectId !== task.projectId) input.projectId = newProjectId;

      const newAssigneeId = assigneeId === "none" ? undefined : assigneeId;
      if (newAssigneeId !== task.assigneeId) input.assigneeId = newAssigneeId;

      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      input.tags = parsedTags;

      if (dueDate) input.dueDate = new Date(dueDate).toISOString();
      if (followUpDate) input.followUpDate = new Date(followUpDate).toISOString();
      if (recurrenceRule !== (task.recurrenceRule || "")) input.recurrenceRule = recurrenceRule;

      if (status !== task.status) {
        await updateTask(task._id, input);
        await useTaskStore.getState().updateTaskStatus(task._id, status);
      } else {
        await updateTask(task._id, input);
      }
      toast.success("Task updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task._id);
      onOpenChange(false);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  const activeProject = projects.find(p => p._id === projectId);
  const assigneeUser = users.find(u => u._id === assigneeId);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="!max-w-none !w-[95vw] lg:!w-[1200px] p-0 border-neutral-800 bg-[#0e0e0e] text-[#ffffff] overflow-hidden flex flex-col lg:flex-row h-full font-sans">
          
          {/* Left Side: Task Content */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto border-r border-[#484847]/10 flex flex-col">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8">
              <span className="text-xs text-[#adaaaa] font-medium">{activeProject?.name || "Workspace"}</span>
              <ChevronRight size={16} className="text-[#adaaaa]" />
              <span className="text-xs text-[#ba9eff] font-semibold">{task._id.substring(0, 8)}</span>
            </nav>
            
            {/* Title & Actions */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#ffffff] w-full bg-transparent border-0 border-b-2 border-transparent hover:border-[#484847]/30 focus:border-[#ba9eff] focus:outline-none transition-colors pb-1"
                placeholder="Task Title"
              />
              <div className="flex gap-2 shrink-0 pt-1">
                <button onClick={handleSave} disabled={saving} className="bg-[#1a1a1a] p-2.5 rounded-lg text-[#adaaaa] hover:text-[#ba9eff] hover:bg-[#ba9eff]/10 transition-colors flex items-center justify-center border border-[#484847]/10 hover:border-[#ba9eff]/30 shadow-sm">
                  <Save size={20} />
                </button>
                <button onClick={() => setConfirmDelete(true)} className="bg-[#1a1a1a] p-2.5 rounded-lg text-[#adaaaa] hover:text-[#ff716c] hover:bg-[#ff716c]/10 transition-colors flex items-center justify-center border border-[#484847]/10 hover:border-[#ff716c]/30 shadow-sm">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            {/* Pills Row */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-col gap-1 min-w-[140px] border border-[#484847]/10 hover:border-[#ba9eff]/30 transition-colors">
                <span className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold">Status</span>
                <div className="flex items-center gap-2">
                   <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                      <SelectTrigger className="p-0 h-auto border-0 bg-transparent text-sm font-semibold focus:ring-0 shadow-none text-[#ffffff] w-full gap-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#484847]/30 text-white">
                        <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                        <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-col gap-1 min-w-[140px] border border-[#484847]/10 hover:border-[#ba9eff]/30 transition-colors">
                <span className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold">Priority</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#ff716c]" />
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                      <SelectTrigger className="p-0 h-auto border-0 bg-transparent text-sm font-semibold focus:ring-0 shadow-none text-[#ffffff] w-full gap-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#484847]/30 text-white">
                        <SelectItem value={Priority.LOW}>Low</SelectItem>
                        <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={Priority.HIGH}>High</SelectItem>
                        <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-col gap-1 min-w-[150px] border border-[#484847]/10 focus-within:border-[#ba9eff]/30 transition-colors">
                <span className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold">Due Date</span>
                <div className="flex items-center gap-2 text-[#ffffff]">
                  <Calendar size={18} className="text-[#adaaaa]" />
                  <input 
                     type="datetime-local" 
                     value={dueDate} 
                     onChange={e => setDueDate(e.target.value)} 
                     className="bg-transparent border-0 p-0 text-sm font-semibold focus:outline-none focus:ring-0 w-full"
                     style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border-t-4 border-[#ba9eff]/50 relative">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="text-[#ba9eff] w-5 h-5" /> Description
              </h3>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a detailed description..."
                className="w-full bg-transparent text-[#adaaaa] leading-relaxed text-sm min-h-[120px] resize-none focus:outline-none hover:text-[#ffffff] focus:text-[#ffffff] transition-colors border border-transparent focus:border-[#484847]/30 rounded-lg p-2 -ml-2"
              />
            </div>
            
            {/* Subtasks Box */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-[#484847]/20 relative">
              <div className="flex items-center justify-between xl:justify-start gap-4 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <CheckCircle2 className="text-[#38bdf8] w-5 h-5" /> Subtasks
                </h3>
                <button 
                  onClick={handleGenerateSubtasks}
                  disabled={generatingSubtasks}
                  className="flex flex-1 xl:flex-none items-center justify-center gap-2 bg-gradient-to-r from-[#ba9eff]/10 to-[#8455ef]/10 text-[#ba9eff] font-medium text-xs px-3 py-1.5 rounded-lg border border-[#ba9eff]/30 hover:bg-[#ba9eff]/20 transition-all disabled:opacity-50"
                >
                  <Zap className="w-3 h-3" />
                  {generatingSubtasks ? "Generating..." : "AI Generate"}
                </button>
              </div>
              
              {subtasks && subtasks.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {subtasks.map((st, i) => (
                    <div key={st.id || i} className="flex items-start gap-3 bg-[#0e0e0e] p-3 rounded-lg border border-[#484847]/20 group">
                       <div 
                         onClick={() => toggleSubtask(st.id)}
                         className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center cursor-pointer border transition-colors shrink-0 ${st.completed ? 'bg-[#38bdf8] border-[#38bdf8]' : 'border-[#484847]/50 hover:border-[#ba9eff]'}`}
                       >
                          {st.completed && <CheckCircle2 className="w-3 h-3 text-[#1a1a1a]" />}
                       </div>
                       <span className={`text-sm ${st.completed ? 'text-[#adaaaa] line-through' : 'text-white'}`}>
                         {st.title}
                       </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#adaaaa] text-sm italic">
                  No subtasks yet. Let AI break down this task for you.
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Assignee & Meta Box */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#484847]/10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#adaaaa] mb-4">Assignment</h3>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#262626]/40 mb-4 border border-transparent hover:border-[#484847]/30 transition-colors group">
                   <div className="flex items-center gap-3">
                      {assigneeUser ? (
                         <div className="w-10 h-10 rounded-lg bg-[#ba9eff] flex items-center justify-center text-[#1a1a1a] font-bold text-sm uppercase shadow-md shadow-[#ba9eff]/10">
                           {assigneeUser.name.substring(0, 2)}
                         </div>
                      ) : (
                         <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center border border-dashed border-[#484847]">
                           <UserPlus size={16} className="text-[#adaaaa]" />
                         </div>
                      )}
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#ffffff]">{assigneeUser ? assigneeUser.name : "Unassigned"}</p>
                        <p className="text-[10px] text-[#adaaaa] font-medium tracking-wide">OWNER</p>
                      </div>
                   </div>
                   <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                      <SelectTrigger className="w-8 h-8 p-0 border-0 bg-[#0e0e0e] shadow-sm flex items-center justify-center hover:bg-[#ba9eff]/20 hover:text-[#ba9eff] rounded-full transition-colors text-[#adaaaa] opacity-0 group-hover:opacity-100">
                         <Edit3 size={14} />
                         <span className="sr-only">Edit Assignee</span>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#484847]/30 text-white">
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs border border-[#484847]/10 focus-within:border-[#ba9eff]/30 p-2.5 rounded-lg bg-[#0e0e0e]/50 hover:bg-[#0e0e0e] transition-colors">
                     <span className="text-[#adaaaa] font-medium w-16">Project:</span>
                     <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                        <SelectTrigger className="p-0 h-auto border-0 bg-transparent text-xs font-bold focus:ring-0 shadow-none text-[#ba9eff] w-full justify-start gap-2">
                          <SelectValue placeholder="No Project" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#484847]/30 text-white">
                          <SelectItem value="none">No Project</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                   </div>
                </div>
              </div>
              
              {/* Planning Box */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#484847]/10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#adaaaa] mb-4">Planning & Tags</h3>
                <div className="flex flex-col gap-3">
                   <div className="flex flex-col gap-1.5 border border-[#484847]/10 focus-within:border-[#ba9eff]/30 p-2.5 rounded-lg bg-[#0e0e0e]/50 hover:bg-[#0e0e0e] transition-colors">
                     <label className="text-[10px] text-[#adaaaa] font-bold tracking-wider">Follow Up</label>
                     <input 
                       type="datetime-local" 
                       value={followUpDate} 
                       onChange={e => setFollowUpDate(e.target.value)} 
                       className="bg-transparent border-0 p-0 text-[13px] font-medium focus:outline-none focus:ring-0 w-full text-white"
                       style={{ colorScheme: 'dark' }}
                     />
                   </div>
                   
                   <div className="flex flex-col gap-1.5 border border-[#484847]/10 focus-within:border-[#ba9eff]/30 p-2.5 rounded-lg bg-[#0e0e0e]/50 hover:bg-[#0e0e0e] transition-colors">
                     <label className="text-[10px] text-[#adaaaa] font-bold tracking-wider">Tags (comma sep)</label>
                     <input 
                       type="text" 
                       value={tags} 
                       onChange={e => setTags(e.target.value)} 
                       placeholder="frontend, urgent..."
                       className="bg-transparent border-0 p-0 text-[13px] font-medium focus:outline-none focus:ring-0 w-full text-[#62fae3]"
                     />
                   </div>

                   <div className="flex flex-col gap-1.5 border border-[#484847]/10 focus-within:border-[#ba9eff]/30 p-2.5 rounded-lg bg-[#0e0e0e]/50 hover:bg-[#0e0e0e] transition-colors">
                     <label className="text-[10px] text-[#adaaaa] font-bold tracking-wider">Recurrence (Cron)</label>
                     <input 
                       type="text" 
                       value={recurrenceRule} 
                       onChange={e => setRecurrenceRule(e.target.value)} 
                       placeholder="Optional cron string..."
                       className="bg-transparent border-0 p-0 text-[13px] font-medium focus:outline-none focus:ring-0 w-full text-white"
                     />
                   </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Right Sidebar: Activity */}
          <aside className="w-full lg:w-96 bg-[#131313] flex flex-col h-full border-l border-[#484847]/10">
            <div className="p-6 border-b border-[#484847]/10 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#adaaaa] flex items-center gap-2">
                <History className="text-[#ba9eff]" size={18} />
                Task Activity
              </h2>
              <span className="bg-[#1a1a1a] px-2 py-1 rounded text-[10px] font-bold text-[#adaaaa]">2 UPDATES</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Timeline Items */}
              <div className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-[-20px] before:w-[2px] before:bg-[#484847]/20">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#484847]/30 z-10">
                   <Edit3 size={12} className="text-[#ff8439]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-[#adaaaa] leading-tight">
                    <span className="font-bold text-[#ffffff]">System</span> saved current state
                  </p>
                  <span className="text-[10px] text-[#adaaaa] font-medium">{new Date(task.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#484847]/30 z-10">
                   <UserPlus size={12} className="text-[#ba9eff]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-[#adaaaa] leading-tight">
                    <span className="font-bold text-[#ffffff]">System</span> created task
                  </p>
                  <span className="text-[10px] text-[#adaaaa] font-medium">{new Date(task.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="p-6 bg-[#1a1a1a] border-t border-[#484847]/10">
               <div className="relative">
                  <textarea 
                     disabled
                     className="w-full bg-[#0e0e0e] border border-[#484847]/20 rounded-xl p-4 text-xs focus:outline-none focus:border-[#ba9eff]/50 min-h-[100px] resize-none pr-12 text-[#adaaaa]" 
                     placeholder="Write a comment or tag someone with @..."
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50">
                     <Paperclip size={18} className="text-[#adaaaa] hover:text-[#ba9eff] transition-colors cursor-not-allowed" />
                     <Smile size={18} className="text-[#adaaaa] hover:text-[#ba9eff] transition-colors cursor-not-allowed" />
                  </div>
               </div>
               <div className="mt-4 flex justify-end gap-3 opacity-50">
                  <button disabled className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] px-4 py-2 hover:bg-[#2c2c2c] rounded-lg transition-colors cursor-not-allowed">Discard</button>
                  <button disabled className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-b from-[#ba9eff] to-[#8455ef] text-[#39008c] px-6 py-2 rounded-lg shadow-lg shadow-[#ba9eff]/20 active:scale-95 transition-transform cursor-not-allowed">Post Comment</button>
               </div>
            </div>
          </aside>

        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}