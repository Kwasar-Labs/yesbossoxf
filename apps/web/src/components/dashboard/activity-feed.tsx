import { CheckCircle2, Circle, Activity, Clock3, AlertCircle } from "lucide-react";
import { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  taskTitle: string;
  status: TaskStatus;
  updatedAt: string;
}

const statusConfig = {
  [TaskStatus.TODO]:        { label: "To Do",      dot: "bg-neutral-400",  icon: Circle },
  [TaskStatus.IN_PROGRESS]: { label: "In Progress", dot: "bg-amber-500",   icon: Activity },
  [TaskStatus.IN_REVIEW]:   { label: "In Review",   dot: "bg-orange-500",  icon: Clock3 },
  [TaskStatus.DONE]:        { label: "Done",        dot: "bg-emerald-500", icon: CheckCircle2 },
  [TaskStatus.CANCELLED]:   { label: "Cancelled",   dot: "bg-rose-500",    icon: AlertCircle },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const cfg = statusConfig[item.status] ?? statusConfig[TaskStatus.TODO];
        const Icon = cfg.icon;
        return (
          <div key={item.id} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/40 transition-colors">
            <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", cfg.dot)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate leading-tight">{item.taskTitle}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{cfg.label}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground/70 flex-shrink-0 mt-1">
              {formatTimeAgo(item.updatedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatTimeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60)   return `${Math.max(1, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
