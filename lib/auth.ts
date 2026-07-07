import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
}

export async function requireProfile() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || !profile.setup_complete) redirect("/setup");
  return { supabase, user, profile };
}

export async function requireRole(roles: Role[]) {
  const context = await requireProfile();
  if (!roles.includes(context.profile.role)) {
    redirect(context.profile.role === "advisor" ? "/reports" : "/my");
  }
  return context;
}

export async function getActionContext(roles?: Role[]) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile) {
    return { supabase, profile: null, error: "Not authenticated" };
  }
  if (roles && !roles.includes(profile.role)) {
    return { supabase, profile: null, error: "Not authorized" };
  }
  return { supabase, profile, error: null };
}
