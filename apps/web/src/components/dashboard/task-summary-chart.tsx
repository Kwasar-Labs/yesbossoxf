"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis } from "recharts";
import { TaskStatus } from "@/types";

export function TaskSummaryChart({ tasks }: { tasks: { status: TaskStatus }[] }) {
  const counts = {
    [TaskStatus.TODO]: 0,
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.IN_REVIEW]: 0,
    [TaskStatus.DONE]: 0,
    [TaskStatus.CANCELLED]: 0,
  };

  tasks.forEach(t => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  const data = [
    { name: "To Do",     value: counts[TaskStatus.TODO],        color: "#9ca3af" },
    { name: "Progress",  value: counts[TaskStatus.IN_PROGRESS], color: "#f59e0b" },
    { name: "Review",    value: counts[TaskStatus.IN_REVIEW],   color: "#f97316" },
    { name: "Done",      value: counts[TaskStatus.DONE],        color: "#10b981" },
    { name: "Cancelled", value: counts[TaskStatus.CANCELLED],   color: "#f43f5e" },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
          formatter={(value: any) => [value, "Tasks"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
