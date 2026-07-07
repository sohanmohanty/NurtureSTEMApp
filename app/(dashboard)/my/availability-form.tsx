"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOwnVolunteerProfile } from "@/lib/actions/volunteers";
import type { Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubjectCheckboxes } from "@/components/shared/subject-checkboxes";

type AvailabilityFormProps = {
  subjectStrengths: Subject[];
  availabilityNote: string | null;
  activeStatus: boolean;
};

export function AvailabilityForm({
  subjectStrengths,
  availabilityNote,
  activeStatus,
}: AvailabilityFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>(subjectStrengths);
  const [note, setNote] = useState(availabilityNote ?? "");
  const [active, setActive] = useState(activeStatus);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (subjects.length === 0) {
      toast.error("Select at least one subject strength.");
      return;
    }
    startTransition(async () => {
      const result = await updateOwnVolunteerProfile({
        subject_strengths: subjects,
        availability_note: note || null,
        active_status: active,
      });
      if (result.ok) toast.success("Profile updated.");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject strengths</Label>
        <SubjectCheckboxes selected={subjects} onChange={setSubjects} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="availability">Availability note (optional)</Label>
        <Textarea
          id="availability"
          maxLength={200}
          placeholder="e.g. Weekdays after 4pm, weekends flexible"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Label className="flex cursor-pointer items-center gap-2 font-normal">
        <Checkbox
          checked={active}
          onCheckedChange={(checked) => setActive(checked === true)}
        />
        I am available for new assignments
      </Label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
