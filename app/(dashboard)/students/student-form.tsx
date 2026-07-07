"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createStudent, updateStudent } from "@/lib/actions/students";
import { STUDENT_LEVELS, STUDENT_STATUSES, SUBJECTS } from "@/lib/constants";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
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

type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
};

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
}: StudentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? "Edit student" : "Add student"}</DialogTitle>
          <DialogDescription>
            Only a display name and program details are stored. Never add
            contact details, addresses, or other sensitive information.
          </DialogDescription>
        </DialogHeader>
        <StudentFormFields
          key={student?.id ?? "new"}
          student={student}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function StudentFormFields({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(student?.display_name ?? "");
  const [level, setLevel] = useState<string>(student?.level ?? "Elementary");
  const [gradeNum, setGradeNum] = useState(
    student?.grade_num ? String(student.grade_num) : ""
  );
  const [subjectFocus, setSubjectFocus] = useState<string>(
    student?.subject_focus ?? "Math"
  );
  const [status, setStatus] = useState<string>(student?.status ?? "Waitlisted");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const input = {
        display_name: displayName,
        level,
        grade_num: gradeNum ? Number(gradeNum) : null,
        subject_focus: subjectFocus,
        status,
      };
      const result = student
        ? await updateStudent(student.id, input)
        : await createStudent(input);
      if (result.ok) {
        toast.success(student ? "Student updated." : "Student added.");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          required
          maxLength={80}
          placeholder="e.g. Ava R."
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade_num">Grade (optional)</Label>
          <Input
            id="grade_num"
            type="number"
            min={1}
            max={8}
            value={gradeNum}
            onChange={(e) => setGradeNum(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject focus</Label>
          <Select value={subjectFocus} onValueChange={setSubjectFocus}>
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
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : student ? "Save changes" : "Add student"}
        </Button>
      </DialogFooter>
    </form>
  );
}
