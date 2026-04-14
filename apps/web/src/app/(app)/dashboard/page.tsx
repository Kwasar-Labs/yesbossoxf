"use client";

import { useState, useEffect, useMemo } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { TaskStatus } from "@/types";
import { TaskSummaryChart } from "@/components/dashboard/task-summary-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Activity, Battery, ChevronRight, BarChart3, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchTasks({ limit: 100 }, false);
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const inReviewCount = tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length;
  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const totalTasks = tasks.length;
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    async function loadInsights() {
      setInsightsLoading(true);
      try {
        const token = localStorage.getItem("yesboss_token");
        if (!token) return;
        const res = await fetch("http://localhost:3000/api/chat/insights", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (data && data.data && data.data.insights) {
          setInsights(data.data.insights);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          console.error("Failed to load insights", e);
        }
      } finally {
        clearTimeout(timeoutId);
        setInsightsLoading(false);
      }
    }
    loadInsights();
    return () => controller.abort();
  }, []);
  
  const velocity = totalTasks > 0 ? ((doneCount / totalTasks) * 100).toFixed(1) : "0.0";
  const efficiency = totalTasks > 0 ? Math.round((doneCount + inProgressCount) / totalTasks * 100) : 0;
  const upcomingDeadlines = tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueTime = new Date(t.dueDate).getTime();
    return dueTime > Date.now() && dueTime < Date.now() + 48 * 3600 * 1000;
  }).length;

  const recentActivity = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t._id,
        taskTitle: t.title,
        status: t.status,
        updatedAt: t.updatedAt as unknown as string,
      }));
  }, [tasks]);

  return (
    <div className="space-y-6 pt-4 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-neutral-100">

      {/* Header */}
      <div className="flex flex-col gap-1 mt-4 md:mt-0 mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Architect Pro Dashboard</h1>
        <p className="text-sm font-medium text-neutral-400">Performance overview for Q3 Project Lifecycle</p>
      </div>

      {/* Top 3-Col Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Intelligence Panel */}
        <Card className="col-span-2 border-neutral-800 bg-neutral-950/40 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-600 via-pink-400 to-transparent opacity-80" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-indigo-900/40 text-indigo-400 text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest border-0">SYSTEM INTELLIGENCE</Badge>
              <BarChart3 className="h-4 w-4 ml-auto text-neutral-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 mt-4 relative z-10">
            <div className="space-y-3">
              <div className="rounded-lg bg-[#141416]/80 p-4 border border-[#232325]">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Task Progress</h4>
                  <p className="text-sm text-neutral-200 leading-snug">
                    {Number(velocity) > 0 ? `AI Context Analysis: The ecosystem is ready. You have cleared ${doneCount} of ${totalTasks} operations, achieving a structural completion rate of ${velocity}%.` : `AI Context Analysis: Initializing workflow parameters. Waiting for deployment on ${totalTasks} pending operations.`}
                </p>
              </div>
              <div className="rounded-lg bg-[#141416]/80 p-4 border border-[#232325]">
                  <h4 className="text-[10px] font-bold tracking-wider text-teal-400 uppercase mb-2">Live Operations Insight</h4>
                  <div className="text-sm text-neutral-200 leading-snug space-y-2">
                    {insightsLoading ? (
                      <span className="animate-pulse">Analyzing system state...</span>
                    ) : insights.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-neutral-300">
                        {insights.map((insight, i) => (
                          <li key={i} className="mb-1">{insight}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{inProgressCount > 0 ? `System tracks ${inProgressCount} active operations in execution phase.` : `Standby mode active. No immediate operations detected.`}</span>
                    )}
                  </div>
              </div>
            </div>
            <div className="rounded-lg bg-[#141416]/80 border border-[#232325] flex flex-col justify-end p-4 relative overflow-hidden items-start min-h-[140px]">
               <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none"></div>
               {/* Decorative dots grid */}
               <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
               <div className="relative z-10 flex flex-col gap-1 w-full mt-auto bg-black/40 p-2 rounded backdrop-blur-sm">
                 <Link href="/tasks" className="flex justify-between items-center w-full hover:bg-white/5 py-0.5 px-1 rounded transition-colors cursor-pointer group">
                   <span className="text-[10px] font-mono text-neutral-400 tracking-wider group-hover:text-white transition-colors">PENDING:</span>
                   <span className="text-[10px] font-mono text-neutral-300 font-bold group-hover:text-white transition-colors">{tasks.filter((t) => t.status === TaskStatus.TODO).length} TASKS</span>
                 </Link>
                 <Link href="/tasks" className="flex justify-between items-center w-full hover:bg-white/5 py-0.5 px-1 rounded transition-colors cursor-pointer group">
                   <span className="text-[10px] font-mono text-neutral-400 tracking-wider group-hover:text-amber-400 transition-colors">IN PROGRESS:</span>
                   <span className="text-[10px] font-mono text-amber-500 font-bold group-hover:text-amber-400 transition-colors">{inProgressCount} TASKS</span>
                 </Link>
                 <Link href="/tasks" className="flex justify-between items-center w-full hover:bg-white/5 py-0.5 px-1 rounded transition-colors cursor-pointer group">
                   <span className="text-[10px] font-mono text-neutral-400 tracking-wider group-hover:text-purple-400 transition-colors">IN REVIEW:</span>
                   <span className="text-[10px] font-mono text-purple-500 font-bold group-hover:text-purple-400 transition-colors">{inReviewCount} TASKS</span>
                 </Link>
                 <Link href="/tasks" className="flex justify-between items-center w-full hover:bg-white/5 py-0.5 px-1 rounded transition-colors cursor-pointer group">
                   <span className="text-[10px] font-mono text-neutral-400 tracking-wider group-hover:text-teal-400 transition-colors">COMPLETED:</span>
                   <span className="text-[10px] font-mono text-teal-500 font-bold group-hover:text-teal-400 transition-colors">{doneCount} TASKS</span>
                 </Link>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion % & Status Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="flex-1 bg-[#1c1c1e] border-neutral-800">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-900/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-400" />
               </div>
               <span className="text-[10px] tracking-widest text-neutral-400 font-bold uppercase">Task Completion %</span>
               <Activity className="h-10 w-10 text-neutral-800 ml-auto opacity-30" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold tracking-tighter">{velocity}</span>
                <span className="text-sm font-semibold text-emerald-400">%</span>
              </div>
              <p className="text-xs font-medium text-neutral-500">System throughput</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold tracking-tighter">{inProgressCount}</span>
                <span className="text-sm font-medium text-neutral-500">/ {totalTasks === 0 ? 100 : totalTasks}</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
        {/* Chart Card */}
        <Card className="bg-[#1c1c1e] border-neutral-800 min-h-[300px] lg:min-h-[400px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-800/50 pb-4">
             <div className="flex flex-col">
               <CardTitle className="text-base font-bold">Task Distribution</CardTitle>
               <span className="text-xs text-neutral-500 font-medium">Allocated effort by department</span>
             </div>
             <div className="flex bg-[#141416] p-1 rounded-md">
               <button className="px-3 py-1 text-[10px] font-bold rounded bg-neutral-800 text-white uppercase">Weekly</button>
               <button className="px-3 py-1 text-[10px] font-bold rounded text-neutral-500 uppercase hover:text-white transition-colors">Monthly</button>
             </div>
          </CardHeader>
          <CardContent className="flex-1 p-6 relative flex flex-col justify-end">
            {tasksLoading ? (
               <div className="flex h-full items-center justify-center">
                 <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
               </div>
            ) : (
                <div className="flex-1 w-full relative">
                   <TaskSummaryChart tasks={tasks} />
                </div>
            )}
            <div className="flex justify-between mt-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest h-6 px-4">
              <span>TODO</span>
              <span>PROG</span>
              <span>REV</span>
              <span>DONE</span>
              <span className="opacity-0 w-0 md:opacity-100 md:w-auto">CANCEL</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-[#1c1c1e] border-neutral-800 relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] overflow-hidden">
             <ActivityFeed items={recentActivity} />
          </CardContent>
          {/* Floating Action Button inside Activity Panel */}
          <Link href="/tasks" className="absolute bottom-4 right-4 z-20 shadow-lg shadow-purple-900/30 rounded-xl hover:scale-105 transition-transform">
             <Button size="icon" className="h-12 w-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
                <ChevronRight className="h-6 w-6" />
             </Button>
          </Link>
        </Card>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
         <Card className="bg-[#141416] border-neutral-800 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-400 to-purple-600" />
             <CardContent className="p-6">
                <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Total Projects</div>
                <div className="flex items-end justify-between">
                   <div className="text-4xl font-extrabold">{projects.length}</div>
                   <div className="text-right">
                     <span className="block text-[10px] text-neutral-500">Currently active</span>
                   </div>
                </div>
             </CardContent>
         </Card>

         <Card className="bg-[#141416] border-neutral-800 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-400 to-emerald-400" />
             <CardContent className="p-6">
                <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Team Efficiency</div>
                <div className="flex items-end justify-between">
                   <div className="text-4xl font-extrabold">{efficiency}%</div>
                   <div className="text-right">
                     <span className={cn("block text-xs font-bold", efficiency > 50 ? "text-teal-400" : "text-amber-500")}>{efficiency > 50 ? "Optimal" : "Lagging"}</span>
                     <span className="block text-[10px] text-neutral-500">Current load</span>
                   </div>
                </div>
             </CardContent>
         </Card>

         <Card className="bg-[#141416] border-neutral-800 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-400 to-rose-400" />
             <CardContent className="p-6">
                <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Upcoming Deadlines</div>
                <div className="flex items-end justify-between">
                   <div className="text-4xl font-extrabold">{String(upcomingDeadlines).padStart(2, '0')}</div>
                   <div className="text-right flex flex-col justify-end">       
                     <span className={cn("block text-xs font-bold flex items-center justify-end gap-1", upcomingDeadlines > 0 ? "text-amber-500" : "text-emerald-500")}>
                        {upcomingDeadlines > 0 ? <><AlertTriangle className="w-3 h-3" /> Urgent</> : "Clear"}
                     </span>
                     <span className="block text-[10px] text-neutral-500">Next 48 hours</span>
                   </div>
                </div>
             </CardContent>
         </Card>
      </div>

    </div>
  );
}
