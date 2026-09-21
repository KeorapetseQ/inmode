import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  STATUS_LABELS,
  useCreateTask,
  useUpdateTask,
  type Task,
} from "@/lib/workspace";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  defaults?: Partial<Task>;
};

export function TaskDialog({ open, onOpenChange, task, defaults }: Props) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    category: "Personal",
    due_date: "",
    due_time: "",
    tags: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: task?.title ?? defaults?.title ?? "",
      description: task?.description ?? defaults?.description ?? "",
      status: task?.status ?? defaults?.status ?? "todo",
      priority: task?.priority ?? defaults?.priority ?? "medium",
      category: task?.category ?? defaults?.category ?? "Personal",
      due_date: task?.due_date ?? defaults?.due_date ?? "",
      due_time: (task?.due_time ?? defaults?.due_time ?? "").slice(0, 5),
      tags: (task?.tags ?? defaults?.tags ?? []).join(", "),
    });
  }, [open, task, defaults]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      category: form.category,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      completed_at: form.status === "completed" ? new Date().toISOString() : null,
    };
    if (!payload.title) return;
    try {
      if (task) {
        await update.mutateAsync({ id: task.id, ...payload });
        toast.success("Task updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save task");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to happen?"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Details, links, context…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="exam, java"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due-date">Due date</Label>
              <Input
                id="due-date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due-time">Due time</Label>
              <Input
                id="due-time"
                type="time"
                value={form.due_time}
                onChange={(e) => setForm({ ...form, due_time: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
