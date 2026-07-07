import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type { HourLog, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Student profile",
};

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireRole(["admin"]);

  const [{ data: student }, { data: assignments }, { data: logs }] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("assignments")
        .select("id, status, volunteers(id, name)")
        .eq("student_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("hour_logs")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!student) notFound();
  const studentData = student as Student;
  const hourLogs = (logs ?? []) as HourLog[];
  const approvedMinutes = hourLogs
    .filter((log) => log.approval_status === "Approved")
    .reduce((sum, log) => sum + log.duration_minutes, 0);

  type AssignmentRow = {
    id: string;
    status: string;
    volunteers: { id: string; name: string } | null;
  };
  const assignmentRows = (assignments ?? []) as unknown as AssignmentRow[];
  const activeAssignments = assignmentRows.filter((a) => a.status === "Active");

  return (
    <div className="space-y-6">
      <PageHeader
        title={studentData.display_name}
        description="Student profile with minimal, privacy-safe information."
      >
        <Button variant="outline" asChild>
          <Link href="/students">
            <ArrowLeft />
            Back to roster
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={studentData.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Level</span>
              <span>
                {studentData.level}
                {studentData.grade_num ? ` · Grade ${studentData.grade_num}` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subject focus</span>
              <span>{studentData.subject_focus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned volunteer</span>
              <span>
                {activeAssignments.length > 0
                  ? activeAssignments
                      .map((a) => a.volunteers?.name ?? "Unknown")
                      .join(", ")
                  : "Unassigned"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground">Approved tutoring</span>
              <span className="font-semibold">
                {formatDuration(approvedMinutes)}
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-accent p-3 text-xs text-accent-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              No contact details, addresses, or meeting information are stored
              for students.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tutoring sessions</CardTitle>
            <CardDescription>
              Hour logs connected to this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourLogs.length === 0 ? (
              <EmptyState
                title="No sessions logged yet"
                description="Hour logs for this student will appear here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hourLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.subject_category}</TableCell>
                      <TableCell>{formatDuration(log.duration_minutes)}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.approval_status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
