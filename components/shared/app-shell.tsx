"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Atom,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Timer,
  UserRound,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/volunteers", label: "Volunteers", icon: Users },
  { href: "/assignments", label: "Assignments", icon: UsersRound },
  { href: "/hours", label: "Hour Logs", icon: Clock },
  { href: "/training", label: "Training", icon: ClipboardCheck },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/reports", label: "Impact Reports", icon: BarChart3 },
  { href: "/my/students", label: "My Students", icon: UserRound },
  { href: "/my/hours", label: "My Hours", icon: Timer },
  { href: "/settings", label: "Settings", icon: Settings },
];

const VOLUNTEER_NAV: NavItem[] = [
  { href: "/my", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/my/students", label: "My Students", icon: GraduationCap },
  { href: "/my/hours", label: "My Hours", icon: Clock },
  { href: "/my/training", label: "Training", icon: ClipboardCheck },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

const ADVISOR_NAV: NavItem[] = [
  { href: "/reports", label: "Impact Reports", icon: BarChart3 },
  { href: "/impact", label: "Public Impact Page", icon: Globe },
];

function navForRole(role: Role): NavItem[] {
  if (role === "admin") return ADMIN_NAV;
  if (role === "advisor") return ADVISOR_NAV;
  return VOLUNTEER_NAV;
}

type AppShellProps = {
  role: Role;
  name: string;
  children: React.ReactNode;
};

export function AppShell({ role, name, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navForRole(role);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/my" || href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-6 py-5">
      <div className="rounded-lg bg-primary p-1.5">
        <Atom className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-sidebar-accent-foreground">
          NurtureSTEM Ops
        </p>
        <p className="text-xs capitalize text-sidebar-muted">{role}</p>
      </div>
    </div>
  );

  const footer = (
    <div className="border-t border-sidebar-accent px-6 py-4">
      <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
        {name}
      </p>
      <button
        onClick={handleSignOut}
        className="mt-2 flex items-center gap-2 text-sm text-sidebar-muted transition-colors hover:text-sidebar-accent-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-sidebar lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-sidebar px-4 py-3 lg:hidden no-print">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1">
            <Atom className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-accent-foreground">
            NurtureSTEM Ops
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
            {brand}
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-6 lg:ml-60 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
