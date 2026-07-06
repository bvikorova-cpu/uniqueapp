import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Store, Loader2, XCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  scheduled_at: string;
  duration_minutes: number | null;
  price_cents: number | null;
  status: string;
  provider_id: string;
  customer_notes: string | null;
  refund_amount_cents: number | null;
  provider?: { business_name: string | null; category: string | null; avatar_url: string | null } | null;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending payment", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled_by_customer: { label: "Cancelled by you", variant: "secondary" },
  cancelled_by_provider: { label: "Cancelled by provider", variant: "secondary" },
  refunded: { label: "Refunded", variant: "secondary" },
  no_show: { label: "No-show", variant: "destructive" },
};

export default function MyServiceBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("service_bookings")
      .select("id, scheduled_at, duration_minutes, price_cents, status, provider_id, customer_notes, refund_amount_cents")
      .eq("customer_id", user.id)
      .order("scheduled_at", { ascending: false });
    const rows = (data as Booking[]) ?? [];
    const ids = Array.from(new Set(rows.map((r) => r.provider_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("service_providers")
        .select("owner_id, business_name, category, avatar_url")
        .in("owner_id", ids);
      const byId = new Map((profs ?? []).map((p: any) => [p.owner_id, p]));
      rows.forEach((r) => (r.provider = byId.get(r.provider_id) ?? null));
    }
    setItems(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: string, scheduledAt: string) => {
    setCancelling(id);
    try {
      const { error } = await supabase.functions.invoke("cancel-service-booking", { body: { booking_id: id } });
      if (error) throw error;
      const hoursUntil = (new Date(scheduledAt).getTime() - Date.now()) / 3600000;
      toast({
        title: "Booking cancelled",
        description: hoursUntil >= 24 ? "Full refund is being processed." : "Cancelled without refund (less than 24h notice).",
      });
      await load();
    } catch (e: any) {
      toast({ title: "Cancellation failed", description: e.message, variant: "destructive" });
    } finally { setCancelling(null); }
  };

  return (
    <>
      <Helmet>
        <title>My Service Bookings · Unique</title>
        <meta name="description" content="Manage your upcoming and past service bookings." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-3xl">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-3xl font-black flex items-center gap-2">
              <CalendarClock className="w-7 h-7 text-primary" /> My Service Bookings
            </h1>
            <Button asChild variant="outline"><Link to="/services">Find a service</Link></Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-3" />
                You haven't booked any services yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((b) => {
                const badge = STATUS_BADGE[b.status] ?? { label: b.status, variant: "outline" as const };
                const scheduled = new Date(b.scheduled_at);
                const canCancel = ["pending_payment", "confirmed"].includes(b.status) && scheduled.getTime() > Date.now();
                return (
                  <Card key={b.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {b.provider?.avatar_url ? (
                          <img src={b.provider.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{b.provider?.business_name ?? "Provider"}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{b.provider?.category ?? "service"}</p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div><strong>When:</strong> {scheduled.toLocaleString()}</div>
                        <div><strong>Duration:</strong> {b.duration_minutes ?? 60} min</div>
                        <div>
                          <strong>Price:</strong> €{((b.price_cents ?? 0) / 100).toFixed(2)}
                          {b.refund_amount_cents ? (
                            <span className="text-muted-foreground"> · Refunded €{(b.refund_amount_cents / 100).toFixed(2)}</span>
                          ) : null}
                        </div>
                        {b.customer_notes && <div className="mt-2 text-muted-foreground"><em>Note:</em> {b.customer_notes}</div>}
                      </div>
                      {canCancel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={cancelling === b.id}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel booking
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {((scheduled.getTime() - Date.now()) / 3600000) >= 24
                                  ? "You'll receive a full refund because you're cancelling more than 24 hours in advance."
                                  : "Less than 24 hours remain — no refund will be issued."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep booking</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(b.id, b.scheduled_at)}>Cancel booking</AlertDialogAction>
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
