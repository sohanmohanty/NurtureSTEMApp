import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/shared/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  return (
    <AppShell role={profile.role} name={profile.name || profile.email}>
      {children}
    </AppShell>
  );
}
