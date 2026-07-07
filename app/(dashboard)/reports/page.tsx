import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { ProgramStats } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportClient } from "./report-client";

export const metadata: Metadata = {
  title: "Impact Reports",
};

export default async function ReportsPage() {
  const { supabase } = await requireRole(["admin", "advisor"]);

  const { data, error } = await supabase.rpc("get_program_stats");

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Impact Reports" />
        <EmptyState
          title="Could not load report data"
          description="Check your Supabase connection and make sure the database schema has been applied."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impact Reports"
        description="Aggregate program metrics for NurtureSTEM, a student-led STEM education initiative."
      />
      <ReportClient stats={data as ProgramStats} />
    </div>
  );
}
