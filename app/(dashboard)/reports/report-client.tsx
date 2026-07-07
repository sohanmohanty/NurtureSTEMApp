"use client";

import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatDuration } from "@/lib/format";
import type { ProgramStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubjectBarChart } from "@/components/charts/subject-bar";

export function ReportClient({ stats }: { stats: ProgramStats }) {
  const topSubjects = Object.entries(stats.students_by_subject).sort(
    (a, b) => b[1] - a[1]
  );

  const metrics: [string, string | number][] = [
    ["Total students reached", stats.total_students],
    ["Active students", stats.active_students],
    ["Waitlisted students", stats.waitlisted_students],
    ["Total volunteers", stats.total_volunteers],
    ["Active volunteers", stats.active_volunteers],
    ["Total approved tutoring hours", formatDuration(stats.approved_minutes)],
    ["Sessions logged", stats.total_logs],
    ["Active assignments", stats.active_assignments],
    [
      "Average approved hours per volunteer",
      formatDuration(stats.avg_approved_minutes_per_volunteer),
    ],
  ];

  function handleExportCsv() {
    const rows: (string | number)[][] = metrics.map(([label, value]) => [
      label,
      value,
    ]);
    rows.push([]);
    rows.push(["Most requested subjects", ""]);
    for (const [subject, count] of topSubjects) {
      rows.push([subject, count]);
    }
    downloadCsv(
      "nurturestem-impact-report.csv",
      toCsv(["Metric", "Value"], rows)
    );
    toast.success("Report exported.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 no-print">
        <Button variant="outline" onClick={handleExportCsv}>
          <Download />
          Export CSV
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer />
          Print / Save as PDF
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="text-lg font-semibold">Impact summary</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            NurtureSTEM connects high-school volunteers with elementary and
            middle-school students to build confidence in math and science.
            This report summarizes aggregate program activity while minimizing
            student data collection.
          </p>
          <p className="text-xs text-muted-foreground">
            NurtureSTEM is a student-led STEM education initiative.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {metrics.map(([label, value]) => (
                <TableRow key={label}>
                  <TableCell className="text-muted-foreground">{label}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most requested subjects</CardTitle>
            <CardDescription>Students by subject focus</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSubjects.map(([subject, count]) => (
                  <TableRow key={subject}>
                    <TableCell>{subject}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      </div>
    </div>
  );
}
