"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Clock, Download, Pencil, X } from "lucide-react";
import { reviewHourLog, updateHourLogDuration } from "@/lib/actions/hours";
import { APPROVAL_STATUSES, SUBJECTS } from "@/lib/constants";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatDuration } from "@/lib/format";
import type { Volunteer } from "@/lib/types";
import type { HourLogRow } from "./page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

const ALL = "all";

type HoursClientProps = {
  logs: HourLogRow[];
  volunteers: Pick<Volunteer, "id" | "name">[];
};

export function HoursClient({ logs, volunteers }: HoursClientProps) {
  const [statusTab, setStatusTab] = useState("Pending");
  const [volunteerFilter, setVolunteerFilter] = useState(ALL);
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [editTarget, setEditTarget] = useState<HourLogRow | null>(null);
  const [editDuration, setEditDuration] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (statusTab !== ALL && log.approval_status !== statusTab) return false;
      if (volunteerFilter !== ALL && log.volunteer_id !== volunteerFilter)
        return false;
      if (subjectFilter !== ALL && log.subject_category !== subjectFilter)
        return false;
      return true;
    });
  }, [logs, statusTab, volunteerFilter, subjectFilter]);

  const pendingCount = logs.filter(
    (log) => log.approval_status === "Pending"
  ).length;

  function handleReview(log: HourLogRow, status: "Approved" | "Rejected") {
    if (pending) return;
    startTransition(async () => {
      const result = await reviewHourLog({ id: log.id, approval_status: status });
      if (result.ok) {
        toast.success(
          status === "Approved" ? "Hours approved." : "Hours rejected."
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  function openEdit(log: HourLogRow) {
    setEditTarget(log);
    setEditDuration(String(log.duration_minutes));
  }

  function handleEditSave() {
    if (!editTarget || pending) return;
    startTransition(async () => {
      const result = await updateHourLogDuration(
        editTarget.id,
        Number(editDuration)
      );
      if (result.ok) {
        toast.success("Duration updated.");
        setEditTarget(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleExport() {
    const csv = toCsv(
      ["Volunteer", "Student", "Subject", "Duration (minutes)", "Status", "Summary"],
      filtered.map((log) => [
        log.volunteerName,
        log.studentName ?? "",
        log.subject_category,
        log.duration_minutes,
        log.approval_status,
        log.short_summary ?? "",
      ])
    );
    downloadCsv("nurturestem-hour-logs.csv", csv);
    toast.success(`Exported ${filtered.length} logs.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList>
            <TabsTrigger value="Pending">
              Pending{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </TabsTrigger>
            {APPROVAL_STATUSES.filter((s) => s !== "Pending").map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
            <TabsTrigger value={ALL}>All</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <Select value={volunteerFilter} onValueChange={setVolunteerFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All volunteers</SelectItem>
              {volunteers.map((volunteer) => (
                <SelectItem key={volunteer.id} value={volunteer.id}>
                  {volunteer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All subjects</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={
            statusTab === "Pending"
              ? "No pending hour logs"
              : "No hour logs found"
          }
          description={
            statusTab === "Pending"
              ? "You're all caught up. New submissions will appear here."
              : "Try adjusting the filters above."
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.volunteerName}
                  </TableCell>
                  <TableCell>
                    {log.studentName ?? (
                      <span className="text-muted-foreground">Group</span>
                    )}
                  </TableCell>
                  <TableCell>{log.subject_category}</TableCell>
                  <TableCell>{formatDuration(log.duration_minutes)}</TableCell>
                  <TableCell className="max-w-56">
                    <p className="truncate text-muted-foreground">
                      {log.short_summary ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.approval_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {log.approval_status === "Pending" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Approve"
                            disabled={pending}
                            onClick={() => handleReview(log, "Approved")}
                          >
                            <Check className="text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reject"
                            disabled={pending}
                            onClick={() => handleReview(log, "Rejected")}
                          >
                            <X className="text-destructive" />
                          </Button>
                        </>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit duration"
                        disabled={pending}
                        onClick={() => openEdit(log)}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit duration</DialogTitle>
            <DialogDescription>
              Correct the duration for {editTarget?.volunteerName}&apos;s{" "}
              {editTarget?.subject_category} session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={480}
              step={5}
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
