"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setTrainingProgress } from "@/lib/actions/training";
import type { TrainingItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";

export type ChecklistEntry = {
  item: TrainingItem;
  completed: boolean;
};

type TrainingChecklistProps = {
  volunteerId: string;
  entries: ChecklistEntry[];
  readOnly?: boolean;
};

export function TrainingChecklist({
  volunteerId,
  entries,
  readOnly = false,
}: TrainingChecklistProps) {
  const [pending, startTransition] = useTransition();

  function handleToggle(itemId: string, completed: boolean) {
    if (readOnly || pending) return;
    startTransition(async () => {
      const result = await setTrainingProgress(volunteerId, itemId, completed);
      if (result.ok) {
        toast.success(completed ? "Marked complete." : "Marked incomplete.");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No training items yet"
        description="Training checklist items will appear here once they are created."
      />
    );
  }

  const doneCount = entries.filter((entry) => entry.completed).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {doneCount} of {entries.length} items complete
      </p>
      <ul className="space-y-2">
        {entries.map(({ item, completed }) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <Checkbox
              checked={completed}
              disabled={readOnly || pending}
              onCheckedChange={(checked) =>
                handleToggle(item.id, checked === true)
              }
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={
                    completed
                      ? "text-sm font-medium text-muted-foreground line-through"
                      : "text-sm font-medium"
                  }
                >
                  {item.title}
                </p>
                {item.required ? (
                  <Badge variant="muted">Required</Badge>
                ) : (
                  <Badge variant="outline">Optional</Badge>
                )}
              </div>
              {item.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
