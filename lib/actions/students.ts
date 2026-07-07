"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { studentSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function revalidateStudentPaths() {
  revalidatePath("/students");
  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  revalidatePath("/reports");
}

export async function createStudent(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the student details and try again." };
  }
  const { error: dbError } = await supabase.from("students").insert({
    ...parsed.data,
    grade_num: parsed.data.grade_num ?? null,
  });
  if (dbError) return { ok: false, error: "Could not add the student." };
  revalidateStudentPaths();
  return { ok: true };
}

export async function updateStudent(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the student details and try again." };
  }
  const { error: dbError } = await supabase
    .from("students")
    .update({
      ...parsed.data,
      grade_num: parsed.data.grade_num ?? null,
    })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the student." };
  revalidateStudentPaths();
  revalidatePath(`/students/${id}`);
  return { ok: true };
}

export async function setStudentArchived(
  id: string,
  archived: boolean
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const { error: dbError } = await supabase
    .from("students")
    .update({ archived })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the student." };
  revalidateStudentPaths();
  return { ok: true };
}
