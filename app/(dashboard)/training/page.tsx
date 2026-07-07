import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { TrainingItem, TrainingProgress, Volunteer } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { TrainingClient } from "./training-client";

export const metadata: Metadata = {
  title: "Training",
};

export type VolunteerTrainingSummary = {
  volunteer: Pick<Volunteer, "id" | "name" | "training_status" | "archived">;
  completedCount: number;
};

export default async function TrainingPage() {
  const { supabase } = await requireRole(["admin"]);

  const [{ data: items }, { data: volunteers }, { data: progress }] =
    await Promise.all([
      supabase.from("training_items").select("*").order("sort_order"),
      supabase
        .from("volunteers")
        .select("id, name, training_status, archived")
        .eq("archived", false)
        .order("name"),
      supabase
        .from("volunteer_training_progress")
        .select("volunteer_id, completed"),
    ]);

  const completedCounts = new Map<string, number>();
  for (const entry of (progress ?? []) as Pick<
    TrainingProgress,
    "volunteer_id" | "completed"
  >[]) {
    if (entry.completed) {
      completedCounts.set(
        entry.volunteer_id,
        (completedCounts.get(entry.volunteer_id) ?? 0) + 1
      );
    }
  }

  const summaries: VolunteerTrainingSummary[] = (
    (volunteers ?? []) as VolunteerTrainingSummary["volunteer"][]
  ).map((volunteer) => ({
    volunteer,
    completedCount: completedCounts.get(volunteer.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        description="Manage the volunteer onboarding checklist and track completion."
      />
      <TrainingClient
        items={(items ?? []) as TrainingItem[]}
        summaries={summaries}
      />
    </div>
  );
}
