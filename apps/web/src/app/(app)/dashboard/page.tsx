"use client";

import { useState, useEffect, useMemo } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { TaskStatus } from "@/types";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckSquare, Activity, FolderKanban, CheckCircle2,
  Clock, AlertTriangle, Zap, ArrowRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const STATUS_COLORS = {
  todo:        { pie: "#9ca3af", bar: "#9ca3af", bg: "bg-neutral-400" },
  in_progress: { pie: "#f59e0b", bar: "#f59e0b", bg: "bg-amber-500" },
  in_review:   { pie: "#f97316", bar: "#f97316", bg: "bg-orange-500" },
  done:        { pie: "#10b981", bar: "#10b981", bg: "bg-emerald-500" },
  cancelled:   { pie: "#f43f5e", bar: "#f43f5e", bg: "bg-rose-500" },
};

export default function DashboardPage() {
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchTasks({ limit: 100 }, false);
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const todoCount       = tasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const inReviewCount   = tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
  const doneCount       = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const cancelledCount  = tasks.filter(t => t.status === TaskStatus.CANCELLED).length;
  const totalTasks      = tasks.length;
  const velocity        = totalTasks > 0 ? ((doneCount / totalTasks) * 100).toFixed(1) : "0.0";

  const upcomingDeadlines = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate).getTime();
    return due > Date.now() && due < Date.now() + 48 * 3600 * 1000;
  }).length;

  useEffect(() => {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
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
        if (data?.data?.insights) setInsights(data.data.insights);
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      } finally {
        clearTimeout(tid);
        setInsightsLoading(false);
      }
    }
    loadInsights();
    return () => controller.abort();
  }, []);

  const recentActivity = useMemo(() =>
    tasks
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map(t => ({ id: t._id, taskTitle: t.title, status: t.status, updatedAt: t.updatedAt as unknown as string })),
  [tasks]);

  const pieData = [
    { name: "To Do",       value: todoCount,       color: STATUS_COLORS.todo.pie },
    { name: "In Progress", value: inProgressCount, color: STATUS_COLORS.in_progress.pie },
    { name: "In Review",   value: inReviewCount,   color: STATUS_COLORS.in_review.pie },
    { name: "Done",        value: doneCount,        color: STATUS_COLORS.done.pie },
    { name: "Cancelled",   value: cancelledCount,   color: STATUS_COLORS.cancelled.pie },
  ].filter(d => d.value > 0);

  const barData = [
    { name: "To Do",       value: todoCount,       fill: STATUS_COLORS.todo.bar },
    { name: "Progress",    value: inProgressCount, fill: STATUS_COLORS.in_progress.bar },
    { name: "Review",      value: inReviewCount,   fill: STATUS_COLORS.in_review.bar },
    { name: "Done",        value: doneCount,        fill: STATUS_COLORS.done.bar },
    { name: "Cancelled",   value: cancelledCount,   fill: STATUS_COLORS.cancelled.bar },
  ];

  const kpiCards = [
    { label: "Total Tasks",  value: totalTasks,      icon: CheckSquare,  color: "text-amber-500",   bg: "bg-amber-500/10" },
    { label: "In Progress",  value: inProgressCount, icon: Activity,     color: "text-orange-500",  bg: "bg-orange-500/10" },
    { label: "Completed",    value: doneCount,        icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Projects",     value: projects.length,  icon: FolderKanban, color: "text-teal-500",    bg: "bg-teal-500/10" },
  ];

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-5 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">YesBoss</span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/tasks">
          <Button size="sm" className="hidden sm:flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            View Tasks
          </Button>
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60">
            <CardContent className="p-5">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

        {/* Left — charts */}
        <div className="space-y-5">

          {/* Task breakdown */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Task Breakdown</CardTitle>
              <p className="text-xs text-muted-foreground">Status distribution across {totalTasks} tasks</p>
            </CardHeader>
            <CardContent>
              {totalTasks === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  No tasks yet
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Donut chart */}
                  <div className="w-44 h-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={46} outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                          itemStyle={{ color: "var(--color-foreground)" }}
                          formatter={(v: any) => [v, "tasks"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2.5 w-full">
                    {[
                      { label: "To Do",       count: todoCount,       bg: STATUS_COLORS.todo.bg },
                      { label: "In Progress", count: inProgressCount, bg: STATUS_COLORS.in_progress.bg },
                      { label: "In Review",   count: inReviewCount,   bg: STATUS_COLORS.in_review.bg },
                      { label: "Done",        count: doneCount,        bg: STATUS_COLORS.done.bg },
                      { label: "Cancelled",   count: cancelledCount,   bg: STATUS_COLORS.cancelled.bg },
                    ].map(({ label, count, bg }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", bg)} />
                        <span className="text-xs text-muted-foreground flex-1">{label}</span>
                        <span className="text-xs font-semibold tabular-nums w-6 text-right">{count}</span>
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", bg)}
                            style={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Task Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Count by status</p>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barSize={28} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                      contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "var(--color-foreground)" }}
                      formatter={(v: any) => [v, "tasks"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — activity */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Latest task updates</p>
          </CardHeader>
          <CardContent className="h-[420px] overflow-hidden">
            <ActivityFeed items={recentActivity} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">

        {/* Completion rate */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-3xl font-bold tabular-nums">{velocity}</span>
              <span className="text-sm font-semibold text-emerald-500">%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${velocity}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{doneCount} of {totalTasks} tasks complete</p>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className={cn("h-4 w-4", upcomingDeadlines > 0 ? "text-amber-500" : "text-muted-foreground")} />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Deadlines</span>
            </div>
            <div className="text-3xl font-bold tabular-nums mb-2">{upcomingDeadlines}</div>
            {upcomingDeadlines > 0 ? (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Due in next 48 hours</span>
              </div>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All clear for 48 hours</span>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Insights</span>
            </div>
            {insightsLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                <span>Analyzing workspace...</span>
              </div>
            ) : insights.length > 0 ? (
              <ul className="space-y-1.5">
                {insights.slice(0, 3).map((ins, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-primary flex-shrink-0 mt-0.5">·</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                {inProgressCount > 0
                  ? `${inProgressCount} task${inProgressCount > 1 ? "s" : ""} currently in progress.`
                  : "No active tasks. Create a task to get started."}
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
