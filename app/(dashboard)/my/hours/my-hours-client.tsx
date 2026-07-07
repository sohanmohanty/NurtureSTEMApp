"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { submitHourLog } from "@/lib/actions/hours";
import { SUBJECTS, SUMMARY_MAX_LENGTH } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import type { AssignedStudentOption, MyHourLogRow } from "./page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

const GROUP = "group";
const DURATIONS = [30, 45, 60, 75, 90, 120];

type MyHoursClientProps = {
  volunteerId: string;
  students: AssignedStudentOption[];
  logs: MyHourLogRow[];
};

export function MyHoursClient({
  volunteerId,
  students,
  logs,
}: MyHoursClientProps) {
  const [studentId, setStudentId] = useState<string>(
    students[0]?.id ?? GROUP
  );
  const [duration, setDuration] = useState("60");
  const [subject, setSubject] = useState<string>("Math");
  const [summary, setSummary] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const sum = (status: string) =>
      logs
        .filter((log) => log.approval_status === status)
        .reduce((acc, log) => acc + log.duration_minutes, 0);
    return {
      approved: sum("Approved"),
      pending: sum("Pending"),
      rejected: sum("Rejected"),
    };
  }, [logs]);

  const filtered = useMemo(() => {
    if (statusTab === "all") return logs;
    return logs.filter((log) => log.approval_status === statusTab);
  }, [logs, statusTab]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const result = await submitHourLog({
        volunteer_id: volunteerId,
        student_id: studentId === GROUP ? null : studentId,
        duration_minutes: Number(duration),
        subject_category: subject,
        short_summary: summary || null,
      });
      if (result.ok) {
        toast.success("Hours submitted for approval.");
        setSummary("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Log a session</CardTitle>
          <CardDescription>
            Submitted hours stay pending until an admin approves them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student or group</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.display_name}
                    </SelectItem>
                  ))}
                  <SelectItem value={GROUP}>Group session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {formatDuration(minutes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="log_summary">Short summary (optional)</Label>
                <span className="text-xs text-muted-foreground">
                  {summary.length}/{SUMMARY_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="log_summary"
                maxLength={SUMMARY_MAX_LENGTH}
                placeholder="e.g. Practiced fractions with visual models"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Keep it short and public-safe. No personal or sensitive details.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Submitting..." : "Submit hours"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-xl font-semibold text-success">
                {formatDuration(totals.approved)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold">
                {formatDuration(totals.pending)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-xl font-semibold text-muted-foreground">
                {formatDuration(totals.rejected)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Approved">Approved</TabsTrigger>
            <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No hour logs yet"
            description="Sessions you log will appear here with their approval status."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.studentName ?? (
                        <span className="text-muted-foreground">Group</span>
                      )}
                    </TableCell>
                    <TableCell>{log.subject_category}</TableCell>
                    <TableCell>{formatDuration(log.duration_minutes)}</TableCell>
                    <TableCell>
                      <StatusBadge status={log.approval_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
