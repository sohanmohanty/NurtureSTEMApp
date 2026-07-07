import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { Assignment, Student, Volunteer } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { StudentsClient } from "./students-client";

export const metadata: Metadata = {
  title: "Students",
};

export type StudentRow = Student & {
  assignedVolunteers: { assignmentId: string; volunteerName: string }[];
};

export default async function StudentsPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: students }, { data: assignments }, { data: volunteers }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("assignments")
        .select("id, student_id, volunteer_id, status, volunteers(name)")
        .eq("status", "Active"),
      supabase
        .from("volunteers")
        .select("*")
        .eq("archived", false)
        .order("name"),
    ]);

  type AssignmentWithVolunteer = Pick<
    Assignment,
    "id" | "student_id" | "volunteer_id" | "status"
  > & { volunteers: { name: string } | null };

  const assignmentRows = (assignments ??
    []) as unknown as AssignmentWithVolunteer[];
  const rows: StudentRow[] = ((students ?? []) as Student[]).map((student) => ({
    ...student,
    assignedVolunteers: assignmentRows
      .filter((a) => a.student_id === student.id)
      .map((a) => ({
        assignmentId: a.id,
        volunteerName: a.volunteers?.name ?? "Unknown",
      })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage the student roster with minimal, privacy-safe information."
      />
      <StudentsClient
        students={rows}
        volunteers={(volunteers ?? []) as Volunteer[]}
      />
    </div>
  );
}
