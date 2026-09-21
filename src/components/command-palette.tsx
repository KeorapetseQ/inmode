import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/app-shell";
import { useNotes, useTasks } from "@/lib/workspace";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: tasks } = useTasks();
  const { data: notes } = useNotes();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function run(fn: () => void) {
    onOpenChange(false);
    fn();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tasks, notes or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.to}
              value={`go ${item.label}`}
              onSelect={() => run(() => void navigate({ to: item.to }))}
            >
              <item.icon className="size-4" /> {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="create task"
            onSelect={() => run(() => void navigate({ to: "/tasks", search: { new: true } }))}
          >
            Create task
          </CommandItem>
          <CommandItem
            value="create note"
            onSelect={() => run(() => void navigate({ to: "/notes", search: { new: true } }))}
          >
            Create note
          </CommandItem>
          <CommandItem
            value="toggle theme"
            onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
          >
            Toggle theme
          </CommandItem>
          <CommandItem
            value="logout sign out"
            onSelect={() =>
              run(() => {
                queryClient.clear();
                void supabase.auth
                  .signOut()
                  .then(() => navigate({ to: "/auth", search: { mode: "signin" } }));
              })
            }
          >
            Log out
          </CommandItem>
        </CommandGroup>
        {(tasks ?? []).length > 0 && (
          <CommandGroup heading="Tasks">
            {(tasks ?? []).slice(0, 20).map((t) => (
              <CommandItem
                key={t.id}
                value={`task ${t.title}`}
                onSelect={() => run(() => void navigate({ to: "/tasks", search: {} }))}
              >
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {(notes ?? []).length > 0 && (
          <CommandGroup heading="Notes">
            {(notes ?? []).slice(0, 20).map((n) => (
              <CommandItem
                key={n.id}
                value={`note ${n.title}`}
                onSelect={() => run(() => void navigate({ to: "/notes", search: {} }))}
              >
                {n.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
