"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createAssignment } from "@/lib/actions/assignments";
import type { Volunteer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName: string;
  volunteers: Volunteer[];
};

export function AssignDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  volunteers,
}: AssignDialogProps) {
  const [volunteerId, setVolunteerId] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAssign() {
    if (!studentId || !volunteerId || pending) return;
    startTransition(async () => {
      const result = await createAssignment({
        student_id: studentId,
        volunteer_id: volunteerId,
      });
      if (result.ok) {
        toast.success(`${studentName} assigned.`);
        setVolunteerId("");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a volunteer</DialogTitle>
          <DialogDescription>
            Choose a volunteer tutor for {studentName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Volunteer</Label>
          <Select value={volunteerId} onValueChange={setVolunteerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a volunteer" />
            </SelectTrigger>
            <SelectContent>
              {volunteers.map((volunteer) => (
                <SelectItem key={volunteer.id} value={volunteer.id}>
                  {volunteer.name}
                  {volunteer.active_status ? "" : " (inactive)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={pending || !volunteerId}>
            {pending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
