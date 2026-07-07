import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "My Students",
};

export default async function MyStudentsPage() {
  const { supabase, profile } = await requireRole(["admin", "volunteer"]);

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  type AssignmentRow = {
    id: string;
    students: {
      display_name: string;
      level: string;
      grade_num: number | null;
      subject_focus: string;
      status: string;
    } | null;
  };

  let assignments: AssignmentRow[] = [];
  if (volunteer) {
    const { data } = await supabase
      .from("assignments")
      .select(
        "id, students(display_name, level, grade_num, subject_focus, status)"
      )
      .eq("volunteer_id", volunteer.id)
      .eq("status", "Active")
      .order("created_at", { ascending: false });
    assignments = (data ?? []) as unknown as AssignmentRow[];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description="The students you are currently matched with."
      />
      {assignments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No assigned students yet"
          description="Once the program admin matches you with a student, they will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <p className="font-medium">
                    {assignment.students?.display_name ?? "Unknown"}
                  </p>
                  <StatusBadge status={assignment.students?.status ?? ""} />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="muted">
                    {assignment.students?.level}
                    {assignment.students?.grade_num
                      ? ` · Grade ${assignment.students.grade_num}`
                      : ""}
                  </Badge>
                  <Badge variant="secondary">
                    {assignment.students?.subject_focus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
