"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTaskStore } from "@/stores/task-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, LayoutGrid, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const KanbanBoard = dynamic(
  () => import("@/components/kanban/kanban-board").then((m) => m.KanbanBoard),
  { ssr: false, loading: () => <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> }
);

const TaskList = dynamic(
  () => import("@/components/tasks/task-list").then((m) => m.TaskList),
  { ssr: false, loading: () => <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> }
);

export default function TasksPage() {
  const { fetchTasks } = useTaskStore();
  const [activeTab, setActiveTab] = useState("board");

  useEffect(() => {
    fetchTasks({ limit: 100 }, false);
  }, [fetchTasks]);

  return (
    <div className="flex-col md:flex h-full py-4 text-neutral-100 max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1 md:mb-2 overflow-hidden text-ellipsis whitespace-nowrap truncate max-w-full">
            <span>Projects</span>
            <span className="text-neutral-700">›</span>
            <span className="text-purple-400 truncate">Metropolitan Phase II</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Workflow Kanban</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
           <Tabs value={activeTab} onValueChange={setActiveTab}>
             <TabsList className="bg-[#141416] border border-neutral-800 h-10 rounded-lg justify-start gap-1 p-1">
               <TabsTrigger value="board" className="gap-2 text-xs font-bold rounded-md h-8 px-4 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                 <LayoutGrid className="h-3.5 w-3.5" />
                 Board
               </TabsTrigger>
               <TabsTrigger value="list" className="gap-2 text-xs font-bold rounded-md h-8 px-4 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                 <LayoutList className="h-3.5 w-3.5" />
                 List
               </TabsTrigger>
             </TabsList>
           </Tabs>
           <Button variant="outline" className="h-10 bg-[#141416] border-neutral-800 text-xs font-bold hover:bg-neutral-800 hover:text-white rounded-lg px-4 flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              Filters
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-8">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="list" className="border-0 p-0 m-0 h-full overflow-y-auto">
            <TaskList />
          </TabsContent>
          <TabsContent value="board" className="border-0 p-0 m-0 h-full overflow-y-auto">
            <KanbanBoard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
