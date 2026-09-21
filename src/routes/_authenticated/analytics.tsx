import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { taskStats, useTasks } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — InMode" },
      { name: "description", content: "Completion rate, streaks and where your work lives." },
      { property: "og:title", content: "Analytics — InMode" },
      { property: "og:description", content: "Understand your productivity patterns in InMode." },
    ],
  }),
  component: Analytics,
});

const COLORS = ["#4dd6d6", "#9a7dff", "#66d19e", "#e9c46a", "#ef767a", "#7aa2f7"];

function Analytics() {
  const { data: tasks } = useTasks();
  const list = tasks ?? [];
  const stats = taskStats(list);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 29);

  const completedThisWeek = stats.completed.filter(
    (t) => t.completed_at && new Date(t.completed_at) >= weekStart,
  ).length;
  const completedThisMonth = stats.completed.filter(
    (t) => t.completed_at && new Date(t.completed_at) >= monthStart,
  ).length;

  const byDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }), completed: 0 };
    });
    for (const t of stats.completed) {
      if (!t.completed_at) continue;
      const key = t.completed_at.slice(0, 10);
      const slot = days.find((d) => d.key === key);
      if (slot) slot.completed += 1;
    }
    return days;
  }, [stats.completed]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of list) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [list]);

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of list) map.set(t.priority, (map.get(t.priority) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [list]);

  const cards = [
    { label: "Completed this week", value: completedThisWeek },
    { label: "Completed this month", value: completedThisMonth },
    { label: "Completion rate", value: `${stats.completionRate}%` },
    { label: "Overdue", value: stats.overdue.length },
    { label: "Current streak", value: `${stats.streak} days` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">How your work actually goes.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium">Completed — last 7 days</h2>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="currentColor" fontSize={12} />
                <YAxis allowDecimals={false} stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Bar dataKey="completed" fill="#4dd6d6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium">Tasks by category</h2>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="font-medium">Tasks by priority</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis allowDecimals={false} stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#9a7dff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
