import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  NotebookPen,
  Search,
  Settings,
  Sparkle,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useNotifications } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between px-4 py-5">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkle className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">InMode</span>
        </Link>
        <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
              {item.label === "Notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/60"
        >
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 text-xs font-medium text-primary">
            {profile?.profile_image ? (
              <img src={profile.profile_image} alt="" className="size-full object-cover" />
            ) : (
              (profile?.name ?? "U").slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{profile?.name ?? "Your profile"}</span>
            <span className="block truncate text-xs text-muted-foreground">{profile?.email}</span>
          </span>
        </Link>
        <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={signOut}>
          <LogOut className="size-4" /> Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border md:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border">
            {sidebar}
          </div>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:max-w-md"
          >
            <Search className="size-4" />
            <span>Search or run a command</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[11px] sm:inline">
              Ctrl K
            </kbd>
          </button>
          <Button asChild size="sm" variant="outline" className="hidden sm:flex">
            <Link to="/assistant">
              <Bot className="size-4" /> InMode AI
            </Link>
          </Button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
