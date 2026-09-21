import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useUpdateProfile, useNotes, useTasks } from "@/lib/workspace";
import { useTheme, type Theme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — InMode" },
      { name: "description", content: "Manage your profile, appearance, notifications and data." },
      { property: "og:title", content: "Settings — InMode" },
      { property: "og:description", content: "Account, appearance, notifications and data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const { data: tasks } = useTasks();
  const { data: notes } = useNotes();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ name: "", username: "", bio: "", profile_image: "" });
  const [password, setPassword] = useState({ current: "", next: "" });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      profile_image: profile.profile_image ?? "",
    });
  }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: form.name,
        username: form.username,
        bio: form.bio,
        profile_image: form.profile_image || null,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      password: password.next,
      // @ts-expect-error current_password is supported by Lovable Cloud auth
      current_password: password.current,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password changed");
    setPassword({ current: "", next: "" });
  }

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ profile, tasks: tasks ?? [], notes: notes ?? [] }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inmode-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function signOutEverywhere() {
    await supabase.auth.signOut({ scope: "global" });
    queryClient.clear();
    void navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Member since {profile ? new Date(profile.created_at).toLocaleDateString() : "—"}
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="flex-wrap">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4">
          <form onSubmit={saveProfile} className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar">Profile picture URL</Label>
              <Input
                id="avatar"
                value={form.profile_image}
                onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <div className="max-w-lg space-y-3 rounded-xl border border-border bg-card p-5">
            {(["dark", "light", "system"] as Theme[]).map((t) => (
              <label key={t} className="flex cursor-pointer items-center justify-between">
                <span className="text-sm capitalize">{t} theme</span>
                <input
                  type="radio"
                  name="theme"
                  checked={theme === t}
                  onChange={() => setTheme(t)}
                  className="accent-primary"
                />
              </label>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
            {[
              { key: "notify_task_reminders" as const, label: "Task reminders" },
              { key: "notify_deadlines" as const, label: "Deadline reminders" },
              { key: "notify_ai" as const, label: "AI notifications" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <span className="text-sm">{row.label}</span>
                <Switch
                  checked={profile?.[row.key] ?? true}
                  onCheckedChange={(v) => updateProfile.mutate({ [row.key]: v })}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <form
            onSubmit={changePassword}
            className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">New password</Label>
              <Input
                id="next"
                type="password"
                minLength={6}
                value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Change password</Button>
              <Button type="button" variant="outline" onClick={signOutEverywhere}>
                Log out from all devices
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-sm font-medium">Export your data</h2>
              <p className="text-xs text-muted-foreground">
                Download your profile, tasks and notes as JSON.
              </p>
              <Button className="mt-3" size="sm" variant="outline" onClick={exportData}>
                Export
              </Button>
            </div>
            <div className="border-t border-border pt-4">
              <h2 className="text-sm font-medium text-destructive">Delete account</h2>
              <p className="text-xs text-muted-foreground">
                Account deletion is permanent. Contact support from your registered email to confirm
                deletion of your workspace.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
