import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { Resource } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { ResourcesClient } from "./resources-client";

export const metadata: Metadata = {
  title: "Resources",
};

export default async function ResourcesPage() {
  const { supabase, profile } = await requireRole(["admin", "volunteer"]);

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Library"
        description="Worksheets, slide decks, lesson plans, and activities for tutoring sessions."
      />
      <ResourcesClient
        resources={(resources ?? []) as Resource[]}
        isAdmin={profile.role === "admin"}
      />
    </div>
  );
}
