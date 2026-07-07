import Link from "next/link";
import {
  Atom,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Student rosters",
    description:
      "Track students with minimal data: display name, level, subject focus, and status.",
  },
  {
    icon: Users,
    title: "Volunteer tutors",
    description:
      "Coordinate high-school volunteers, their subject strengths, capacity, and training.",
  },
  {
    icon: ClipboardCheck,
    title: "Smart matching",
    description:
      "Match waitlisted students with volunteers based on subjects, capacity, and readiness.",
  },
  {
    icon: Clock,
    title: "Hour tracking",
    description:
      "Volunteers log tutoring hours and admins approve them with a clear review flow.",
  },
  {
    icon: BookOpen,
    title: "Resource library",
    description:
      "Organize worksheets, slide decks, lesson plans, and activities by subject and level.",
  },
  {
    icon: BarChart3,
    title: "Impact reporting",
    description:
      "Generate aggregate reports on students reached, hours tutored, and program growth.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <Atom className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">NurtureSTEM Ops</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/impact">Public Impact</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Atom className="h-4 w-4 text-primary" />
            Internal operations platform
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Run NurtureSTEM with clarity and care
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            NurtureSTEM Ops helps coordinate student rosters, volunteer tutors,
            tutoring assignments, training, hours, resources, and impact
            reporting for the NurtureSTEM STEM education initiative.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">Sign in to your dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Join as a volunteer</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            A student-led STEM education initiative, founded in 2024. Built to
            collect as little student data as possible.
          </p>
        </section>

        <section className="border-t bg-card/50">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="space-y-2 p-5">
                    <div className="inline-flex rounded-lg bg-accent p-2 text-accent-foreground">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>NurtureSTEM — a student-led STEM education initiative</p>
          <Link href="/impact" className="hover:text-foreground">
            View public impact
          </Link>
        </div>
      </footer>
    </div>
  );
}
