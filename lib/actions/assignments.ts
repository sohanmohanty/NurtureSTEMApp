"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { assignmentSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function revalidateAssignmentPaths() {
  revalidatePath("/assignments");
  revalidatePath("/students");
  revalidatePath("/volunteers");
  revalidatePath("/dashboard");
  revalidatePath("/my");
  revalidatePath("/my/students");
}

export async function createAssignment(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid assignment." };
  const { student_id, volunteer_id } = parsed.data;

  const [{ data: student }, { data: volunteer }] = await Promise.all([
    supabase
      .from("students")
      .select("id, display_name, status, archived")
      .eq("id", student_id)
      .single(),
    supabase
      .from("volunteers")
      .select("id, name, archived")
      .eq("id", volunteer_id)
      .single(),
  ]);
  if (!student || student.archived) {
    return { ok: false, error: "Student not found." };
  }
  if (!volunteer || volunteer.archived) {
    return { ok: false, error: "Volunteer not found." };
  }

  const { error: insertError } = await supabase.from("assignments").insert({
    student_id,
    volunteer_id,
  });
  if (insertError) {
    return {
      ok: false,
      error: "This student is already assigned to that volunteer.",
    };
  }

  if (student.status === "Waitlisted") {
    await supabase
      .from("students")
      .update({ status: "Matched" })
      .eq("id", student_id);
  }

  revalidateAssignmentPaths();
  return { ok: true };
}

export async function endAssignment(id: string): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const { error: dbError } = await supabase
    .from("assignments")
    .update({ status: "Ended", end_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not end the assignment." };
  revalidateAssignmentPaths();
  return { ok: true };
}
