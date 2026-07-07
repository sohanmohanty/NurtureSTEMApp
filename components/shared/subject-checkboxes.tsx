"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SUBJECTS } from "@/lib/constants";
import type { Subject } from "@/lib/types";

type SubjectCheckboxesProps = {
  selected: Subject[];
  onChange: (subjects: Subject[]) => void;
};

export function SubjectCheckboxes({
  selected,
  onChange,
}: SubjectCheckboxesProps) {
  function toggle(subject: Subject, checked: boolean) {
    if (checked) {
      onChange([...selected, subject]);
    } else {
      onChange(selected.filter((s) => s !== subject));
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {SUBJECTS.map((subject) => (
        <Label
          key={subject}
          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
        >
          <Checkbox
            checked={selected.includes(subject)}
            onCheckedChange={(checked) => toggle(subject, checked === true)}
          />
          {subject}
        </Label>
      ))}
    </div>
  );
}
