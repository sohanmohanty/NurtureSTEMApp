import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type {
  HourLog,
  TrainingItem,
  TrainingProgress,
  Volunteer,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  TrainingChecklist,
  type ChecklistEntry,
} from "@/components/shared/training-checklist";

export const metadata: Metadata = {
  title: "Volunteer profile",
};

export default async function VolunteerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireRole(["admin"]);

  const [
    { data: volunteer },
    { data: assignments },
    { data: logs },
    { data: trainingItems },
    { data: progress },
  ] = await Promise.all([
    supabase.from("volunteers").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("assignments")
      .select("id, status, students(id, display_name, subject_focus, level)")
      .eq("volunteer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("hour_logs")
      .select("duration_minutes, approval_status")
      .eq("volunteer_id", id),
    supabase.from("training_items").select("*").order("sort_order"),
    supabase
      .from("volunteer_training_progress")
      .select("*")
      .eq("volunteer_id", id),
  ]);

  if (!volunteer) notFound();
  const volunteerData = volunteer as Volunteer;

  const hourLogs = (logs ?? []) as Pick<
    HourLog,
    "duration_minutes" | "approval_status"
  >[];
  const sumBy = (status: string) =>
    hourLogs
      .filter((log) => log.approval_status === status)
      .reduce((sum, log) => sum + log.duration_minutes, 0);

  type AssignmentRow = {
    id: string;
    status: string;
    students: {
      id: string;
      display_name: string;
      subject_focus: string;
      level: string;
    } | null;
  };
  const assignmentRows = (assignments ?? []) as unknown as AssignmentRow[];
  const activeAssignments = assignmentRows.filter((a) => a.status === "Active");

  const progressMap = new Map(
    ((progress ?? []) as TrainingProgress[]).map((p) => [p.training_item_id, p])
  );
  const checklist: ChecklistEntry[] = ((trainingItems ?? []) as TrainingItem[]).map(
    (item) => ({
      item,
      completed: progressMap.get(item.id)?.completed ?? false,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={volunteerData.name}
        description="Volunteer tutor profile and training progress."
      >
        <Button variant="outline" asChild>
          <Link href="/volunteers">
            <ArrowLeft />
            Back to volunteers
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate pl-4">{volunteerData.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grade level</span>
                <span>
                  {volunteerData.grade_level
                    ? `Grade ${volunteerData.grade_level}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={volunteerData.active_status ? "success" : "muted"}>
                  {volunteerData.active_status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Training</span>
                <StatusBadge status={volunteerData.training_status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span>
                  {activeAssignments.length}/{volunteerData.max_capacity} students
                </span>
              </div>
              <div className="space-y-1.5 border-t pt-4">
                <span className="text-muted-foreground">Subject strengths</span>
                <div className="flex flex-wrap gap-1">
                  {volunteerData.subject_strengths.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              {volunteerData.availability_note ? (
                <div className="space-y-1 border-t pt-4">
                  <span className="text-muted-foreground">Availability</span>
                  <p>{volunteerData.availability_note}</p>
                </div>
              ) : null}
              {volunteerData.admin_note ? (
                <div className="space-y-1 border-t pt-4">
                  <span className="text-muted-foreground">Admin note</span>
                  <p>{volunteerData.admin_note}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-semibold">
                  {formatDuration(sumBy("Approved"))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span>{formatDuration(sumBy("Pending"))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rejected</span>
                <span>{formatDuration(sumBy("Rejected"))}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned students</CardTitle>
            <CardDescription>Active tutoring assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <EmptyState
                title="No assigned students"
                description="Match this volunteer with a student from the Assignments page."
              />
            ) : (
              <ul className="space-y-2">
                {activeAssignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <Link
                      href={`/students/${assignment.students?.id}`}
                      className="font-medium hover:underline"
                    >
                      {assignment.students?.display_name ?? "Unknown"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {assignment.students?.level} ·{" "}
                      {assignment.students?.subject_focus}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training checklist</CardTitle>
            <CardDescription>
              Check items off as this volunteer completes onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainingChecklist volunteerId={id} entries={checklist} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
