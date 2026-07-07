"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import {
  setUserRole,
  updateAppSettings,
  updateOwnName,
} from "@/lib/actions/profile";
import { ROLES } from "@/lib/constants";
import type { AppSettings, Profile, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type SettingsClientProps = {
  profile: Profile;
  settings: AppSettings | null;
  profiles: Profile[];
};

export function SettingsClient({
  profile,
  settings,
  profiles,
}: SettingsClientProps) {
  const [name, setName] = useState(profile.name);
  const [publicEnabled, setPublicEnabled] = useState(
    settings?.public_page_enabled ?? true
  );
  const [mission, setMission] = useState(settings?.mission_statement ?? "");
  const [startYear, setStartYear] = useState(
    String(settings?.program_start_year ?? 2024)
  );
  const [announcement, setAnnouncement] = useState(
    settings?.announcement ?? ""
  );
  const [pending, startTransition] = useTransition();

  function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const result = await updateOwnName(name);
      if (result.ok) toast.success("Name updated.");
      else toast.error(result.error);
    });
  }

  function handleSaveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const result = await updateAppSettings({
        public_page_enabled: publicEnabled,
        mission_statement: mission,
        program_start_year: Number(startYear),
        announcement: announcement || null,
      });
      if (result.ok) toast.success("Settings saved.");
      else toast.error(result.error);
    });
  }

  function handleRoleChange(profileId: string, role: Role) {
    startTransition(async () => {
      const result = await setUserRole(profileId, role);
      if (result.ok) toast.success("Role updated.");
      else toast.error(result.error);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Signed in as {profile.email} ({profile.role})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p_name">Display name</Label>
              <Input
                id="p_name"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending}>
              Save name
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.role === "admin" && settings ? (
        <Card>
          <CardHeader>
            <CardTitle>Public impact page</CardTitle>
            <CardDescription>
              Controls the public page at{" "}
              <Link href="/impact" className="inline-flex items-center gap-1 text-primary hover:underline">
                /impact
                <ExternalLink className="h-3 w-3" />
              </Link>
              . It only ever shows aggregate numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <Label className="flex cursor-pointer items-center gap-2 font-normal">
                <Checkbox
                  checked={publicEnabled}
                  onCheckedChange={(checked) =>
                    setPublicEnabled(checked === true)
                  }
                />
                Public impact page enabled
              </Label>
              <div className="space-y-2">
                <Label htmlFor="s_mission">Mission statement</Label>
                <Textarea
                  id="s_mission"
                  required
                  maxLength={500}
                  rows={4}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s_announcement">
                  Program announcement (shown to volunteers)
                </Label>
                <Textarea
                  id="s_announcement"
                  maxLength={500}
                  rows={3}
                  placeholder="e.g. Summer session starts June 15. Submit hours by Friday each week."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s_year">Program start year</Label>
                <Input
                  id="s_year"
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending}>
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {profile.role === "admin" ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User roles</CardTitle>
            <CardDescription>
              New signups start as volunteers. Promote trusted users to admin
              or grant advisors read-only access to aggregate reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead className="w-40">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.name || "—"}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      {row.setup_complete ? (
                        <Badge variant="success">Complete</Badge>
                      ) : (
                        <Badge variant="muted">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.role}
                        onValueChange={(value) =>
                          handleRoleChange(row.id, value as Role)
                        }
                        disabled={pending || row.id === profile.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
