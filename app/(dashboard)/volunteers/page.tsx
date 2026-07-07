import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { HourLog, Volunteer } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { VolunteersClient } from "./volunteers-client";

export const metadata: Metadata = {
  title: "Volunteers",
};

export type VolunteerRow = Volunteer & {
  assignedCount: number;
  approvedMinutes: number;
  pendingMinutes: number;
};

export default async function VolunteersPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: volunteers }, { data: assignments }, { data: logs }] =
    await Promise.all([
      supabase.from("volunteers").select("*").order("name"),
      supabase
        .from("assignments")
        .select("volunteer_id")
        .eq("status", "Active"),
      supabase
        .from("hour_logs")
        .select("volunteer_id, duration_minutes, approval_status"),
    ]);

  const assignedCounts = new Map<string, number>();
  for (const assignment of (assignments ?? []) as { volunteer_id: string }[]) {
    assignedCounts.set(
      assignment.volunteer_id,
      (assignedCounts.get(assignment.volunteer_id) ?? 0) + 1
    );
  }

  const approved = new Map<string, number>();
  const pending = new Map<string, number>();
  for (const log of (logs ?? []) as Pick<
    HourLog,
    "volunteer_id" | "duration_minutes" | "approval_status"
  >[]) {
    if (log.approval_status === "Approved") {
      approved.set(
        log.volunteer_id,
        (approved.get(log.volunteer_id) ?? 0) + log.duration_minutes
      );
    } else if (log.approval_status === "Pending") {
      pending.set(
        log.volunteer_id,
        (pending.get(log.volunteer_id) ?? 0) + log.duration_minutes
      );
    }
  }

  const rows: VolunteerRow[] = ((volunteers ?? []) as Volunteer[]).map(
    (volunteer) => ({
      ...volunteer,
      assignedCount: assignedCounts.get(volunteer.id) ?? 0,
      approvedMinutes: approved.get(volunteer.id) ?? 0,
      pendingMinutes: pending.get(volunteer.id) ?? 0,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers"
        description="Manage high-school volunteer tutors, their strengths, and capacity."
      />
      <VolunteersClient volunteers={rows} />
    </div>
  );
}
