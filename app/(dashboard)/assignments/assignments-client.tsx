"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Hourglass, Sparkles, Unlink, UsersRound } from "lucide-react";
import { createAssignment, endAssignment } from "@/lib/actions/assignments";
import { rankCandidates } from "@/lib/matching";
import { cn } from "@/lib/utils";
import type { Student, Volunteer } from "@/lib/types";
import type { ActiveAssignmentRow } from "./page";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmAction } from "@/components/shared/confirm-action";

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 45) return "text-amber-600";
  return "text-destructive";
}

type AssignmentsClientProps = {
  students: Student[];
  volunteers: Volunteer[];
  activeAssignments: ActiveAssignmentRow[];
};

export function AssignmentsClient({
  students,
  volunteers,
  activeAssignments,
}: AssignmentsClientProps) {
  const assignedStudentIds = new Set(
    activeAssignments.map((assignment) => assignment.studentId)
  );
  const needsTutor = students.filter(
    (s) => !assignedStudentIds.has(s.id) && s.status !== "Completed"
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    needsTutor[0]?.id ?? null
  );
  const [pending, startTransition] = useTransition();

  const assignedCounts = new Map<string, number>();
  for (const assignment of activeAssignments) {
    assignedCounts.set(
      assignment.volunteerId,
      (assignedCounts.get(assignment.volunteerId) ?? 0) + 1
    );
  }

  const selectedStudent = needsTutor.find((s) => s.id === selectedId) ?? null;

  const candidates = selectedStudent
    ? rankCandidates(selectedStudent, volunteers, assignedCounts)
    : [];

  function handleAssign(volunteerId: string, volunteerName: string) {
    if (!selectedStudent || pending) return;
    startTransition(async () => {
      const result = await createAssignment({
        student_id: selectedStudent.id,
        volunteer_id: volunteerId,
      });
      if (result.ok) {
        toast.success(
          `${selectedStudent.display_name} assigned to ${volunteerName}.`
        );
        setSelectedId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Students needing a tutor</CardTitle>
            <CardDescription>
              Waitlisted and unassigned students. Select one to see suggested
              matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {needsTutor.length === 0 ? (
              <EmptyState
                icon={Hourglass}
                title="Everyone has a tutor"
                description="Waitlisted or unassigned students will appear here, ready to be matched."
              />
            ) : (
              <ul className="space-y-2">
                {needsTutor.map((student) => (
                  <li key={student.id}>
                    <button
                      onClick={() => setSelectedId(student.id)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                        selectedId === student.id
                          ? "border-primary bg-accent"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {student.display_name}
                        </span>
                        <StatusBadge status={student.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {student.level} · {student.subject_focus}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Suggested matches
            </CardTitle>
            <CardDescription>
              {selectedStudent
                ? `Ranked volunteers for ${selectedStudent.display_name} (${selectedStudent.subject_focus})`
                : "Select a student to see suggestions."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedStudent ? (
              <EmptyState
                icon={UsersRound}
                title="No student selected"
                description="Pick a student from the list to view scored volunteer matches."
              />
            ) : candidates.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="No volunteers available"
                description="Add volunteer tutors before creating assignments."
              />
            ) : (
              <ul className="space-y-2">
                {candidates.map(({ volunteer, score, reasons, assignedCount }) => (
                  <li
                    key={volunteer.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                        scoreColor(score)
                      )}
                    >
                      {score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {volunteer.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {assignedCount}/{volunteer.max_capacity} students
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {reasons.map((reason) => (
                          <Badge key={reason} variant="muted">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => handleAssign(volunteer.id, volunteer.name)}
                    >
                      Assign
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active assignments</CardTitle>
          <CardDescription>
            {activeAssignments.length} active match
            {activeAssignments.length === 1 ? "" : "es"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <EmptyState
              title="No active assignments"
              description="Assign a student to a volunteer to create the first match."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.studentName}
                    </TableCell>
                    <TableCell>{assignment.volunteerName}</TableCell>
                    <TableCell>{assignment.subjectFocus}</TableCell>
                    <TableCell>
                      <ConfirmAction
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Unlink />
                            Unassign
                          </Button>
                        }
                        title="End this assignment?"
                        description={`${assignment.studentName} will no longer be assigned to ${assignment.volunteerName}. Past hour logs are kept.`}
                        confirmLabel="End assignment"
                        destructive
                        action={() => endAssignment(assignment.id)}
                        successMessage="Assignment ended."
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
