import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, CheckCircle2, Circle, Clock, Flame, NotebookPen, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDialog } from "@/components/task-dialog";
import { PriorityBadge } from "@/components/priority-badge";
import {
  taskStats,
  todayISO,
  useNotes,
  useProfile,
  useTasks,
  useUpdateTask,
  type Task,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — InMode" },
      { name: "description", content: "Your day at a glance: tasks, notes and productivity." },
      { property: "og:title", content: "Dashboard — InMode" },
      { property: "og:description", content: "Your day at a glance in your InMode workspace." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: tasks, isLoading } = useTasks();
  const { data: notes } = useNotes();
  const update = useUpdateTask();
  const [newTask, setNewTask] = useState(false);

  const list = tasks ?? [];
  const stats = taskStats(list);
  const today = todayISO();
  const upcoming = list
    .filter((t) => t.status !== "completed" && t.due_date && t.due_date > today)
    .slice(0, 5);

  function toggle(t: Task) {
    const completed = t.status !== "completed";
    update.mutate({
      id: t.id,
      status: completed ? "completed" : "todo",
      completed_at: completed ? new Date().toISOString() : null,
    });
  }

  const cards = [
    { label: "Completed", value: stats.completed.length, icon: CheckCircle2 },
    { label: "Remaining", value: stats.remaining.length, icon: Circle },
    { label: "Overdue", value: stats.overdue.length, icon: TriangleAlert },
    { label: "Notes", value: (notes ?? []).length, icon: NotebookPen },
    { label: "Streak", value: `${stats.streak}d`, icon: Flame },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting()}, {profile?.name ?? "there"}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          · Here's what your day looks like.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <c.icon className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{isLoading ? "—" : c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Today's tasks</h2>
            <Button size="sm" variant="outline" onClick={() => setNewTask(true)}>
              <Plus className="size-4" /> New task
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {isLoading && <Skeleton className="h-16 w-full" />}
            {!isLoading && stats.dueToday.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing due today. Enjoy the clear runway — or plan ahead.
              </p>
            )}
            {stats.dueToday.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => toggle(t)} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-primary/30 bg-card p-5 glow-ring">
            <Bot className="size-5 text-primary" />
            <h2 className="mt-3 font-medium">Ask InMode AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              “What should I focus on today?” — it reads your tasks and notes.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link to="/assistant">Open assistant</Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-medium">Upcoming</h2>
            <div className="mt-3 space-y-2">
              {upcoming.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{t.due_date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent notes</h2>
              <Button asChild size="sm" variant="ghost">
                <Link to="/notes">Open</Link>
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {(notes ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Your workspace is empty. Start capturing your ideas.
                </p>
              )}
              {(notes ?? []).slice(0, 4).map((n) => (
                <div key={n.id} className="truncate text-sm">
                  {n.title}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <TaskDialog open={newTask} onOpenChange={setNewTask} defaults={{ due_date: today }} />
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
      <button onClick={onToggle} aria-label="Toggle complete">
        {task.status === "completed" ? (
          <CheckCircle2 className="size-5 text-primary" />
        ) : (
          <Circle className="size-5 text-muted-foreground" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">{task.category}</p>
      </div>
      {task.due_time && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {task.due_time.slice(0, 5)}
        </span>
      )}
      <PriorityBadge priority={task.priority} />
    </div>
  );
}
