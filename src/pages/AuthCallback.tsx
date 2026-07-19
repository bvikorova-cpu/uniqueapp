import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Generic Supabase auth callback landing.
 *
 * Handles link types (signup / magiclink / invite / email_change / reauthentication)
 * delivered via `?token_hash=...&type=...` from our Unique auth-email-hook.
 * The token is verified with a POST from JS so mail-scanners (Yandex, Outlook Safe
 * Links, etc.) cannot pre-consume it via GET.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tokenHash = params.get("token_hash");
      const token = params.get("token");
      const type = params.get("type");
      const email = params.get("email") || "";
      const code = params.get("code");
      const next = params.get("next") || "/";
      const errDesc = params.get("error_description");

      try {
        if (errDesc) throw new Error(errDesc);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (error) throw error;
        } else if (token && type) {
          const { error } = await supabase.auth.verifyOtp({
            token,
            email,
            type: type as any,
          });
          if (error) throw error;
        } else {
          throw new Error("Missing token in callback URL");
        }

        if (cancelled) return;

        // Route recovery to reset-password, everything else to `next`.
        if (type === "recovery") {
          navigate("/reset-password", { replace: true });
        } else {
          try {
            const url = new URL(next, window.location.origin);
            navigate(url.pathname + url.search, { replace: true });
          } catch {
            navigate("/", { replace: true });
          }
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error("[auth-callback]", e);
        setError(e?.message || "This link is invalid or has expired.");
        setWorking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params, navigate]);

  if (working && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Confirming your link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center border-destructive/30">
        <CardHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <CardTitle>Link invalid or expired</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/auth", { replace: true })}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
