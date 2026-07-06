import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function DoctorBookingSuccess() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"verifying" | "confirmed" | "pending" | "error">(
    "verifying",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = sp.get("session_id");
    if (!appointmentId || !sessionId) {
      setState("error");
      setError("Missing session details.");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-doctor-booking", {
          body: { appointment_id: appointmentId, session_id: sessionId },
        });
        if (error) throw error;
        if (data?.status === "confirmed") setState("confirmed");
        else setState("pending");
      } catch (e: any) {
        setError(e.message ?? "Verification failed");
        setState("error");
      }
    })();
  }, [appointmentId, sp]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 mt-16 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            {state === "verifying" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-2" />
                <CardTitle>Verifying payment…</CardTitle>
              </>
            )}
            {state === "confirmed" && (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                <CardTitle>Appointment confirmed</CardTitle>
              </>
            )}
            {state === "pending" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-yellow-600 animate-spin mb-2" />
                <CardTitle>Payment still processing</CardTitle>
              </>
            )}
            {state === "error" && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-destructive mb-2" />
                <CardTitle>Something went wrong</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {state === "confirmed" && (
              <p className="text-muted-foreground">
                Your doctor has been notified. You'll receive a reminder before the appointment.
              </p>
            )}
            {state === "pending" && (
              <p className="text-muted-foreground">
                Refresh in a moment; we're waiting for Stripe to confirm the payment.
              </p>
            )}
            {state === "error" && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link to="/doctors">Back to doctors</Link>
              </Button>
              <Button onClick={() => navigate(0)}>Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
