import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDialog } from "@/components/task-dialog";
import { PriorityBadge } from "@/components/priority-badge";
import { useTasks, type Task } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — InMode" },
      { name: "description", content: "See your tasks by day, week or month." },
      { property: "og:title", content: "Calendar — InMode" },
      { property: "og:description", content: "Plan your week with your InMode tasks on a calendar." },
    ],
  }),
  component: CalendarPage,
});

type View = "day" | "week" | "month";

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return copy;
}

function CalendarPage() {
  const { data: tasks } = useTasks();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [newOpen, setNewOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | undefined>(undefined);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks ?? []) {
      if (!t.due_date) continue;
      map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    if (view === "day") return [new Date(cursor)];
    if (view === "week") {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view, cursor]);

  function shift(delta: number) {
    const next = new Date(cursor);
    if (view === "day") next.setDate(next.getDate() + delta);
    else if (view === "week") next.setDate(next.getDate() + delta * 7);
    else next.setMonth(next.getMonth() + delta);
    setCursor(next);
  }

  const label =
    view === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : cursor.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight className="size-4" />
          </Button>
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div
        className={
          view === "day"
            ? "space-y-3"
            : view === "week"
              ? "grid gap-2 sm:grid-cols-7"
              : "grid grid-cols-7 gap-1.5"
        }
      >
        {days.map((d) => {
          const key = iso(d);
          const items = byDate.get(key) ?? [];
          const isToday = key === iso(new Date());
          const outside = view === "month" && d.getMonth() !== cursor.getMonth();
          return (
            <div
              key={key}
              className={`rounded-lg border p-2 ${isToday ? "border-primary/50" : "border-border"} ${
                outside ? "opacity-40" : ""
              } ${view === "month" ? "min-h-24" : "min-h-32"} bg-card`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {view === "month"
                    ? d.getDate()
                    : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => {
                    setNewDate(key);
                    setNewOpen(true);
                  }}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Add task"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <div className="mt-1 space-y-1">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1 rounded bg-background/60 px-1.5 py-1 text-[11px]"
                  >
                    <span className="truncate">{t.title}</span>
                    {view !== "month" && <PriorityBadge priority={t.priority} />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        defaults={newDate ? { due_date: newDate } : undefined}
      />
    </div>
  );
}
