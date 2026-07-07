"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Something went wrong</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page could not be loaded. Check your connection and try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
