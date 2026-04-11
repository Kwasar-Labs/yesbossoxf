"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  Users,
  Search,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard CRM", icon: LayoutDashboard },
  { href: "/tasks", label: "Task", icon: CheckSquare },
  { href: "/projects", label: "Project Management", icon: FolderKanban },
  { href: "/teams", label: "HR Payroll", icon: Users },
  { href: "/admin", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const sidebarOpen = !sidebarCollapsed;

  return (
    <aside
      className={cn(
        "group relative flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 h-full",
        !sidebarCollapsed ? "w-[260px]" : "w-[72px]"
      )}
    >
      <div className="flex h-16 items-center px-4 justify-between border-b border-border/10">
        <div className={cn("flex items-center gap-3 overflow-hidden", !sidebarOpen && "opacity-0 invisible w-0 p-0")}>
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
             <span className="font-semibold text-lg text-foreground whitespace-nowrap">Project Inc.</span>
             <span className="text-[9px] px-1.5 py-0.5 border border-primary/20 rounded uppercase font-bold tracking-widest text-primary bg-primary/10">Pro</span>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => toggleSidebar()}
          className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground shadow-sm"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        
        {sidebarOpen && (
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Search" 
               className="w-full bg-black/40 border border-border/40 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
             />
             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-white/5 px-1 rounded border border-white/10">⌘K</span>
          </div>
        )}

        <div>
          {sidebarOpen && (
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-2">Workspace</h4>
          )}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all",
                    active
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    !sidebarOpen && "justify-center px-0"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-4 w-4", active ? "text-primary" : "opacity-70")} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {active && sidebarOpen && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={logout}
          title={!sidebarOpen ? "Log out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-red-400",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span>Log out</span>}
        </button>

        {sidebarOpen && user && (
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border shrink-0">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
