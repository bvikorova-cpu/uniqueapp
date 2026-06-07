import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail, KeyRound, ShieldCheck } from "lucide-react";
import {
  requireRecentAuth,
  reauthenticateWithPassword,
} from "@/lib/requireRecentAuth";
import { logSecurityEvent } from "@/lib/securityAudit";

/**
 * P4 step-up auth: changing email or password requires a recent sign-in
 * (≤ 5 minutes). If the session is older, prompt the user to re-enter their
 * password before the update is sent to Supabase.
 */

interface AccountSecuritySectionProps {
  currentEmail: string;
}

type PendingAction =
  | { kind: "email"; value: string }
  | { kind: "password"; value: string }
  | null;

const FRESH_MAX_AGE_SEC = 5 * 60;

export function AccountSecuritySection({ currentEmail }: AccountSecuritySectionProps) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pending, setPending] = useState<PendingAction>(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthBusy, setReauthBusy] = useState(false);

  const applyAction = async (action: NonNullable<PendingAction>) => {
    if (action.kind === "email") {
      const { error } = await supabase.auth.updateUser({ email: action.value });
      if (error) throw error;
      toast({
        title: "Check your inbox",
        description: "We sent a confirmation link to the new email address.",
      });
      setNewEmail("");
    } else {
      const { error } = await supabase.auth.updateUser({ password: action.value });
      if (error) throw error;
      toast({ title: "Password updated", description: "Use your new password next time you sign in." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const guardedSubmit = async (action: NonNullable<PendingAction>) => {
    setSubmitting(true);
    try {
      const { ok } = await requireRecentAuth(FRESH_MAX_AGE_SEC);
      if (!ok) {
        setPending(action);
        return;
      }
      await applyAction(action);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = newEmail.trim();
    if (!value || value === currentEmail) {
      toast({ title: "Enter a different email", variant: "destructive" });
      return;
    }
    guardedSubmit({ kind: "email", value });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "At least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    guardedSubmit({ kind: "password", value: newPassword });
  };

  const handleReauth = async () => {
    if (!pending) return;
    setReauthBusy(true);
    try {
      const ok = await reauthenticateWithPassword(reauthPassword);
      if (!ok) {
        toast({ title: "Incorrect password", variant: "destructive" });
        return;
      }
      await applyAction(pending);
      setPending(null);
      setReauthPassword("");
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setReauthBusy(false);
    }
  };

  return (
    <Card className="p-4 space-y-6 border-border/60">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Account security</h3>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-2">
        <Label htmlFor="new_email" className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> Change email
        </Label>
        <div className="flex gap-2">
          <Input
            id="new_email"
            type="email"
            placeholder={currentEmail || "you@example.com"}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
          />
          <Button type="submit" disabled={submitting || !newEmail.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Re-login is required if your last sign-in was more than 5 minutes ago.
        </p>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-2">
        <Label htmlFor="new_password" className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" /> Change password
        </Label>
        <Input
          id="new_password"
          type="password"
          placeholder="New password (min 8 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          id="confirm_password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" disabled={submitting || !newPassword || !confirmPassword}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Update password
        </Button>
      </form>

      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setReauthPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your password</DialogTitle>
            <DialogDescription>
              For your security, re-enter your current password to{" "}
              {pending?.kind === "email" ? "change your email" : "change your password"}.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Current password"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleReauth();
            }}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
                setReauthPassword("");
              }}
              disabled={reauthBusy}
            >
              Cancel
            </Button>
            <Button onClick={handleReauth} disabled={reauthBusy || !reauthPassword}>
              {reauthBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
