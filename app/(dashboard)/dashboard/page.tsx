import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  Activity,
  BookOpen,
  Clock,
  GraduationCap,
  Hourglass,
  ListChecks,
  UserCheck,
  Users,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import type { ProgramStats } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubjectBarChart } from "@/components/charts/subject-bar";
import {
  VolunteerLoadChart,
  type VolunteerLoadRow,
} from "@/components/charts/volunteer-load";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();
  if (profile.role === "volunteer") redirect("/my");
  if (profile.role === "advisor") redirect("/reports");

  const [
    { data: statsData, error: statsError },
    { data: volunteerRows },
    { data: assignmentRows },
  ] = await Promise.all([
    supabase.rpc("get_program_stats"),
    supabase
      .from("volunteers")
      .select("id, name, max_capacity")
      .eq("archived", false)
      .eq("active_status", true),
    supabase.from("assignments").select("volunteer_id").eq("status", "Active"),
  ]);

  if (statsError || !statsData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <EmptyState
          title="Could not load dashboard data"
          description="Check your Supabase connection and make sure the database schema has been applied."
        />
      </div>
    );
  }

  const stats = statsData as ProgramStats;

  const assignedCounts = new Map<string, number>();
  for (const row of (assignmentRows ?? []) as { volunteer_id: string }[]) {
    assignedCounts.set(
      row.volunteer_id,
      (assignedCounts.get(row.volunteer_id) ?? 0) + 1
    );
  }
  const volunteerLoad: VolunteerLoadRow[] = (
    (volunteerRows ?? []) as { id: string; name: string; max_capacity: number }[]
  )
    .map((v) => {
      const assigned = assignedCounts.get(v.id) ?? 0;
      return {
        name: v.name,
        assigned,
        open: Math.max(0, v.max_capacity - assigned),
      };
    })
    .sort((a, b) => b.assigned - a.assigned || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live overview of NurtureSTEM program operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Students reached"
          value={stats.total_students}
          icon={GraduationCap}
        />
        <StatCard
          label="Active students"
          value={stats.active_students}
          icon={UserCheck}
        />
        <StatCard
          label="Waitlisted students"
          value={stats.waitlisted_students}
          icon={Hourglass}
        />
        <StatCard
          label="Active volunteers"
          value={stats.active_volunteers}
          icon={Users}
        />
        <StatCard
          label="Approved tutoring hours"
          value={formatDuration(stats.approved_minutes)}
          icon={Clock}
        />
        <StatCard
          label="Pending hour approvals"
          value={stats.pending_logs}
          icon={Activity}
        />
        <StatCard
          label="Active matches"
          value={stats.active_assignments}
          icon={ListChecks}
        />
        <StatCard
          label="Resources available"
          value={stats.resources_count}
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Students by subject focus</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectBarChart data={stats.students_by_subject} label="Students" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Volunteers by subject strength</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectBarChart
              data={stats.volunteers_by_subject}
              color="var(--chart-3)"
              label="Volunteers"
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Volunteer tutor load</CardTitle>
          </CardHeader>
          <CardContent>
            <VolunteerLoadChart data={volunteerLoad} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
