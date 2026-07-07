import Link from "next/link";
import type { Metadata } from "next";
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Megaphone,
  XCircle,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type {
  AppSettings,
  HourLog,
  TrainingItem,
  TrainingProgress,
  Volunteer,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AvailabilityForm } from "./availability-form";

export const metadata: Metadata = {
  title: "My Dashboard",
};

export default async function MyDashboardPage() {
  const { supabase, profile } = await requireRole(["admin", "volunteer"]);

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!volunteer) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Dashboard" />
        <EmptyState
          title="No tutor profile found"
          description="Your volunteer tutor profile has not been created yet. Contact the program admin."
        />
      </div>
    );
  }

  const volunteerData = volunteer as Volunteer;

  const [
    { data: assignments },
    { data: logs },
    { data: trainingItems },
    { data: progress },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, status, students(display_name)")
      .eq("volunteer_id", volunteerData.id)
      .eq("status", "Active"),
    supabase
      .from("hour_logs")
      .select("duration_minutes, approval_status")
      .eq("volunteer_id", volunteerData.id),
    supabase.from("training_items").select("*").order("sort_order"),
    supabase
      .from("volunteer_training_progress")
      .select("*")
      .eq("volunteer_id", volunteerData.id),
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const hourLogs = (logs ?? []) as Pick<
    HourLog,
    "duration_minutes" | "approval_status"
  >[];
  const sumBy = (status: string) =>
    hourLogs
      .filter((log) => log.approval_status === status)
      .reduce((sum, log) => sum + log.duration_minutes, 0);

  const items = (trainingItems ?? []) as TrainingItem[];
  const completedIds = new Set(
    ((progress ?? []) as TrainingProgress[])
      .filter((p) => p.completed)
      .map((p) => p.training_item_id)
  );
  const doneCount = items.filter((item) => completedIds.has(item.id)).length;
  const announcement = (settings as AppSettings | null)?.announcement;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${volunteerData.name.split(" ")[0]}`}
        description="Your tutoring at a glance."
      >
        <Button asChild>
          <Link href="/my/hours">
            <Clock />
            Log hours
          </Link>
        </Button>
      </PageHeader>

      {announcement ? (
        <Card className="border-primary/30 bg-accent">
          <CardContent className="flex items-start gap-3 p-4">
            <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Program announcement</p>
              <p className="text-sm text-accent-foreground">{announcement}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Approved hours"
          value={formatDuration(sumBy("Approved"))}
          icon={CheckCircle2}
        />
        <StatCard
          label="Pending hours"
          value={formatDuration(sumBy("Pending"))}
          icon={Clock}
        />
        <StatCard
          label="Rejected hours"
          value={formatDuration(sumBy("Rejected"))}
          icon={XCircle}
        />
        <StatCard
          label="Assigned students"
          value={assignments?.length ?? 0}
          icon={GraduationCap}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Training progress</CardTitle>
            <CardDescription>
              {doneCount} of {items.length} checklist items complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: items.length
                      ? `${Math.round((doneCount / items.length) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <StatusBadge status={volunteerData.training_status} />
            </div>
            <Button variant="outline" asChild>
              <Link href="/my/training">View checklist</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability & strengths</CardTitle>
            <CardDescription>
              Keep your subjects and availability up to date so matches fit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityForm
              subjectStrengths={volunteerData.subject_strengths}
              availabilityNote={volunteerData.availability_note}
              activeStatus={volunteerData.active_status}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
