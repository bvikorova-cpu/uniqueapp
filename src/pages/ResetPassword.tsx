import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

const MIN_PASSWORD_LENGTH = 10;

const passwordStrengthError = (pwd: string): string | null => {
  if (pwd.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  let classes = 0;
  if (/[a-z]/.test(pwd)) classes++;
  if (/[A-Z]/.test(pwd)) classes++;
  if (/\d/.test(pwd)) classes++;
  if (/[^A-Za-z0-9]/.test(pwd)) classes++;
  if (classes < 3) return "Password must contain at least 3 of: lowercase, uppercase, digit, symbol.";
  return null;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);

  // CRITICAL: only allow password change when arrived via a valid recovery link.
  // Supabase fires PASSWORD_RECOVERY on the link redirect. We refuse otherwise to
  // prevent a logged-in attacker (or another user on a shared device) from changing
  // the password without re-authenticating.
  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setRecoveryReady(true);
        setChecking(false);
      }
    });

    (async () => {
      const hash = window.location.hash || "";
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const token = url.searchParams.get("token");
      const type = url.searchParams.get("type");
      const errorDesc = url.searchParams.get("error_description") || (hash.includes("error") ? hash : null);

      try {
        if (errorDesc && !code && !tokenHash) throw new Error(errorDesc);

        // PKCE flow: ?code=...
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
          if (!cancelled) { setRecoveryReady(true); setChecking(false); }
          window.history.replaceState({}, "", url.pathname);
          return;
        }

        // OTP link: ?token_hash=...&type=recovery
        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
          if (error) throw error;
          if (!cancelled) { setRecoveryReady(true); setChecking(false); }
          window.history.replaceState({}, "", url.pathname);
          return;
        }

        // Fallback OTP flow: ?token=...&type=recovery — kept for payloads that
        // do not include token_hash in the custom auth email hook.
        if (token && type === "recovery") {
          const email = url.searchParams.get("email") || "";
          const { error } = await supabase.auth.verifyOtp({ type: "recovery", token, email });
          if (error) throw error;
          if (!cancelled) { setRecoveryReady(true); setChecking(false); }
          window.history.replaceState({}, "", url.pathname);
          return;
        }

        // Legacy hash flow: #access_token=...&type=recovery — supabase-js auto-parses.
        if (hash.includes("type=recovery")) return; // wait for PASSWORD_RECOVERY event

        // Already-authenticated recovery session (e.g. after refresh)
        const { data } = await supabase.auth.getSession();
        if (data.session && !cancelled) {
          setRecoveryReady(true);
          setChecking(false);
          return;
        }

        if (!cancelled) { setChecking(false); setRecoveryReady(false); }
      } catch (err: any) {
        console.error("[reset-password] recovery link error:", err);
        if (!cancelled) { setChecking(false); setRecoveryReady(false); }
      }
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const strengthError = passwordStrengthError(password);
    if (strengthError) {
      toast({ variant: "destructive", title: "Weak password", description: strengthError });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error resetting password", description: error.message });
      return;
    }

    // Force sign-out so the user must log in with the new password (defence-in-depth
    // against session-hijack scenarios where recovery was triggered by an attacker).
    await supabase.auth.signOut();
    toast({ title: "Password successfully changed!",
      description: "Please log in with your new password." });
    navigate("/auth", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Verifying recovery link…</p>
      </div>
    );
  }

  if (!recoveryReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center border-destructive/30">
          <CardHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <CardTitle>Invalid or expired recovery link</CardTitle>
            <CardDescription>
              This page can only be opened from a password reset email link.
              Please request a new reset link from the login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/auth", { replace: true })}>
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter a new password (min {MIN_PASSWORD_LENGTH} characters, mix of letters, numbers and symbols).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
