import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import type { AppSettings, Profile } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { supabase, profile } = await requireProfile();

  let settings: AppSettings | null = null;
  let profiles: Profile[] = [];

  if (profile.role === "admin") {
    const [{ data: settingsData }, { data: profilesData }] = await Promise.all([
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("profiles").select("*").order("created_at"),
    ]);
    settings = settingsData as AppSettings | null;
    profiles = (profilesData ?? []) as Profile[];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and program configuration."
      />
      <SettingsClient
        profile={profile}
        settings={settings}
        profiles={profiles}
      />
    </div>
  );
}
