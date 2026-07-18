import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock, GraduationCap, Users } from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { createClient } from "@/lib/supabase/server";
import { minutesToHoursNumber } from "@/lib/format";
import type { PublicStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Public Impact",
};

export const revalidate = 3600;

export default async function PublicImpactPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_impact_stats");
  const stats = (data ?? { enabled: false }) as PublicStats;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <LogoMark className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">NurtureSTEM</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/login">Team sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <Badge variant="secondary" className="mb-4">
            Est. {stats.enabled ? stats.program_start_year : 2024}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Our impact so far
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            {stats.enabled
              ? stats.mission_statement
              : "NurtureSTEM is a student-led STEM education initiative where high-school volunteers help elementary and middle-school students build confidence in math and science."}
          </p>
        </section>

        {stats.enabled ? (
          <>
            <section className="mx-auto max-w-4xl px-6 pb-12">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                    <GraduationCap className="h-7 w-7 text-primary" />
                    <p className="text-3xl font-semibold">
                      {stats.students_reached}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Students reached
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                    <Users className="h-7 w-7 text-primary" />
                    <p className="text-3xl font-semibold">
                      {stats.volunteer_tutors}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Volunteer tutors
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                    <Clock className="h-7 w-7 text-primary" />
                    <p className="text-3xl font-semibold">
                      {minutesToHoursNumber(stats.approved_minutes)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Approved tutoring hours
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 pb-16">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <p className="font-medium">STEM subjects supported</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {stats.subjects_supported.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-4xl px-6 pb-16 text-center text-muted-foreground">
            <p>Impact numbers are not published right now. Check back soon.</p>
          </section>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-6 text-center text-sm text-muted-foreground">
          NurtureSTEM — a student-led STEM education initiative. This page only
          shows aggregate program data.
        </div>
      </footer>
    </div>
  );
}
