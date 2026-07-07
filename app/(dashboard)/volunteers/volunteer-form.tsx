"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createVolunteer, updateVolunteer } from "@/lib/actions/volunteers";
import type { Subject, Volunteer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { SubjectCheckboxes } from "@/components/shared/subject-checkboxes";

const NONE = "none";

type VolunteerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: Volunteer | null;
};

export function VolunteerFormDialog({
  open,
  onOpenChange,
  volunteer,
}: VolunteerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {volunteer ? "Edit volunteer" : "Add volunteer"}
          </DialogTitle>
          <DialogDescription>
            Volunteer details are only visible to admins. Notes should stay
            general and non-sensitive.
          </DialogDescription>
        </DialogHeader>
        <VolunteerFormFields
          key={volunteer?.id ?? "new"}
          volunteer={volunteer}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function VolunteerFormFields({
  volunteer,
  onClose,
}: {
  volunteer: Volunteer | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(volunteer?.name ?? "");
  const [email, setEmail] = useState(volunteer?.email ?? "");
  const [gradeLevel, setGradeLevel] = useState<string>(
    volunteer?.grade_level ? String(volunteer.grade_level) : NONE
  );
  const [subjects, setSubjects] = useState<Subject[]>(
    volunteer?.subject_strengths ?? []
  );
  const [maxCapacity, setMaxCapacity] = useState(
    String(volunteer?.max_capacity ?? 3)
  );
  const [active, setActive] = useState(volunteer?.active_status ?? true);
  const [adminNote, setAdminNote] = useState(volunteer?.admin_note ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (subjects.length === 0) {
      toast.error("Select at least one subject strength.");
      return;
    }
    startTransition(async () => {
      const input = {
        name,
        email,
        grade_level: gradeLevel === NONE ? null : Number(gradeLevel),
        subject_strengths: subjects,
        max_capacity: Number(maxCapacity),
        active_status: active,
        availability_note: volunteer?.availability_note ?? null,
        admin_note: adminNote || null,
      };
      const result = volunteer
        ? await updateVolunteer(volunteer.id, input)
        : await createVolunteer(input);
      if (result.ok) {
        toast.success(volunteer ? "Volunteer updated." : "Volunteer added.");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v_name">Name</Label>
          <Input
            id="v_name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v_email">Email</Label>
          <Input
            id="v_email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Grade level (optional)</Label>
        <Select value={gradeLevel} onValueChange={setGradeLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Not specified</SelectItem>
            {["9", "10", "11", "12"].map((grade) => (
              <SelectItem key={grade} value={grade}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subject strengths</Label>
        <SubjectCheckboxes selected={subjects} onChange={setSubjects} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v_capacity">Max student capacity</Label>
          <Input
            id="v_capacity"
            type="number"
            min={0}
            max={20}
            required
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Active status</Label>
          <Label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 font-normal">
            <Checkbox
              checked={active}
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            Available for assignments
          </Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="v_note">Admin note (general, non-sensitive)</Label>
        <Textarea
          id="v_note"
          maxLength={300}
          placeholder="e.g. Very reliable, prefers weekend sessions"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
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
          {pending ? "Saving..." : volunteer ? "Save changes" : "Add volunteer"}
        </Button>
      </DialogFooter>
    </form>
  );
}
