import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NotebookPen, Pin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
  type Note,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes — InMode" },
      { name: "description", content: "Capture ideas, lecture notes and references in Markdown." },
      { property: "og:title", content: "Notes — InMode" },
      { property: "og:description", content: "Your notes, pinned, tagged and searchable." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { data: notes, isLoading } = useNotes();
  const create = useCreateNote();
  const update = useUpdateNote();
  const remove = useDeleteNote();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes ?? [];
    return (notes ?? []).filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }, [notes, query]);

  function openNote(note: Note | null) {
    setEditing(note);
    setForm({
      title: note?.title ?? "",
      content: note?.content ?? "",
      tags: (note?.tags ?? []).join(", "),
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim() || "Untitled",
      content: form.content,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success("Note saved");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save note");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">What you need to remember.</p>
        </div>
        <Button onClick={() => openNote(null)}>
          <Plus className="size-4" /> New note
        </Button>
      </div>

      <Input
        placeholder="Search notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:max-w-sm"
      />

      {isLoading && <Skeleton className="h-32 w-full" />}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <NotebookPen className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Your workspace is empty. Start capturing your ideas.
          </p>
          <Button className="mt-4" size="sm" onClick={() => openNote(null)}>
            <Plus className="size-4" /> New note
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openNote(n)} className="min-w-0 flex-1 text-left">
                <h2 className="truncate font-medium">{n.title}</h2>
              </button>
              <button
                onClick={() => update.mutate({ id: n.id, pinned: !n.pinned })}
                aria-label="Pin note"
                className={n.pinned ? "text-primary" : "text-muted-foreground"}
              >
                <Pin className="size-4" />
              </button>
              <button
                onClick={() => setDeleting(n)}
                aria-label="Delete note"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {n.content || "Empty note"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(n.updated_at).toLocaleDateString()} {n.tags.length ? `· ${n.tags.join(", ")}` : ""}
            </p>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
            />
            <Textarea
              rows={14}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={"# Heading\n- point\n**bold**, *italic*, `code`"}
              className="font-mono text-sm"
            />
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags (comma separated)"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting)
                  remove.mutate(deleting.id, { onSuccess: () => toast.success("Note deleted") });
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
