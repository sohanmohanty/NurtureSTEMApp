"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { setVolunteerArchived } from "@/lib/actions/volunteers";
import { SUBJECTS, TRAINING_STATUSES } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import type { Volunteer } from "@/lib/types";
import type { VolunteerRow } from "./page";
import { Badge } from "@/components/ui/badge";
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
import { VolunteerFormDialog } from "./volunteer-form";

const ALL = "all";

type VolunteerSortKey =
  | "name"
  | "subjects"
  | "capacity"
  | "status"
  | "training"
  | "approved"
  | "pending";

function compareVolunteers(
  a: VolunteerRow,
  b: VolunteerRow,
  key: VolunteerSortKey
) {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "subjects":
      return (a.subject_strengths[0] ?? "").localeCompare(
        b.subject_strengths[0] ?? ""
      );
    case "capacity":
      return a.assignedCount - b.assignedCount;
    case "status":
      return Number(b.active_status) - Number(a.active_status);
    case "training":
      return (
        TRAINING_STATUSES.indexOf(a.training_status) -
        TRAINING_STATUSES.indexOf(b.training_status)
      );
    case "approved":
      return a.approvedMinutes - b.approvedMinutes;
    case "pending":
      return a.pendingMinutes - b.pendingMinutes;
  }
}

export function VolunteersClient({
  volunteers,
}: {
  volunteers: VolunteerRow[];
}) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [activeFilter, setActiveFilter] = useState(ALL);
  const [trainingFilter, setTrainingFilter] = useState(ALL);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [sortKey, setSortKey] = useState<VolunteerSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  function handleSort(key: VolunteerSortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return volunteers.filter((volunteer) => {
      if (!showArchived && volunteer.archived) return false;
      if (showArchived && !volunteer.archived) return false;
      if (
        query &&
        !volunteer.name.toLowerCase().includes(query) &&
        !volunteer.email.toLowerCase().includes(query)
      )
        return false;
      if (
        subjectFilter !== ALL &&
        !volunteer.subject_strengths.includes(
          subjectFilter as Volunteer["subject_strengths"][number]
        )
      )
        return false;
      if (activeFilter === "active" && !volunteer.active_status) return false;
      if (activeFilter === "inactive" && volunteer.active_status) return false;
      if (trainingFilter !== ALL && volunteer.training_status !== trainingFilter)
        return false;
      return true;
    });
  }, [volunteers, search, subjectFilter, activeFilter, trainingFilter, showArchived]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareVolunteers(a, b, sortKey) * factor
    );
  }, [filtered, sortKey, sortDir]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(volunteer: Volunteer) {
    setEditing(volunteer);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
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
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="lg:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trainingFilter} onValueChange={setTrainingFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All training</SelectItem>
                {TRAINING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
            Add volunteer
          </Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={showArchived ? "No archived volunteers" : "No volunteers found"}
          description={
            volunteers.length === 0
              ? "Add your first volunteer tutor to get started."
              : "Try adjusting your search or filters."
          }
          action={
            volunteers.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus />
                Add volunteer
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
                  label="Name"
                  active={sortKey === "name"}
                  direction={sortDir}
                  onSort={() => handleSort("name")}
                />
                <SortableHead
                  label="Subject Strengths"
                  active={sortKey === "subjects"}
                  direction={sortDir}
                  onSort={() => handleSort("subjects")}
                />
                <SortableHead
                  label="Capacity"
                  active={sortKey === "capacity"}
                  direction={sortDir}
                  onSort={() => handleSort("capacity")}
                />
                <SortableHead
                  label="Status"
                  active={sortKey === "status"}
                  direction={sortDir}
                  onSort={() => handleSort("status")}
                />
                <SortableHead
                  label="Training"
                  active={sortKey === "training"}
                  direction={sortDir}
                  onSort={() => handleSort("training")}
                />
                <SortableHead
                  label="Approved Hours"
                  active={sortKey === "approved"}
                  direction={sortDir}
                  onSort={() => handleSort("approved")}
                />
                <SortableHead
                  label="Pending"
                  active={sortKey === "pending"}
                  direction={sortDir}
                  onSort={() => handleSort("pending")}
                />
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell>
                    <Link
                      href={`/volunteers/${volunteer.id}`}
                      className="font-medium hover:underline"
                    >
                      {volunteer.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {volunteer.subject_strengths.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                      {volunteer.subject_strengths.length > 3 ? (
                        <Badge variant="muted">
                          +{volunteer.subject_strengths.length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        volunteer.assignedCount >= volunteer.max_capacity
                          ? "font-medium text-warning"
                          : ""
                      }
                    >
                      {volunteer.assignedCount}/{volunteer.max_capacity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={volunteer.active_status ? "success" : "muted"}>
                      {volunteer.active_status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={volunteer.training_status} />
                  </TableCell>
                  <TableCell>{formatDuration(volunteer.approvedMinutes)}</TableCell>
                  <TableCell>
                    {volunteer.pendingMinutes > 0 ? (
                      formatDuration(volunteer.pendingMinutes)
                    ) : (
                      <span className="text-muted-foreground">—</span>
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
                        <DropdownMenuItem onSelect={() => openEdit(volunteer)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <ConfirmAction
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              {volunteer.archived ? (
                                <ArchiveRestore />
                              ) : (
                                <Archive />
                              )}
                              {volunteer.archived ? "Restore" : "Archive"}
                            </DropdownMenuItem>
                          }
                          title={
                            volunteer.archived
                              ? "Restore volunteer?"
                              : "Archive volunteer?"
                          }
                          description={
                            volunteer.archived
                              ? `${volunteer.name} will reappear in the active roster.`
                              : `${volunteer.name} will be hidden and marked inactive. Their history is kept.`
                          }
                          confirmLabel={volunteer.archived ? "Restore" : "Archive"}
                          destructive={!volunteer.archived}
                          action={() =>
                            setVolunteerArchived(volunteer.id, !volunteer.archived)
                          }
                          successMessage={
                            volunteer.archived
                              ? "Volunteer restored."
                              : "Volunteer archived."
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

      <VolunteerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        volunteer={editing}
      />
    </div>
  );
}
