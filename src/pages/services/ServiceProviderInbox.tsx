import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Store, Loader2, CheckCircle2, XCircle, User, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ServiceReviewDialog } from "@/components/services/ServiceReviewDialog";

interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  customer?: { email?: string; full_name?: string | null; avatar_url?: string | null } | null;
  scheduled_at: string;
  duration_minutes: number | null;
  price_cents: number | null;
  status: string;
  customer_notes: string | null;
  offering_name: string | null;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending payment", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled_by_customer: { label: "Cancelled by customer", variant: "secondary" },
  cancelled_by_provider: { label: "Cancelled by you", variant: "secondary" },
  refunded: { label: "Refunded", variant: "secondary" },
  no_show: { label: "No-show", variant: "destructive" },
};

export default function ServiceProviderInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState("upcoming");
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("service-provider-inbox", {
      body: { filter },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems(data?.rows ?? []);
    }
    setLoading(false);
  }, [user, filter, toast]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: string) => {
    setActing(id);
    try {
      const { error } = await supabase.functions.invoke("service-booking-action", { body: { booking_id: id, action } });
      if (error) throw error;
      toast({ title: "Done", description: `Booking ${action.replace("_", "-")}ed.` });
      await load();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    } finally { setActing(null); }
  };

  const BookingRow = ({ b }: { b: Booking }) => {
    const badge = STATUS_BADGE[b.status] ?? { label: b.status, variant: "outline" as const };
    const scheduled = new Date(b.scheduled_at);
    const isPast = scheduled.getTime() < Date.now();
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{b.customer?.full_name ?? "Customer"}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{b.customer?.email ?? b.customer_id}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                {b.offering_name && <Badge variant="outline" className="text-xs">{b.offering_name}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {scheduled.toLocaleString()}</div>
            <div>{b.duration_minutes ?? 60} min · €{((b.price_cents ?? 0) / 100).toFixed(2)}</div>
            {b.customer_notes && <div className="text-muted-foreground"><em>Notes:</em> {b.customer_notes}</div>}
          </div>

          <div className="flex flex-wrap gap-2">
            {b.status === "pending_payment" && (
              <Button size="sm" onClick={() => handleAction(b.id, "confirm")} disabled={acting === b.id}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm manually
              </Button>
            )}
            {b.status === "confirmed" && !isPast && (
              <Button size="sm" variant="outline" onClick={() => handleAction(b.id, "cancel")} disabled={acting === b.id}>
                <XCircle className="w-4 h-4 mr-1" /> Cancel
              </Button>
            )}
            {b.status === "confirmed" && isPast && (
              <>
                <Button size="sm" onClick={() => handleAction(b.id, "complete")} disabled={acting === b.id}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(b.id, "no_show")} disabled={acting === b.id}>
                  <XCircle className="w-4 h-4 mr-1" /> No-show
                </Button>
              </>
            )}
            {b.status === "completed" && (
              <Button size="sm" variant="outline" onClick={() => setReviewBooking(b)}>
                Write review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Provider Inbox · Book & Glow · Unique</title>
        <meta name="description" content="Manage your beauty and wellness bookings, appointments and payouts." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-4xl">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-3xl font-black flex items-center gap-2">
              <CalendarClock className="w-7 h-7 text-primary" /> Book & Glow Inbox
            </h1>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/services/provider/setup">Setup</Link></Button>
              <Button asChild variant="outline"><Link to="/services">Find more</Link></Button>
            </div>
          </div>

          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-3" />
                No bookings in this tab yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((b) => <BookingRow key={b.id} b={b} />)}
            </div>
          )}
        </div>
      </div>
      {reviewBooking && (
        <ServiceReviewDialog
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSaved={load}
        />
      )}
    </>
  );
}
