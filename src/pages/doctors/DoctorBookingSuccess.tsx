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
  patient_email?: string | null;
  doctor_email?: string | null;
  doctor_name?: string | null;
  appointment?: { scheduled_at?: string } | null;
}

export default function DoctorBookingSuccess() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"verifying" | "confirmed" | "pending" | "error">(
    "verifying",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

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
        setResult(data as VerifyResult);
        if (data?.status === "confirmed") setState("confirmed");
        else setState("pending");
      } catch (e: any) {
        setError(e.message ?? "Verification failed");
        setState("error");
      }
    })();
  }, [appointmentId, sp]);

  const when = result?.appointment?.scheduled_at
    ? new Date(result.appointment.scheduled_at).toLocaleString()
    : "";

  const mailtoDoctor = result?.doctor_email
    ? `mailto:${result.doctor_email}?subject=${encodeURIComponent(
        `New appointment on ${when}`,
      )}&cc=${encodeURIComponent(result.patient_email ?? "")}&body=${encodeURIComponent(
        `Hello ${result.doctor_name ?? "Doctor"},\n\nI have booked and paid for a consultation with you.\nScheduled: ${when}\n\nMy contact email: ${result.patient_email ?? ""}\n\nThank you!`,
      )}`
    : null;

  const mailtoPatient = result?.patient_email
    ? `mailto:${result.patient_email}?subject=${encodeURIComponent(
        `Your appointment with ${result.doctor_name ?? "Doctor"}`,
      )}&body=${encodeURIComponent(
        `Your appointment is confirmed for ${when}.\n\nDoctor contact: ${result.doctor_email ?? ""}`,
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
              <>
                <p className="text-muted-foreground">
                  Your consultation with{" "}
                  <span className="font-semibold text-foreground">
                    {result?.doctor_name ?? "the doctor"}
                  </span>{" "}
                  is booked{when ? ` for ${when}` : ""}.
                </p>

                <div className="rounded-lg border bg-muted/40 p-4 text-left text-sm space-y-3">
                  <p className="font-semibold text-foreground text-center">
                    Contact details (no third-party mailing service needed)
                  </p>

                  {result?.doctor_email && (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Doctor email</p>
                        <p className="font-mono break-all">{result.doctor_email}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copy(result.doctor_email, "Doctor email")}
                        aria-label="Copy doctor email"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {result?.patient_email && (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Your email</p>
                        <p className="font-mono break-all">{result.patient_email}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copy(result.patient_email, "Your email")}
                        aria-label="Copy your email"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {mailtoDoctor && (
                      <Button asChild className="flex-1">
                        <a href={mailtoDoctor}>
                          <Mail className="w-4 h-4 mr-1" /> Email the doctor
                        </a>
                      </Button>
                    )}
                    {mailtoPatient && (
                      <Button asChild variant="outline" className="flex-1">
                        <a href={mailtoPatient}>
                          <Mail className="w-4 h-4 mr-1" /> Email me a copy
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
            {state === "pending" && (
              <p className="text-muted-foreground">
                Refresh in a moment; we're waiting for Stripe to confirm the payment.
              </p>
            )}
            {state === "error" && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link to="/booking">Back to booking</Link>
              </Button>
              <Button onClick={() => navigate(0)}>Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
