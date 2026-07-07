import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Atom } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = {
  title: "Profile setup",
};

export default async function SetupPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.setup_complete) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="rounded-lg bg-primary p-1.5">
          <Atom className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">NurtureSTEM Ops</span>
      </div>
      <div className="w-full max-w-md">
        <SetupForm
          defaultName={profile?.name ?? ""}
          role={profile?.role ?? "volunteer"}
        />
      </div>
    </div>
  );
}
