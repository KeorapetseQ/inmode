import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Copy, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useConversations,
  useCreateTask,
  useMessages,
  useNotes,
  useProfile,
  useTasks,
} from "@/lib/workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "InMode AI — InMode" },
      { name: "description", content: "Your AI productivity companion, aware of your tasks and notes." },
      { property: "og:title", content: "InMode AI" },
      { property: "og:description", content: "Plan your day, break down projects and turn notes into tasks." },
    ],
  }),
  component: Assistant,
});

const SUGGESTIONS = [
  "What should I focus on today?",
  "Help me plan my day.",
  "Break my current project into smaller tasks.",
  "Create a weekly study schedule.",
];

function Assistant() {
  const { data: conversations } = useConversations();
  const { data: profile } = useProfile();
  const { data: tasks } = useTasks();
  const { data: notes } = useNotes();
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const { data: messages } = useMessages(activeId);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) setActiveId(conversations[0]!.id);
  }, [conversations, activeId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function ensureConversation(firstMessage: string) {
    if (activeId) return activeId;
    const { data: userRes } = await supabase.auth.getUser();
    const user_id = userRes.user?.id;
    if (!user_id) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id, title: firstMessage.slice(0, 48) })
      .select()
      .single();
    if (error) throw error;
    setActiveId(data.id);
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    return data.id;
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setInput("");
    try {
      const conversationId = await ensureConversation(content);
      const { data: userRes } = await supabase.auth.getUser();
      const user_id = userRes.user!.id;

      await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, user_id, role: "user", content });
      await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });

      const history = [...(messages ?? []).map((m) => ({ role: m.role, content: m.content })), {
        role: "user",
        content,
      }];

      const context = {
        name: profile?.name ?? "there",
        tasks: (tasks ?? []).slice(0, 40).map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          category: t.category,
          due_date: t.due_date,
          due_time: t.due_time,
        })),
        notes: (notes ?? []).slice(0, 15).map((n) => ({
          title: n.title,
          content: n.content.slice(0, 600),
        })),
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text();
        throw new Error(detail || "The assistant is unavailable right now.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreaming(full);
      }
      setStreaming("");

      await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, user_id, role: "assistant", content: full });
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
      await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });

      const suggestion = parseTaskSuggestion(full);
      if (suggestion) {
        toast("InMode AI suggested a task", {
          description: suggestion.title,
          action: {
            label: "Create it",
            onClick: () => {
              createTask.mutate(suggestion, { onSuccess: () => toast.success("Task created") });
            },
          },
        });
      }
    } catch (err) {
      setStreaming("");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function deleteConversation(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    if (activeId === id) setActiveId(undefined);
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    toast.success("Conversation deleted");
  }

  const list = messages ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
      <aside className="hidden rounded-xl border border-border bg-card p-3 lg:block">
        <Button size="sm" className="w-full" onClick={() => setActiveId(undefined)}>
          <Plus className="size-4" /> New chat
        </Button>
        <div className="mt-3 space-y-1">
          {(conversations ?? []).map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm",
                activeId === c.id ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <button onClick={() => setActiveId(c.id)} className="min-w-0 flex-1 truncate text-left">
                {c.title}
              </button>
              <button
                onClick={() => deleteConversation(c.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Delete conversation"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[70dvh] flex-col rounded-xl border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {list.length === 0 && !streaming && (
            <div className="py-16 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Bot className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-medium">How can I help you today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                I can see your tasks and notes when you ask about them.
              </p>
              <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {list.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.content}
                </p>
              ) : (
                <div className="group max-w-[90%]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(m.content);
                      toast.success("Copied");
                    }}
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="mr-1 inline size-3" /> Copy
                  </button>
                </div>
              )}
            </div>
          ))}

          {streaming && (
            <p className="max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed">{streaming}</p>
          )}
          {busy && !streaming && (
            <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <Textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Ask InMode AI anything about your work…"
            className="max-h-40 min-h-11 resize-none"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </section>
    </div>
  );
}

function parseTaskSuggestion(text: string) {
  const match = text.match(/```task\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]!.trim()) as {
      title?: string;
      description?: string;
      due_date?: string;
      due_time?: string;
      priority?: string;
      category?: string;
    };
    if (!parsed.title) return null;
    return {
      title: parsed.title,
      description: parsed.description ?? null,
      due_date: parsed.due_date ?? null,
      due_time: parsed.due_time ?? null,
      priority: parsed.priority ?? "medium",
      category: parsed.category ?? "Personal",
    };
  } catch {
    return null;
  }
}
