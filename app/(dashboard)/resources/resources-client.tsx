"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  ExternalLink,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import {
  createResource,
  setResourceArchived,
  updateResource,
} from "@/lib/actions/resources";
import { RESOURCE_TYPES, STUDENT_LEVELS, SUBJECTS } from "@/lib/constants";
import type { Resource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmAction } from "@/components/shared/confirm-action";

const ALL = "all";
const LEVELS = [...STUDENT_LEVELS, "All Levels"] as const;

type ResourcesClientProps = {
  resources: Resource[];
  isAdmin: boolean;
};

export function ResourcesClient({ resources, isAdmin }: ResourcesClientProps) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [levelFilter, setLevelFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      if (!showArchived && resource.archived) return false;
      if (showArchived && !resource.archived) return false;
      if (
        query &&
        !resource.title.toLowerCase().includes(query) &&
        !(resource.description ?? "").toLowerCase().includes(query)
      )
        return false;
      if (subjectFilter !== ALL && resource.subject !== subjectFilter)
        return false;
      if (levelFilter !== ALL && resource.level !== levelFilter) return false;
      if (typeFilter !== ALL && resource.resource_type !== typeFilter)
        return false;
      return true;
    });
  }, [resources, search, subjectFilter, levelFilter, typeFilter, showArchived]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(resource: Resource) {
    setEditing(resource);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All levels</SelectItem>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdmin ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Show active" : "Show archived"}
              </Button>
              <Button onClick={openCreate}>
                <Plus />
                Add resource
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={showArchived ? "No archived resources" : "No resources found"}
          description={
            resources.length === 0
              ? "Teaching resources will appear here once they are added."
              : "Try adjusting your search or filters."
          }
          action={
            isAdmin && resources.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus />
                Add resource
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary">{resource.resource_type}</Badge>
                  {isAdmin ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(resource)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmAction
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            {resource.archived ? (
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        }
                        title={
                          resource.archived
                            ? "Restore resource?"
                            : "Archive resource?"
                        }
                        description={
                          resource.archived
                            ? `"${resource.title}" will be visible to volunteers again.`
                            : `"${resource.title}" will be hidden from volunteers.`
                        }
                        confirmLabel={resource.archived ? "Restore" : "Archive"}
                        destructive={!resource.archived}
                        action={() =>
                          setResourceArchived(resource.id, !resource.archived)
                        }
                        successMessage={
                          resource.archived
                            ? "Resource restored."
                            : "Resource archived."
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-snug">{resource.title}</p>
                  {resource.description ? (
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 text-xs">
                  <Badge variant="muted">{resource.subject}</Badge>
                  <Badge variant="muted">{resource.level}</Badge>
                </div>
                <div className="flex items-center justify-end border-t pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      Open
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit resource" : "Add resource"}
            </DialogTitle>
            <DialogDescription>
              Link to a file or external page volunteers can use in sessions.
            </DialogDescription>
          </DialogHeader>
          <ResourceFormFields
            key={editing?.id ?? "new"}
            resource={editing}
            onClose={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResourceFormFields({
  resource,
  onClose,
}: {
  resource: Resource | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [subject, setSubject] = useState<string>(resource?.subject ?? "Math");
  const [level, setLevel] = useState<string>(resource?.level ?? "All Levels");
  const [resourceType, setResourceType] = useState<string>(
    resource?.resource_type ?? "Worksheet"
  );
  const [url, setUrl] = useState(resource?.url ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const input = {
        title,
        subject,
        level,
        resource_type: resourceType,
        url,
        description: description || null,
      };
      const result = resource
        ? await updateResource(resource.id, input)
        : await createResource(input);
      if (result.ok) {
        toast.success(resource ? "Resource updated." : "Resource added.");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="r_title">Title</Label>
        <Input
          id="r_title"
          required
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={resourceType} onValueChange={setResourceType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r_url">URL</Label>
        <Input
          id="r_url"
          type="url"
          required
          maxLength={500}
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="r_description">Short description (optional)</Label>
        <Textarea
          id="r_description"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
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
          {pending ? "Saving..." : resource ? "Save changes" : "Add resource"}
        </Button>
      </DialogFooter>
    </form>
  );
}
