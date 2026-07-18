import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { HourLog, Volunteer } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { HoursClient } from "./hours-client";

export const metadata: Metadata = {
  title: "Hour Logs",
};

export type HourLogRow = HourLog & {
  volunteerName: string;
  studentName: string | null;
};

export default async function HoursPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: logs }, { data: volunteers }] = await Promise.all([
    supabase
      .from("hour_logs")
      .select("*, volunteers(name), students(display_name)")
      .order("updated_at", { ascending: false }),
    supabase.from("volunteers").select("id, name").order("name"),
  ]);

  type RawLog = HourLog & {
    volunteers: { name: string } | null;
    students: { display_name: string } | null;
  };

  const rows: HourLogRow[] = ((logs ?? []) as unknown as RawLog[]).map(
    ({ volunteers: v, students: s, ...log }) => ({
      ...log,
      volunteerName: v?.name ?? "Unknown",
      studentName: s?.display_name ?? null,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hour Logs"
        description="Review, approve, and export volunteer tutoring hours."
      />
      <HoursClient
        logs={rows}
        volunteers={(volunteers ?? []) as Pick<Volunteer, "id" | "name">[]}
      />
    </div>
  );
}
