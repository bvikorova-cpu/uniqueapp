import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Mail, Copy } from "lucide-react";
import { toast } from "sonner";

interface VerifyResult {
  status: string;
  customer_email?: string | null;
  provider_email?: string | null;
  provider_name?: string | null;
  provider_category?: string | null;
  booking?: { scheduled_at?: string } | null;
}

export default function ServiceBookingSuccess() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"verifying" | "confirmed" | "pending" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    const sessionId = sp.get("session_id");
    if (!bookingId || !sessionId) {
      setState("error"); setError("Missing session details."); return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-service-booking", {
          body: { booking_id: bookingId, session_id: sessionId },
        });
        if (error) throw error;
        setResult(data as VerifyResult);
        setState(data?.status === "confirmed" ? "confirmed" : "pending");
      } catch (e: any) {
        setError(e.message ?? "Verification failed"); setState("error");
      }
    })();
  }, [bookingId, sp]);

  const when = result?.booking?.scheduled_at ? new Date(result.booking.scheduled_at).toLocaleString() : "";

  const mailtoProvider = result?.provider_email
    ? `mailto:${result.provider_email}?subject=${encodeURIComponent(`New booking on ${when}`)}&cc=${encodeURIComponent(result.customer_email ?? "")}&body=${encodeURIComponent(
        `Hello ${result.provider_name ?? "Provider"},\n\nI have booked and paid for your service.\nScheduled: ${when}\n\nMy contact email: ${result.customer_email ?? ""}\n\nThank you!`,
      )}`
    : null;

  const mailtoCustomer = result?.customer_email
    ? `mailto:${result.customer_email}?subject=${encodeURIComponent(`Your booking with ${result.provider_name ?? "Provider"}`)}&body=${encodeURIComponent(
        `Your booking is confirmed for ${when}.\n\nProvider contact: ${result.provider_email ?? ""}`,
      )}`
    : null;

  const copy = async (text: string | null | undefined, label: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 mt-16 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            {state === "verifying" && (<><Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-2" /><CardTitle>Verifying payment…</CardTitle></>)}
            {state === "confirmed" && (<><CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" /><CardTitle>Booking confirmed</CardTitle></>)}
            {state === "pending" && (<><Loader2 className="w-12 h-12 mx-auto text-yellow-600 animate-spin mb-2" /><CardTitle>Payment still processing</CardTitle></>)}
            {state === "error" && (<><XCircle className="w-12 h-12 mx-auto text-destructive mb-2" /><CardTitle>Something went wrong</CardTitle></>)}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {state === "confirmed" && (
              <>
                <p className="text-muted-foreground">
                  Your booking with{" "}
                  <span className="font-semibold text-foreground">{result?.provider_name ?? "the provider"}</span>{" "}
                  is confirmed{when ? ` for ${when}` : ""}.
                </p>

                <div className="rounded-lg border bg-muted/40 p-4 text-left text-sm space-y-3">
                  <p className="font-semibold text-foreground text-center">
                    Contact details (no third-party mailing service needed)
                  </p>

                  {result?.provider_email && (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Provider email</p>
                        <p className="font-mono break-all">{result.provider_email}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => copy(result.provider_email, "Provider email")} aria-label="Copy provider email">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {result?.customer_email && (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Your email</p>
                        <p className="font-mono break-all">{result.customer_email}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => copy(result.customer_email, "Your email")} aria-label="Copy your email">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {mailtoProvider && (
                      <Button asChild className="flex-1">
                        <a href={mailtoProvider}><Mail className="w-4 h-4 mr-1" /> Email the provider</a>
                      </Button>
                    )}
                    {mailtoCustomer && (
                      <Button asChild variant="outline" className="flex-1">
                        <a href={mailtoCustomer}><Mail className="w-4 h-4 mr-1" /> Email me a copy</a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
            {state === "pending" && (
              <p className="text-muted-foreground">Refresh in a moment; we're waiting for Stripe to confirm the payment.</p>
            )}
            {state === "error" && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline"><Link to="/services-hub">Back to services</Link></Button>
              <Button onClick={() => navigate(0)}>Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
