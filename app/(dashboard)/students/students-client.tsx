"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { setStudentArchived } from "@/lib/actions/students";
import { STUDENT_LEVELS, STUDENT_STATUSES, SUBJECTS } from "@/lib/constants";
import type { Student, Volunteer } from "@/lib/types";
import type { StudentRow } from "./page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmAction } from "@/components/shared/confirm-action";
import {
  SortableHead,
  type SortDirection,
} from "@/components/shared/sortable-head";
import { StudentFormDialog } from "./student-form";
import { AssignDialog } from "./assign-dialog";

const ALL = "all";

type StudentSortKey = "name" | "level" | "subject" | "status" | "volunteer";

function compareStudents(a: StudentRow, b: StudentRow, key: StudentSortKey) {
  switch (key) {
    case "name":
      return a.display_name.localeCompare(b.display_name);
    case "level": {
      const rank = (s: StudentRow) =>
        (s.level === "Elementary" ? 0 : 100) + (s.grade_num ?? 0);
      return rank(a) - rank(b);
    }
    case "subject":
      return a.subject_focus.localeCompare(b.subject_focus);
    case "status":
      return (
        STUDENT_STATUSES.indexOf(a.status) - STUDENT_STATUSES.indexOf(b.status)
      );
    case "volunteer": {
      const name = (s: StudentRow) =>
        s.assignedVolunteers[0]?.volunteerName ?? "";
      return name(a).localeCompare(name(b));
    }
  }
}

type StudentsClientProps = {
  students: StudentRow[];
  volunteers: Volunteer[];
};

export function StudentsClient({ students, volunteers }: StudentsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [levelFilter, setLevelFilter] = useState(ALL);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [assignTarget, setAssignTarget] = useState<StudentRow | null>(null);
  const [sortKey, setSortKey] = useState<StudentSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  function handleSort(key: StudentSortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (!showArchived && student.archived) return false;
      if (showArchived && !student.archived) return false;
      if (query && !student.display_name.toLowerCase().includes(query))
        return false;
      if (statusFilter !== ALL && student.status !== statusFilter) return false;
      if (subjectFilter !== ALL && student.subject_focus !== subjectFilter)
        return false;
      if (levelFilter !== ALL && student.level !== levelFilter) return false;
      return true;
    });
  }, [students, search, statusFilter, subjectFilter, levelFilter, showArchived]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareStudents(a, b, sortKey) * factor
    );
  }, [filtered, sortKey, sortDir]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {STUDENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All levels</SelectItem>
                {STUDENT_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? "Show active" : "Show archived"}
            </Button>
          </div>
          <Button onClick={openCreate}>
            <Plus />
            Add student
          </Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={
            showArchived ? "No archived students" : "No students found"
          }
          description={
            students.length === 0
              ? "Add your first student to start building the roster."
              : "Try adjusting your search or filters."
          }
          action={
            students.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus />
                Add student
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead
                  label="Display Name"
                  active={sortKey === "name"}
                  direction={sortDir}
                  onSort={() => handleSort("name")}
                />
                <SortableHead
                  label="Level"
                  active={sortKey === "level"}
                  direction={sortDir}
                  onSort={() => handleSort("level")}
                />
                <SortableHead
                  label="Subject Focus"
                  active={sortKey === "subject"}
                  direction={sortDir}
                  onSort={() => handleSort("subject")}
                />
                <SortableHead
                  label="Status"
                  active={sortKey === "status"}
                  direction={sortDir}
                  onSort={() => handleSort("status")}
                />
                <SortableHead
                  label="Assigned Volunteer"
                  active={sortKey === "volunteer"}
                  direction={sortDir}
                  onSort={() => handleSort("volunteer")}
                />
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium hover:underline"
                    >
                      {student.display_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {student.level}
                    {student.grade_num ? ` · Gr ${student.grade_num}` : ""}
                  </TableCell>
                  <TableCell>{student.subject_focus}</TableCell>
                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>
                  <TableCell>
                    {student.assignedVolunteers.length > 0 ? (
                      student.assignedVolunteers
                        .map((a) => a.volunteerName)
                        .join(", ")
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(student)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setAssignTarget(student)}
                        >
                          <UserPlus />
                          Assign volunteer
                        </DropdownMenuItem>
                        <ConfirmAction
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              {student.archived ? (
                                <ArchiveRestore />
                              ) : (
                                <Archive />
                              )}
                              {student.archived ? "Restore" : "Archive"}
                            </DropdownMenuItem>
                          }
                          title={
                            student.archived
                              ? "Restore student?"
                              : "Archive student?"
                          }
                          description={
                            student.archived
                              ? `${student.display_name} will reappear in the active roster.`
                              : `${student.display_name} will be hidden from the active roster. Their history is kept.`
                          }
                          confirmLabel={
                            student.archived ? "Restore" : "Archive"
                          }
                          destructive={!student.archived}
                          action={() =>
                            setStudentArchived(student.id, !student.archived)
                          }
                          successMessage={
                            student.archived
                              ? "Student restored."
                              : "Student archived."
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
      />
      <AssignDialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null);
        }}
        studentId={assignTarget?.id ?? null}
        studentName={assignTarget?.display_name ?? ""}
        volunteers={volunteers}
      />
    </div>
  );
}
