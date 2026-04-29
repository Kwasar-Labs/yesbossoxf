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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/teams", label: "Team", icon: Users },
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
        "group relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 h-full",
        !sidebarCollapsed ? "w-[240px]" : "w-[68px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 justify-between border-b border-sidebar-border">
        <div className={cn("flex items-center gap-2.5 overflow-hidden", !sidebarOpen && "opacity-0 invisible w-0 p-0")}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-foreground whitespace-nowrap tracking-tight">YesBoss</span>
            <span className="text-[9px] px-1.5 py-0.5 border border-primary/30 rounded-sm uppercase font-bold tracking-widest text-primary bg-primary/10">AI</span>
          </div>
        </div>

        <button
          onClick={() => toggleSidebar()}
          className="absolute -right-3 top-4 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground shadow-sm transition-colors"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">

        {/* Search */}
        {sidebarOpen && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-background/70 border border-border/70 rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        <div>
          {sidebarOpen && (
            <h4 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2 ml-1">Workspace</h4>
          )}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-all",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    !sidebarOpen && "justify-center px-0"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-primary" : "opacity-60")} />
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

      {/* User footer */}
      <div className="p-3 mt-auto border-t border-sidebar-border">
        <button
          onClick={logout}
          title={!sidebarOpen ? "Log out" : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-rose-500",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span>Log out</span>}
        </button>

        {sidebarOpen && user && (
          <div className="mt-2 flex items-center gap-2.5 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 border border-primary/30 shrink-0">
              <span className="text-xs font-bold text-primary uppercase">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="truncate text-xs font-semibold text-foreground">{user.name}</span>
              <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
