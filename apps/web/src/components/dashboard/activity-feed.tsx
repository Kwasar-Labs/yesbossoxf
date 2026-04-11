import { CheckCircle2, Circle, Clock, AlertCircle, ArrowRight, Activity, Bot, User, Clock3 } from "lucide-react";
import { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  taskTitle: string;
  status: TaskStatus;
  updatedAt: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
      {items.map((item, i) => {
        return (
          <div key={item.id} className="relative flex items-start gap-4">
            <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1c1e] ring-4 ring-[#141416] z-10">
              <div className={cn("h-full w-full rounded-full flex items-center justify-center bg-opacity-20", getStatusBg(item.status))}>
                 {getStatusIcon(item.status)}
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-200">System Trace</span>
                <span className="text-[10px] font-bold text-neutral-500 tracking-wider">
                  {formatTimeAgo(item.updatedAt)}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-snug">
                Status changed to <span className="text-neutral-300 font-semibold">{item.status.replace("_", " ")}</span> for <span className="text-purple-400 font-semibold">{item.taskTitle}</span>.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStatusBg(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.DONE: return "bg-emerald-500/20 text-emerald-400";
    case TaskStatus.IN_PROGRESS: return "bg-teal-500/20 text-teal-400";
    case TaskStatus.IN_REVIEW: return "bg-amber-500/20 text-amber-400";
    case TaskStatus.CANCELLED: return "bg-rose-500/20 text-rose-400";
    default: return "bg-neutral-500/20 text-neutral-400";
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case TaskStatus.DONE: return <CheckCircle2 className="h-3 w-3" />;
    case TaskStatus.IN_PROGRESS: return <Activity className="h-3 w-3" />;
    case TaskStatus.IN_REVIEW: return <Clock3 className="h-3 w-3" />;
    case TaskStatus.CANCELLED: return <AlertCircle className="h-3 w-3" />;
    default: return <Circle className="h-3 w-3" />;
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}S AGO`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
  return `${Math.floor(diffInSeconds / 86400)}D AGO`;
}
