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
import { StatusPieChart } from "@/components/charts/status-pie";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();
  if (profile.role === "volunteer") redirect("/my");
  if (profile.role === "advisor") redirect("/reports");

  const { data: statsData, error: statsError } =
    await supabase.rpc("get_program_stats");

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
            <CardTitle>Student status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={stats.students_by_status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
