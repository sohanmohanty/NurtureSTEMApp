"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { trainingItemSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function revalidateTrainingPaths() {
  revalidatePath("/training");
  revalidatePath("/my/training");
  revalidatePath("/volunteers");
  revalidatePath("/my");
}

export async function createTrainingItem(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = trainingItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the item details." };
  const { data: last } = await supabase
    .from("training_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error: dbError } = await supabase.from("training_items").insert({
    ...parsed.data,
    description: parsed.data.description || null,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (dbError) return { ok: false, error: "Could not create the item." };
  revalidateTrainingPaths();
  return { ok: true };
}

export async function updateTrainingItem(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = trainingItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the item details." };
  const { error: dbError } = await supabase
    .from("training_items")
    .update({ ...parsed.data, description: parsed.data.description || null })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the item." };
  revalidateTrainingPaths();
  return { ok: true };
}

export async function deleteTrainingItem(id: string): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const { error: dbError } = await supabase
    .from("training_items")
    .delete()
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not delete the item." };
  revalidateTrainingPaths();
  return { ok: true };
}

export async function setTrainingProgress(
  volunteerId: string,
  trainingItemId: string,
  completed: boolean
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext([
    "admin",
    "volunteer",
  ]);
  if (!profile) return { ok: false, error: error! };

  if (profile.role !== "admin") {
    const { data: ownVolunteer } = await supabase
      .from("volunteers")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (!ownVolunteer || ownVolunteer.id !== volunteerId) {
      return { ok: false, error: "You can only update your own checklist." };
    }
  }

  const { error: dbError } = await supabase
    .from("volunteer_training_progress")
    .upsert(
      {
        volunteer_id: volunteerId,
        training_item_id: trainingItemId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "volunteer_id,training_item_id" }
    );
  if (dbError) return { ok: false, error: "Could not update the checklist." };
  revalidateTrainingPaths();
  revalidatePath(`/volunteers/${volunteerId}`);
  return { ok: true };
}
