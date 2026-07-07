"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createTrainingItem,
  deleteTrainingItem,
  updateTrainingItem,
} from "@/lib/actions/training";
import type { TrainingItem } from "@/lib/types";
import type { VolunteerTrainingSummary } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmAction } from "@/components/shared/confirm-action";

type TrainingClientProps = {
  items: TrainingItem[];
  summaries: VolunteerTrainingSummary[];
};

export function TrainingClient({ items, summaries }: TrainingClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingItem | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: TrainingItem) {
    setEditing(item);
    setFormOpen(true);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Checklist items</CardTitle>
            <CardDescription>
              The onboarding steps every volunteer completes.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus />
            Add item
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No training items yet"
              description="Create the first onboarding checklist item for volunteers."
              action={
                <Button onClick={openCreate}>
                  <Plus />
                  Add item
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
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
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil />
                    </Button>
                    <ConfirmAction
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="text-destructive" />
                        </Button>
                      }
                      title="Delete this training item?"
                      description={`"${item.title}" and all volunteer progress on it will be removed. Consider editing instead if the step is changing.`}
                      confirmLabel="Delete"
                      destructive
                      action={() => deleteTrainingItem(item.id)}
                      successMessage="Item deleted."
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volunteer completion</CardTitle>
          <CardDescription>
            Open a volunteer profile to check off individual items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <EmptyState
              title="No volunteers yet"
              description="Volunteer training progress will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map(({ volunteer, completedCount }) => (
                  <TableRow key={volunteer.id}>
                    <TableCell>
                      <Link
                        href={`/volunteers/${volunteer.id}`}
                        className="font-medium hover:underline"
                      >
                        {volunteer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {completedCount}/{items.length} items
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={volunteer.training_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit training item" : "Add training item"}
            </DialogTitle>
            <DialogDescription>
              Keep items short and actionable.
            </DialogDescription>
          </DialogHeader>
          <TrainingItemFormFields
            key={editing?.id ?? "new"}
            item={editing}
            onClose={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrainingItemFormFields({
  item,
  onClose,
}: {
  item: TrainingItem | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [required, setRequired] = useState(item?.required ?? true);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const input = { title, description: description || null, required };
      const result = item
        ? await updateTrainingItem(item.id, input)
        : await createTrainingItem(input);
      if (result.ok) {
        toast.success(item ? "Item updated." : "Item created.");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="t_title">Title</Label>
        <Input
          id="t_title"
          required
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="t_description">Description (optional)</Label>
        <Textarea
          id="t_description"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Label className="flex cursor-pointer items-center gap-2 font-normal">
        <Checkbox
          checked={required}
          onCheckedChange={(checked) => setRequired(checked === true)}
        />
        Required for training completion
      </Label>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : item ? "Save changes" : "Add item"}
        </Button>
      </DialogFooter>
    </form>
  );
}
