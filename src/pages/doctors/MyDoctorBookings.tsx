import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Stethoscope, Loader2, XCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  scheduled_at: string;
  duration_min: number | null;
  price_cents: number | null;
  status: string;
  provider_id: string;
  patient_notes: string | null;
  refund_amount_cents: number | null;
  provider?: {
    provider_name: string | null;
    provider_logo_url: string | null;
    specialty: string | null;
  } | null;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending payment", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  no_show: { label: "No-show", variant: "destructive" },
  no_show_auto_refund: { label: "Auto-refunded", variant: "secondary" },
  cancelled_by_patient: { label: "Cancelled by you", variant: "secondary" },
  cancelled_by_doctor: { label: "Cancelled by doctor", variant: "secondary" },
};

export default function MyDoctorBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("healthcare_appointments")
      .select(
        "id, scheduled_at, duration_min, price_cents, status, provider_id, patient_notes, refund_amount_cents",
      )
      .eq("patient_id", user.id)
      .order("scheduled_at", { ascending: false });

    const rows = (data as Appointment[]) ?? [];
    // Hydrate provider info
    const ids = Array.from(new Set(rows.map((r) => r.provider_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("healthcare_profiles")
        .select("user_id, provider_name, provider_logo_url, specialty")
        .in("user_id", ids);
      const byId = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
      rows.forEach((r) => (r.provider = byId.get(r.provider_id) ?? null));
    }
    setItems(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id: string, scheduledAt: string) => {
    setCancelling(id);
    try {
      const { error } = await supabase.functions.invoke("patient-cancel-booking", {
        body: { appointment_id: id },
      });
      if (error) throw error;
      const hoursUntil = (new Date(scheduledAt).getTime() - Date.now()) / 3600000;
      toast({
        title: "Appointment cancelled",
        description:
          hoursUntil >= 24
            ? "Full refund is being processed."
            : "Cancelled without refund (less than 24h notice).",
      });
      await load();
    } catch (e: any) {
      toast({ title: "Cancellation failed", description: e.message, variant: "destructive" });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Doctor Bookings · Unique</title>
        <meta name="description" content="Manage your upcoming and past doctor appointments." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-black flex items-center gap-2">
              <CalendarClock className="w-7 h-7 text-primary" /> My Bookings
            </h1>
            <Button asChild variant="outline">
              <Link to="/doctors">Find a doctor</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Stethoscope className="w-10 h-10 mx-auto mb-3" />
                You haven't booked any doctor appointments yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((appt) => {
                const badge = STATUS_BADGE[appt.status] ?? { label: appt.status, variant: "outline" as const };
                const scheduled = new Date(appt.scheduled_at);
                const canCancel = ["pending_payment", "confirmed"].includes(appt.status) && scheduled.getTime() > Date.now();
                return (
                  <Card key={appt.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {appt.provider?.provider_logo_url ? (
                          <img
                            src={appt.provider.provider_logo_url}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {appt.provider?.provider_name ?? "Doctor"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {appt.provider?.specialty ?? "General"}
                          </p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <div>
                          <strong>When:</strong> {scheduled.toLocaleString()}
                        </div>
                        <div>
                          <strong>Duration:</strong> {appt.duration_min ?? 30} min
                        </div>
                        <div>
                          <strong>Price:</strong> €{((appt.price_cents ?? 0) / 100).toFixed(2)}
                          {appt.refund_amount_cents ? (
                            <span className="text-muted-foreground"> · Refunded €{(appt.refund_amount_cents / 100).toFixed(2)}</span>
                          ) : null}
                        </div>
                        {appt.patient_notes && (
                          <div className="mt-2 text-muted-foreground">
                            <em>Note:</em> {appt.patient_notes}
                          </div>
                        )}
                      </div>
                      {canCancel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={cancelling === appt.id}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel appointment
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {((scheduled.getTime() - Date.now()) / 3600000) >= 24
                                  ? "You'll receive a full refund because you're cancelling more than 24 hours in advance."
                                  : "Less than 24 hours remain — no refund will be issued."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep booking</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(appt.id, appt.scheduled_at)}>
                                Cancel appointment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
