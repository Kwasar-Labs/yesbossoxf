const fs = require('fs');
let code = fs.readFileSync('apps/web/src/components/kanban/kanban-board.tsx', 'utf8');

// Imports
code = code.replace('import { Input } from "@/components/ui/input";', 'import { Input } from "@/components/ui/input";\nimport { Priority } from "@/types";\nimport { useUserStore } from "@/stores/user-store";');

// State
let stateInsert = 
  const [newPriority, setNewPriority] = useState<Priority>(Priority.MEDIUM);
  const [newProjectId, setNewProjectId] = useState<string>('none');
  const [newAssigneeId, setNewAssigneeId] = useState<string>('none');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newFollowUpDate, setNewFollowUpDate] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');
  const [newRecurrence, setNewRecurrence] = useState<string>('');
  const { users } = useUserStore();

  useEffect(() => {
     if(createOpen) {
       setNewTitle(''); setNewDesc(''); setNewPriority(Priority.MEDIUM);
       setNewProjectId('none'); setNewAssigneeId('none');
       setNewDueDate(''); setNewFollowUpDate(''); setNewTags(''); setNewRecurrence('');
     }
  }, [createOpen]);
;
code = code.replace('const [newDesc, setNewDesc] = useState("");', 'const [newDesc, setNewDesc] = useState("");\n' + stateInsert);

// Handle Create
const handleInsert = 
      priority: newPriority,
      assigneeId: newAssigneeId !== 'none' ? newAssigneeId : undefined,
      dueDate: newDueDate || undefined,
      followUpDate: newFollowUpDate || undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      recurrenceRule: newRecurrence || undefined,
      projectId: filterProject !== "all" ? filterProject : (newProjectId !== 'none' ? newProjectId : undefined)
;
code = code.replace('projectId: filterProject !== "all" ? filterProject : undefined,', handleInsert);

// Dialog replacement
const dStart = code.indexOf('{/* Create task dialog */}');
const dEnd = code.indexOf('</DialogContent>') + '</DialogContent>'.length;
const newDialog = 
      {/* Create task dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#0e0e0e] border-[#484847]/20 text-[#adaaaa]">
          <DialogHeader>
            <DialogTitle className="text-white">New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Title</label>
                  <Input className="bg-[#1a1a1a] border-[#484847]/20" placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Description</label>
                  <Textarea className="bg-[#1a1a1a] border-[#484847]/20 min-h-[100px]" placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Priority</label>
                  <Select value={newPriority} onValueChange={(v: Priority) => setNewPriority(v)}>
                     <SelectTrigger className="bg-[#1a1a1a] border-[#484847]/20"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        {Object.values(Priority).map((p: any) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Project</label>
                  <Select value={newProjectId} onValueChange={setNewProjectId}>
                     <SelectTrigger className="bg-[#1a1a1a] border-[#484847]/20"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Assignee</label>
                  <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                     <SelectTrigger className="bg-[#1a1a1a] border-[#484847]/20"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map((u: any) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Due Date</label>
                  <Input type="datetime-local" className="bg-[#1a1a1a] border-[#484847]/20" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Follow-up Date</label>
                  <Input type="datetime-local" className="bg-[#1a1a1a] border-[#484847]/20" value={newFollowUpDate} onChange={(e) => setNewFollowUpDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Tags (comma separated)</label>
                  <Input className="bg-[#1a1a1a] border-[#484847]/20" placeholder="tag1, tag2" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Recurrence Rule</label>
                  <Input className="bg-[#1a1a1a] border-[#484847]/20" placeholder="e.g. FREQ=WEEKLY" value={newRecurrence} onChange={(e) => setNewRecurrence(e.target.value)} />
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-[#484847]/20">Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()} className="bg-gradient-to-b from-[#ba9eff] to-[#8455ef] text-[#39008c]">Create Task</Button>
          </DialogFooter>
        </DialogContent>
;

code = code.substring(0, dStart) + newDialog + code.substring(dEnd);
fs.writeFileSync('apps/web/src/components/kanban/kanban-board.tsx', code);
console.log('Kanban logic replaced');
