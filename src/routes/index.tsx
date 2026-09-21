import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Command,
  ListChecks,
  NotebookPen,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InMode — Your workspace. Your tasks. Your intelligence." },
      {
        name: "description",
        content:
          "InMode combines task management, notes, analytics and an AI assistant into one calm, fast workspace.",
      },
      { property: "og:title", content: "InMode — Your workspace. Your tasks. Your intelligence." },
      {
        property: "og:description",
        content:
          "Plan your day, capture your thinking and ask InMode AI what to focus on next — all in one workspace.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: ListChecks,
    title: "Tasks that keep up",
    body: "List, board and calendar views with priorities, categories, tags and due times.",
  },
  {
    icon: NotebookPen,
    title: "Notes for everything",
    body: "Markdown notes with pinning, tags and instant search across your workspace.",
  },
  {
    icon: Bot,
    title: "InMode AI",
    body: "An assistant that reads your tasks and notes and turns plans into real work.",
  },
  {
    icon: BarChart3,
    title: "Honest analytics",
    body: "Completion rate, streaks and category breakdowns — no vanity dashboards.",
  },
  {
    icon: Command,
    title: "Command palette",
    body: "Ctrl + K to jump anywhere, create a task or open the assistant instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Every record is scoped to your account and protected at the database level.",
  },
];

function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen aurora">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkle className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">InMode</span>
        </Link>
        <nav className="flex items-center gap-2">
          {!loading && user ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth" search={{ mode: "signin" }}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        <section className="py-16 text-center sm:py-24">
          <p className="mx-auto mb-5 w-fit rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Productivity workspace with a built-in AI assistant
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Your workspace. Your tasks. Your intelligence.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            InMode brings your tasks, notes and planning into one place — with an assistant that
            understands what you are actually working on.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "signin" }}>
                Login
              </Link>
            </Button>
          </div>

          <div className="mt-14 rounded-2xl border border-border glass p-3 text-left shadow-2xl">
            <div className="rounded-xl bg-background/60 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Today", value: "6 tasks", hint: "2 urgent" },
                  { label: "Streak", value: "12 days", hint: "keep going" },
                  { label: "Completion", value: "84%", hint: "this week" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{c.value}</p>
                    <p className="text-xs text-muted-foreground">{c.hint}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">InMode AI</p>
                <p className="mt-2 text-sm">
                  “Focus on <span className="text-primary">Java exceptions revision</span> first —
                  it's due at 14:00 and blocks tomorrow's practical.”
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 rounded-2xl border border-border bg-card p-8 sm:grid-cols-3">
          <div>
            <CalendarDays className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Plan the week</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Day, week and month calendar views built on the same tasks.
            </p>
          </div>
          <div>
            <Bot className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">Ask, then do</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Turn “study Java tomorrow at 2pm” into a real task you confirm.
            </p>
          </div>
          <div>
            <BarChart3 className="size-5 text-primary" />
            <h3 className="mt-3 font-medium">See the pattern</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Understand your best days and where work piles up.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        InMode — a calm workspace for what you need to do, remember and decide.
      </footer>
    </div>
  );
}
