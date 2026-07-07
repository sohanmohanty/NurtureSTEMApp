import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { HourLog } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MyHoursClient } from "./my-hours-client";

export const metadata: Metadata = {
  title: "My Hours",
};

export type AssignedStudentOption = {
  id: string;
  display_name: string;
};

export type MyHourLogRow = HourLog & { studentName: string | null };

export default async function MyHoursPage() {
  const { supabase, profile } = await requireRole(["admin", "volunteer"]);

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!volunteer) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Hours" />
        <EmptyState
          title="No tutor profile found"
          description="Your volunteer tutor profile has not been created yet. Contact the program admin."
        />
      </div>
    );
  }

  const [{ data: assignments }, { data: logs }] = await Promise.all([
    supabase
      .from("assignments")
      .select("students(id, display_name)")
      .eq("volunteer_id", volunteer.id)
      .eq("status", "Active"),
    supabase
      .from("hour_logs")
      .select("*, students(display_name)")
      .eq("volunteer_id", volunteer.id)
      .order("created_at", { ascending: false }),
  ]);

  type RawAssignment = {
    students: { id: string; display_name: string } | null;
  };
  const students: AssignedStudentOption[] = (
    (assignments ?? []) as unknown as RawAssignment[]
  )
    .map((a) => a.students)
    .filter((s): s is AssignedStudentOption => s !== null);

  type RawLog = HourLog & { students: { display_name: string } | null };
  const rows: MyHourLogRow[] = ((logs ?? []) as unknown as RawLog[]).map(
    ({ students: s, ...log }) => ({
      ...log,
      studentName: s?.display_name ?? null,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hours"
        description="Log tutoring sessions and track their approval status."
      />
      <MyHoursClient
        volunteerId={volunteer.id}
        students={students}
        logs={rows}
      />
    </div>
  );
}
