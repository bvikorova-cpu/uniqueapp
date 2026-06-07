import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

interface Factor {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
}

export default function SecuritySettings() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [busy, setBusy] = useState(false);
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");

  const loadFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast({ title: "Failed to load MFA factors", description: error.message, variant: "destructive" });
      return;
    }
    setFactors((data?.all ?? []) as Factor[]);
  };

  useEffect(() => {
    if (user) void loadFactors();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const startEnroll = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error || !data) {
      toast({ title: "Enroll failed", description: error?.message, variant: "destructive" });
      return;
    }
    setEnrolling({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  };

  const verifyEnroll = async () => {
    if (!enrolling) return;
    setBusy(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
      factorId: enrolling.factorId,
    });
    if (cErr || !challenge) {
      setBusy(false);
      toast({ title: "Challenge failed", description: cErr?.message, variant: "destructive" });
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (vErr) {
      toast({ title: "Invalid code", description: vErr.message, variant: "destructive" });
      return;
    }
    toast({ title: "MFA enabled", description: "Authenticator app is now active." });
    setEnrolling(null);
    setCode("");
    void loadFactors();
  };

  const unenroll = async (factorId: string) => {
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) {
      toast({ title: "Unenroll failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "MFA removed" });
    void loadFactors();
  };

  const verified = factors.filter((f) => f.status === "verified");
  const hasMfa = verified.length > 0;

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage two-factor authentication for your account.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasMfa ? <ShieldCheck className="text-primary" /> : <ShieldAlert className="text-destructive" />}
            Two-Factor Authentication (TOTP)
          </CardTitle>
          <CardDescription>
            {hasMfa
              ? "Your account is protected by an authenticator app."
              : "Add an authenticator app (Google Authenticator, 1Password, Authy) for an extra layer of security."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{f.friendly_name || "Authenticator"}</div>
                <div className="text-xs text-muted-foreground">{f.factor_type.toUpperCase()} · {f.status}</div>
              </div>
              <Button variant="destructive" size="sm" disabled={busy} onClick={() => unenroll(f.id)}>
                Remove
              </Button>
            </div>
          ))}

          {!enrolling && (
            <Button onClick={startEnroll} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add authenticator app
            </Button>
          )}

          {enrolling && (
            <div className="space-y-4 rounded-md border p-4">
              <div>
                <p className="text-sm font-medium mb-2">1. Scan the QR code in your authenticator app</p>
                <img
                  src={enrolling.qr}
                  alt="MFA QR code"
                  className="bg-white p-2 rounded-md w-48 h-48"
                />
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  Or enter this secret manually: <code className="font-mono">{enrolling.secret}</code>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">2. Enter the 6-digit code from the app</p>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyEnroll} disabled={busy || code.length !== 6}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & enable
                </Button>
                <Button variant="outline" onClick={() => { setEnrolling(null); setCode(""); }} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
