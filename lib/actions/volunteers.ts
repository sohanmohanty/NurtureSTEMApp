"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { volunteerSchema, volunteerSelfSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function revalidateVolunteerPaths() {
  revalidatePath("/volunteers");
  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  revalidatePath("/my");
}

export async function createVolunteer(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = volunteerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the volunteer details and try again." };
  }
  const { error: dbError } = await supabase.from("volunteers").insert({
    ...parsed.data,
    grade_level: parsed.data.grade_level ?? null,
    availability_note: parsed.data.availability_note || null,
    admin_note: parsed.data.admin_note || null,
  });
  if (dbError) return { ok: false, error: "Could not add the volunteer." };
  revalidateVolunteerPaths();
  return { ok: true };
}

export async function updateVolunteer(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = volunteerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the volunteer details and try again." };
  }
  const { error: dbError } = await supabase
    .from("volunteers")
    .update({
      ...parsed.data,
      grade_level: parsed.data.grade_level ?? null,
      availability_note: parsed.data.availability_note || null,
      admin_note: parsed.data.admin_note || null,
    })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the volunteer." };
  revalidateVolunteerPaths();
  revalidatePath(`/volunteers/${id}`);
  return { ok: true };
}

export async function setVolunteerArchived(
  id: string,
  archived: boolean
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const { error: dbError } = await supabase
    .from("volunteers")
    .update({ archived, active_status: archived ? false : true })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the volunteer." };
  revalidateVolunteerPaths();
  return { ok: true };
}

export async function updateOwnVolunteerProfile(
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext([
    "admin",
    "volunteer",
  ]);
  if (!profile) return { ok: false, error: error! };
  const parsed = volunteerSelfSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!volunteer) return { ok: false, error: "No volunteer profile found." };
  const { error: dbError } = await supabase
    .from("volunteers")
    .update({
      subject_strengths: parsed.data.subject_strengths,
      availability_note: parsed.data.availability_note || null,
      active_status: parsed.data.active_status,
    })
    .eq("id", volunteer.id);
  if (dbError) return { ok: false, error: "Could not update your profile." };
  revalidatePath("/my");
  revalidateVolunteerPaths();
  return { ok: true };
}
