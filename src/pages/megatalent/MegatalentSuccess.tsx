import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Sparkles, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { safeInvoke } from "@/utils/safeInvoke";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_MEGATALENTSUCCESS = [
  { title: "You are now Premium", desc: "Voting, commenting and uploading are unlocked immediately." },
  { title: "Head to Megatalent", desc: "Return to the contest, pick a category and start engaging." },
  { title: "Manage subscription", desc: "You can cancel or upgrade any time from Rewards \u2192 Subscriptions." },
];

type Status = "verifying" | "success" | "error";

/**
 * /megatalent/success
 * Landing page after Stripe checkout for MegaTalent subscription.
 * - Polls check-megatalent-subscription (which itself reads from Stripe and
 *   upserts the megatalent_subscriptions row with status='active').
 * - Once active, immediately unlocks upload + voting by redirecting back to
 *   /megatalent. The MegatalentGuard there will see fresh state.
 */
export default function MegatalentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const startedRef = useRef(false);

  const tierParam = params.get("tier");
  const tier: "premium" | "top_premium" =
    tierParam === "top_premium" ? "top_premium" : "premium";
  const isTop = tier === "top_premium";

  const [status, setStatus] = useState<Status>("verifying");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Preserve return path so user can resume after login
      navigate("/auth?redirect=/megatalent", { replace: true });
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      // Poll up to 8x with 1.2s delay (~10s) — Stripe usually settles in 2–4s.
      const MAX_ATTEMPTS = 8;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        setAttempt(i + 1);
        const { data, error } = await safeInvoke("check-megatalent-subscription");
        if (!error && data?.subscribed === true) {
          setStatus("success");
          toast({
            title: "MegaTalent activated 🎉",
            description: isTop
              ? "TOP Premium access ready — unlocking upload and voting."
              : "Premium access ready — unlocking upload and voting.",
          });
          // Brief pause so the user sees the success state before navigation.
          setTimeout(() => navigate("/megatalent", { replace: true }), 1800);
          return;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
      // Stripe webhook still propagating — let MegatalentGuard handle the
      // remainder. It has its own retry + reload fallback.
      setStatus("error");
    })();
  }, [authLoading, user, navigate, toast, isTop]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="max-w-md w-full border-2 border-primary/40 shadow-2xl">
        {status === "verifying" && (
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Activating your subscription…</CardTitle>
            <CardDescription className="text-base">
              Payment received. Verifying it with Stripe and activating access to upload
              and voting.
            </CardDescription>
            <p className="text-xs text-muted-foreground pt-1">
              Attempt {attempt} / 8 — usually takes 2–4 seconds.
            </p>
          </CardHeader>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${
                    isTop
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground shadow-lg"
                      : "bg-primary/15 text-primary border border-primary/30"
                  }`}
                >
                  {isTop ? <Sparkles className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  MegaTalent {isTop ? "TOP Premium" : "Premium"} active
                </span>
              </div>
              <CardTitle className="text-2xl">Welcome to the competition! 🏆</CardTitle>
              <CardDescription className="text-base">
                Upload and voting are unlocked. Redirecting you to MegaTalent…
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
                <li>✅ Unlimited photo and video uploads</li>
                <li>✅ Voting and comments in all 35+ categories</li>
                <li>✅ Access to all AI Talent tools</li>
                <li>✅ Entitlement to cash prizes for winners</li>
                {isTop && (
                  <>
                    <li>⭐ <strong>2× weight of your votes</strong></li>
                    <li>⭐ <strong>Daily vote-boost</strong> and TOP Premium badge</li>
                  </>
                )}
              </ul>
            </CardContent>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Activation is taking longer</CardTitle>
              <CardDescription className="text-base">
                Payment has been accepted, but Stripe is still processing it. Open
                MegaTalent — we will automatically complete the activation as soon as it is
                ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/megatalent", { replace: true })}
              >
                Continue to MegaTalent
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  startedRef.current = false;
                  setStatus("verifying");
                  setAttempt(0);
                }}
              >
                Try verification again
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
