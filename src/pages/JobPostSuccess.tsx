import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function JobPostSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing session id");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-job-listing-payment", {
          body: { sessionId },
        });
        if (error) throw error;
        if (data?.verified) {
          setStatus("success");
          setMessage("Your job listing is now live!");
        } else {
          setStatus("error");
          setMessage(`Payment status: ${data?.status ?? "unknown"}. You can retry payment from the dashboard.`);
          // Notify employer of failure so they see retry CTA later
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("notifications").insert({
              user_id: user.id,
              type: "job_listing_payment_failed",
              title: "Job listing payment failed",
              message: "Your last checkout did not complete. Open the employer dashboard and click Retry Payment.",
            });
          }
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Verification failed");
      }
    })();
  }, [params]);

  return (
    <>
      <FloatingHowItWorks title="How Job Post Success works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center space-y-4">
          {status === "verifying" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h1 className="text-2xl font-bold">Verifying your payment…</h1>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
              <h1 className="text-2xl font-bold">Payment successful</h1>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => navigate("/jobs")} className="w-full">
                Back to Jobs
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-destructive" />
              <h1 className="text-2xl font-bold">Verification failed</h1>
              <p className="text-muted-foreground">{message}</p>
              <Button variant="outline" onClick={() => navigate("/jobs")} className="w-full">
                Back to Jobs
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
