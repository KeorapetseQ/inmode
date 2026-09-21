import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { PriorityBadge } from "@/components/priority-badge";
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  STATUS_LABELS,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  type Task,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — InMode" },
      { name: "description", content: "Create, organise and complete your tasks in list or board view." },
      { property: "og:title", content: "Tasks — InMode" },
      { property: "og:description", content: "List and board views for everything you need to do." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("due");

  const filtered = useMemo(() => {
    let list = [...(tasks ?? [])];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    if (category !== "all") list = list.filter((t) => t.category === category);
    const order = { urgent: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
    list.sort((a, b) => {
      if (sort === "priority") return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      if (sort === "created") return b.created_at.localeCompare(a.created_at);
      return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
    });
    return list;
  }, [tasks, query, priority, category, sort]);

  function toggle(t: Task) {
    const completed = t.status !== "completed";
    update.mutate({
      id: t.id,
      status: completed ? "completed" : "todo",
      completed_at: completed ? new Date().toISOString() : null,
    });
  }

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">Everything you need to do, your way.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <Input
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:col-span-2"
        />
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list">
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
          </TabsList>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Sort: due date</SelectItem>
              <SelectItem value="priority">Sort: priority</SelectItem>
              <SelectItem value="created">Sort: newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="mt-4 space-y-2">
          {isLoading && <Skeleton className="h-24 w-full" />}
          {!isLoading && filtered.length === 0 && (
            <EmptyState onCreate={openNew} />
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
            >
              <button onClick={() => toggle(t)} aria-label="Toggle complete">
                {t.status === "completed" ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${t.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                >
                  {t.title}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.category}</span>
                  <span>· {STATUS_LABELS[t.status]}</span>
                  {t.due_date && <span>· {t.due_date}</span>}
                  {t.due_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {t.due_time.slice(0, 5)}
                    </span>
                  )}
                </p>
              </div>
              <PriorityBadge priority={t.priority} />
              <button
                onClick={() => {
                  setEditing(t);
                  setDialogOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Edit task"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => setDeleting(t)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Delete task"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="board" className="mt-4">
          <div className="grid gap-3 md:grid-cols-3">
            {STATUSES.map((status) => (
              <div key={status} className="rounded-xl border border-border bg-card p-3">
                <h2 className="px-1 text-sm font-medium">
                  {STATUS_LABELS[status]}{" "}
                  <span className="text-muted-foreground">
                    ({filtered.filter((t) => t.status === status).length})
                  </span>
                </h2>
                <div className="mt-3 space-y-2">
                  {filtered
                    .filter((t) => t.status === status)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border border-border bg-background/50 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">{t.title}</p>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.category}
                          {t.due_date ? ` · ${t.due_date}` : ""}
                        </p>
                        <Select
                          value={t.status}
                          onValueChange={(v) =>
                            update.mutate({
                              id: t.id,
                              status: v,
                              completed_at: v === "completed" ? new Date().toISOString() : null,
                            })
                          }
                        >
                          <SelectTrigger className="mt-2 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                Move to {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  {filtered.filter((t) => t.status === status).length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                      Nothing here yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting)
                  remove.mutate(deleting.id, { onSuccess: () => toast.success("Task deleted") });
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-14 text-center">
      <ListChecks className="mx-auto size-6 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">No tasks yet. Create your first task.</p>
      <Button className="mt-4" size="sm" onClick={onCreate}>
        <Plus className="size-4" /> New task
      </Button>
    </div>
  );
}
