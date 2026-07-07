"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { profileSetupSchema, settingsSchema } from "@/lib/validation";
import { ROLES } from "@/lib/constants";
import type { ActionResult, Role } from "@/lib/types";

export async function completeProfileSetup(
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext();
  if (!profile) return { ok: false, error: error! };
  const parsed = profileSetupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name, setup_complete: true })
    .eq("id", profile.id);
  if (profileError) return { ok: false, error: "Could not save your profile." };

  if (profile.role === "admin" || profile.role === "volunteer") {
    const { error: claimError } = await supabase.rpc(
      "claim_or_create_volunteer",
      {
        p_name: parsed.data.name,
        p_grade_level: parsed.data.grade_level ?? null,
        p_subjects: parsed.data.subject_strengths,
      }
    );
    if (claimError) {
      return { ok: false, error: "Could not create your tutor profile." };
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateOwnName(name: string): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext();
  if (!profile) return { ok: false, error: error! };
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 100) {
    return { ok: false, error: "Please enter a valid name." };
  }
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ name: trimmed })
    .eq("id", profile.id);
  if (dbError) return { ok: false, error: "Could not update your name." };
  revalidatePath("/settings");
  return { ok: true };
}

export async function setUserRole(
  profileId: string,
  role: Role
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  if (!ROLES.includes(role)) return { ok: false, error: "Invalid role." };
  if (profileId === profile.id && role !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role." };
  }
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);
  if (dbError) return { ok: false, error: "Could not update the role." };
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateAppSettings(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the settings and try again." };
  }
  const { error: dbError } = await supabase
    .from("app_settings")
    .update(parsed.data)
    .eq("id", 1);
  if (dbError) return { ok: false, error: "Could not save the settings." };
  revalidatePath("/settings");
  revalidatePath("/impact");
  return { ok: true };
}
