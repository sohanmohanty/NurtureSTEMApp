import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "muted"
> = {
  Waitlisted: "warning",
  Matched: "info",
  Active: "success",
  Paused: "muted",
  Completed: "secondary",
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
  Ended: "muted",
  "Not Started": "muted",
  "In Progress": "info",
  Complete: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>{status}</Badge>
  );
}
