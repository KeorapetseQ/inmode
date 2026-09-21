import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "reset"]).catch("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — InMode" },
      { name: "description", content: "Sign in or create your InMode workspace account." },
      { property: "og:title", content: "Sign in — InMode" },
      { property: "og:description", content: "Access your InMode tasks, notes and AI assistant." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("Check your inbox to confirm your email address, then sign in.");
        } else {
          toast.success("Welcome to InMode");
          void navigate({ to: "/dashboard" });
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        void navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("Password reset link sent. Check your email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signup" ? "Create your workspace" : mode === "reset" ? "Reset password" : "Welcome back";

  return (
    <div className="flex min-h-screen items-center justify-center aurora px-5 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkle className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">InMode</span>
        </Link>

        <div className="rounded-2xl border border-border glass p-6">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "reset"
              ? "We'll email you a secure link."
              : "Tasks, notes and your AI assistant in one place."}
          </p>

          {sent ? (
            <p className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
              {sent}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {mode !== "reset" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "reset"
                      ? "Send reset link"
                      : "Sign in"}
              </Button>
            </form>
          )}

          <div className="mt-5 space-y-2 text-center text-sm text-muted-foreground">
            {mode === "signin" && (
              <>
                <p>
                  New here?{" "}
                  <Link to="/auth" search={{ mode: "signup" }} className="text-primary">
                    Create an account
                  </Link>
                </p>
                <p>
                  <Link to="/auth" search={{ mode: "reset" }} className="text-primary">
                    Forgot your password?
                  </Link>
                </p>
              </>
            )}
            {mode !== "signin" && (
              <p>
                <Link to="/auth" search={{ mode: "signin" }} className="text-primary">
                  Back to sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
