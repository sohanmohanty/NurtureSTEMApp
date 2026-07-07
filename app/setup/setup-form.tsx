"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeProfileSetup } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectCheckboxes } from "@/components/shared/subject-checkboxes";
import type { Role, Subject } from "@/lib/types";

type SetupFormProps = {
  defaultName: string;
  role: Role;
};

export function SetupForm({ defaultName, role }: SetupFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pending, startTransition] = useTransition();

  const isTutorRole = role === "admin" || role === "volunteer";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (isTutorRole && subjects.length === 0) {
      toast.error("Select at least one subject strength.");
      return;
    }
    startTransition(async () => {
      const result = await completeProfileSetup({
        name,
        grade_level: gradeLevel ? Number(gradeLevel) : null,
        subject_strengths: isTutorRole ? subjects : ["General STEM"],
      });
      if (result.ok) {
        toast.success("Profile saved. Welcome!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set up your profile</CardTitle>
        <CardDescription>
          {isTutorRole
            ? "Tell us about your tutoring background so you can be matched with students."
            : "Confirm your details to continue."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {isTutorRole ? (
            <>
              <div className="space-y-2">
                <Label>Grade level (optional)</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
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
            </>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Finish setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
