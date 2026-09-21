import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  low: "border-border text-muted-foreground",
  medium: "border-primary/40 text-primary",
  high: "border-amber-500/40 text-amber-500",
  urgent: "border-destructive/50 text-destructive",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] capitalize",
        styles[priority] ?? styles["low"],
      )}
    >
      {priority}
    </span>
  );
}
