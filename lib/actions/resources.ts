"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth";
import { resourceSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function createResource(input: unknown): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the resource details and try again." };
  }
  const { error: dbError } = await supabase.from("resources").insert({
    ...parsed.data,
    description: parsed.data.description || null,
    created_by: profile.id,
  });
  if (dbError) return { ok: false, error: "Could not add the resource." };
  revalidatePath("/resources");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateResource(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the resource details and try again." };
  }
  const { error: dbError } = await supabase
    .from("resources")
    .update({ ...parsed.data, description: parsed.data.description || null })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the resource." };
  revalidatePath("/resources");
  return { ok: true };
}

export async function setResourceArchived(
  id: string,
  archived: boolean
): Promise<ActionResult> {
  const { supabase, profile, error } = await getActionContext(["admin"]);
  if (!profile) return { ok: false, error: error! };
  const { error: dbError } = await supabase
    .from("resources")
    .update({ archived })
    .eq("id", id);
  if (dbError) return { ok: false, error: "Could not update the resource." };
  revalidatePath("/resources");
  return { ok: true };
}
