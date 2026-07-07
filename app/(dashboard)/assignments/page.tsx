import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { Student, Volunteer } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsClient } from "./assignments-client";

export const metadata: Metadata = {
  title: "Assignments",
};

export type ActiveAssignmentRow = {
  id: string;
  studentName: string;
  studentId: string;
  volunteerName: string;
  volunteerId: string;
  subjectFocus: string;
};

export default async function AssignmentsPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: students }, { data: volunteers }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("archived", false)
        .order("created_at"),
      supabase
        .from("volunteers")
        .select("*")
        .eq("archived", false)
        .order("name"),
      supabase
        .from("assignments")
        .select(
          "id, student_id, volunteer_id, students(display_name, subject_focus), volunteers(name)"
        )
        .eq("status", "Active")
        .order("created_at", { ascending: false }),
    ]);

  type RawAssignment = {
    id: string;
    student_id: string;
    volunteer_id: string;
    students: { display_name: string; subject_focus: string } | null;
    volunteers: { name: string } | null;
  };

  const activeAssignments: ActiveAssignmentRow[] = (
    (assignments ?? []) as unknown as RawAssignment[]
  ).map((a) => ({
    id: a.id,
    studentId: a.student_id,
    volunteerId: a.volunteer_id,
    studentName: a.students?.display_name ?? "Unknown",
    subjectFocus: a.students?.subject_focus ?? "",
    volunteerName: a.volunteers?.name ?? "Unknown",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment Manager"
        description="Match waitlisted and unassigned students with volunteer tutors. Assignments are only created when you confirm them."
      />
      <AssignmentsClient
        students={(students ?? []) as Student[]}
        volunteers={(volunteers ?? []) as Volunteer[]}
        activeAssignments={activeAssignments}
      />
    </div>
  );
}
