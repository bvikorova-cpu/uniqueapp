import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCw, IdCard,
} from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type KycStatus =
  | "unverified" | "pending" | "verified" | "rejected" | "requires_input";

type KycResp = {
  status: KycStatus;
  verified_name?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
};

const CreatorVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionParam = params.get("session");
  const [data, setData] = useState<KycResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data: resp, error } = await supabase.functions.invoke("kyc-check");
    setLoading(false);
    if (error || (resp as any)?.error) {
      toast.error((resp as any)?.error || "Failed to check status");
      return;
    }
    setData(resp as KycResp);
  };

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user, sessionParam]);

  const start = async () => {
    setStarting(true);
    const { data: resp, error } = await supabase.functions.invoke("kyc-start");
    setStarting(false);
    if (error || !(resp as any)?.url) {
      toast.error((resp as any)?.error || "Couldn't start verification");
      return;
    }
    { const __u = (resp as any).url; const __w = window.open(__u, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = __u; }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to verify your identity.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = data?.status ?? "unverified";

  return (
    <>
      <FloatingHowItWorks
        title="How Creator Verification works"
        steps={[
          { title: 'Submit KYC', description: 'Upload ID and complete Stripe verification.' },
          { title: 'Wait for review', description: 'Admin reviews within 24-48h.' },
          { title: 'Get verified badge', description: 'Unlocks monetization and higher trust.' },
          { title: 'Stay compliant', description: 'Keep KYC current to avoid holds.' },
        ]}
      />
    <div className="container max-w-2xl mx-auto py-12 space-y-6">
      <Helmet>
        <title>Identity Verification — Creator KYC</title>
        <meta
          name="description"
          content="Verify your identity to unlock creator payouts above €100."
        />
      </Helmet>

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Identity Verification</h1>
        </div>
        <p className="text-muted-foreground">
          To comply with EU KYC/AML regulations, we verify your identity before processing
          creator payouts above €100. Powered by Stripe Identity.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5" /> Status
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {status === "verified" && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-emerald-500">Verified</div>
                {data?.verified_name && (
                  <div className="text-sm mt-1">Name on file: <span className="font-medium">{data.verified_name}</span></div>
                )}
                {data?.verified_at && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Verified on {new Date(data.verified_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Loader2 className="h-5 w-5 text-primary mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="font-semibold">Verification in progress</div>
                <p className="text-sm text-muted-foreground mt-1">
                  We're reviewing your documents. This usually takes a few minutes.
                </p>
                <Button variant="outline" size="sm" onClick={refresh} className="mt-3 gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
              </div>
            </div>
          )}

          {(status === "requires_input" || status === "rejected") && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              {status === "rejected" ? (
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-destructive">
                  {status === "rejected" ? "Verification rejected" : "Action required"}
                </div>
                {data?.rejection_reason && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Reason: {data.rejection_reason}
                  </p>
                )}
                <Button onClick={start} disabled={starting} className="mt-3 gap-2">
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Try again
                </Button>
              </div>
            </div>
          )}

          {status === "unverified" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="font-semibold">You'll need:</div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>A government-issued ID (passport, driver's license, or national ID)</li>
                  <li>A device with a camera for the live selfie</li>
                  <li>About 2 minutes</li>
                </ul>
              </div>
              <Button onClick={start} disabled={starting} className="w-full gap-2" size="lg">
                {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                Start verification
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t border-border pt-4">
            Your data is processed by Stripe Identity. We only store your verification status,
            full name, country, and date of birth.{" "}
            <Badge variant="outline" className="ml-1">GDPR-compliant</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default CreatorVerification;
