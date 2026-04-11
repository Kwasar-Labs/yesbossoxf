"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TaskStatus } from "@/types";

export function TaskSummaryChart({ tasks }: { tasks: { status: TaskStatus }[] }) {
  const statusCounts = {
    [TaskStatus.TODO]: 0,
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.IN_REVIEW]: 0,
    [TaskStatus.DONE]: 0,
    [TaskStatus.CANCELLED]: 0,
  };

  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });

  const data = [
    { name: "To Do", value: statusCounts[TaskStatus.TODO], color: "#9ca3af" },       // neutral-400
    { name: "Progress", value: statusCounts[TaskStatus.IN_PROGRESS], color: "#38bdf8" }, // sky-400
    { name: "Review", value: statusCounts[TaskStatus.IN_REVIEW], color: "#fbbf24" }, // amber-400
    { name: "Done", value: statusCounts[TaskStatus.DONE], color: "#34d399" },        // emerald-400
    { name: "Cancel", value: statusCounts[TaskStatus.CANCELLED], color: "#fb7185" }, // rose-400
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={32}>
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ backgroundColor: '#141416', border: '1px solid #232325', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#c084fc' }}
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
