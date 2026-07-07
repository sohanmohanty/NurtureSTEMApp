"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

type SortableHeadProps = {
  label: string;
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
  className?: string;
};

export function SortableHead({
  label,
  active,
  direction,
  onSort,
  className,
}: SortableHeadProps) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
