import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  taskStats,
  useMarkNotificationRead,
  useNotifications,
  useTasks,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — InMode" },
      { name: "description", content: "Deadline reminders and workspace alerts." },
      { property: "og:title", content: "Notifications — InMode" },
      { property: "og:description", content: "Stay on top of overdue work and upcoming deadlines." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: notifications } = useNotifications();
  const { data: tasks } = useTasks();
  const markRead = useMarkNotificationRead();

  const stats = useMemo(() => taskStats(tasks ?? []), [tasks]);

  useEffect(() => {
    document.title = "Notifications — InMode";
  }, []);

  const derived = [
    ...stats.overdue.map((t) => ({
      id: `overdue-${t.id}`,
      title: `Overdue: ${t.title}`,
      message: `Was due ${t.due_date}.`,
      type: "deadline",
    })),
    ...stats.dueToday.map((t) => ({
      id: `today-${t.id}`,
      title: `Due today: ${t.title}`,
      message: t.due_time ? `At ${t.due_time.slice(0, 5)}.` : "Sometime today.",
      type: "reminder",
    })),
  ];

  const stored = notifications ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Deadlines, reminders and workspace alerts.</p>
      </div>

      {derived.length === 0 && stored.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <Bell className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">You're all caught up.</p>
        </div>
      )}

      <div className="space-y-2">
        {derived.map((n) => (
          <div key={n.id} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">{n.title}</p>
            <p className="text-xs text-muted-foreground">{n.message}</p>
          </div>
        ))}
        {stored.map((n) => (
          <div
            key={n.id}
            className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
              n.read ? "border-border bg-card opacity-70" : "border-primary/30 bg-card"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
            {!n.read && (
              <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>
                Mark read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
