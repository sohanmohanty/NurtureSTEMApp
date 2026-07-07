"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { hourLogSchema, hourReviewSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function revalidateHourPaths() {
  revalidatePath("/hours");
  revalidatePath("/my/hours");
  revalidatePath("/my");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function submitHourLog(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext([
    "admin",
    "volunteer",
  ]);
  if (!profile) return { ok: false, error: error! };
  const parsed = hourLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the log details and try again." };
  }

  const { data: ownVolunteer } = await supabase
    .from("volunteers")
    .select("id, name")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!ownVolunteer || parsed.data.volunteer_id !== ownVolunteer.id) {
    return { ok: false, error: "You can only log hours for yourself." };
  }

  const { error: dbError } = await supabase.from("hour_logs").insert({
    volunteer_id: parsed.data.volunteer_id,
    student_id: parsed.data.student_id ?? null,
    duration_minutes: parsed.data.duration_minutes,
    subject_category: parsed.data.subject_category,
    short_summary: parsed.data.short_summary || null,
  });
  if (dbError) return { ok: false, error: "Could not submit the hour log." };

  revalidateHourPaths();
  return { ok: true };
}

export async function reviewHourLog(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = hourReviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid review." };

  const update: Record<string, unknown> = {
    approval_status: parsed.data.approval_status,
    approved_by: profile.id,
  };
  if (parsed.data.duration_minutes !== undefined) {
    update.duration_minutes = parsed.data.duration_minutes;
  }

  const { error: dbError } = await supabase
    .from("hour_logs")
    .update(update)
    .eq("id", parsed.data.id);
  if (dbError) return { ok: false, error: "Could not update the hour log." };

  revalidateHourPaths();
  return { ok: true };
}

export async function updateHourLogDuration(
  id: string,
  durationMinutes: number
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 5 ||
    durationMinutes > 480
  ) {
    return { ok: false, error: "Duration must be between 5 and 480 minutes." };
  }
  const { error: dbError } = await supabase
    .from("hour_logs")
    .update({ duration_minutes: durationMinutes })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the duration." };
  revalidateHourPaths();
  return { ok: true };
}
