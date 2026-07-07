import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { TrainingItem, TrainingProgress } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TrainingChecklist,
  type ChecklistEntry,
} from "@/components/shared/training-checklist";

export const metadata: Metadata = {
  title: "Training",
};

export default async function MyTrainingPage() {
  const { supabase, profile } = await requireRole(["admin", "volunteer"]);

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!volunteer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Training" />
        <EmptyState
          title="No tutor profile found"
          description="Your volunteer tutor profile has not been created yet. Contact the program admin."
        />
      </div>
    );
  }

  const [{ data: items }, { data: progress }] = await Promise.all([
    supabase.from("training_items").select("*").order("sort_order"),
    supabase
      .from("volunteer_training_progress")
      .select("*")
      .eq("volunteer_id", volunteer.id),
  ]);

  const progressMap = new Map(
    ((progress ?? []) as TrainingProgress[]).map((p) => [p.training_item_id, p])
  );
  const checklist: ChecklistEntry[] = ((items ?? []) as TrainingItem[]).map(
    (item) => ({
      item,
      completed: progressMap.get(item.id)?.completed ?? false,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        description="Complete these onboarding steps before your first session."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Onboarding checklist</CardTitle>
          <CardDescription>
            Check items off as you complete them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrainingChecklist volunteerId={volunteer.id} entries={checklist} />
        </CardContent>
      </Card>
    </div>
  );
}
