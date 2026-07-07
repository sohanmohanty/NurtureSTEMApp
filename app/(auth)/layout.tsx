import Link from "next/link";
import { Atom } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="rounded-lg bg-primary p-1.5">
          <Atom className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">NurtureSTEM Ops</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
