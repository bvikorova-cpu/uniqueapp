import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Euro, CheckCircle2, X, Clock, Star } from "lucide-react";
import OrderConversation from "@/components/skills/OrderConversation";
import LeaveReviewDialog from "@/components/skills/LeaveReviewDialog";
import { formatDistanceToNow } from "date-fns";

type Order = {
  id: string; offering_id: string; buyer_id: string; seller_id: string;
  hours: number; amount_cents: number; currency: string; status: string;
  buyer_message: string | null; created_at: string;
  offering?: { title: string; user_id: string } | null;
};

type Event = {
  id: string; event_type: string; from_status: string | null; to_status: string | null;
  actor_id: string | null; note: string | null; created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  paid: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function SkillsMarketplaceOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [counterpart, setCounterpart] = useState<{ full_name: string | null } | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: o } = await supabase
      .from("skill_service_orders")
      .select("*, offering:skill_offerings(title,user_id)")
      .eq("id", id)
      .maybeSingle();
    setOrder(o as Order | null);
    const { data: ev } = await supabase
      .from("skill_order_events" as any)
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });
    setEvents((ev as Event[]) || []);
    if (o) {
      const otherId = user?.id === (o as Order).buyer_id ? (o as Order).seller_id : (o as Order).buyer_id;
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", otherId).maybeSingle();
      setCounterpart(p as any);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    const { error } = await supabase.from("skill_service_orders").update({ status }).eq("id", order.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Order ${status}` });
    load();
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" />
    </div>;
  }
  if (!order) {
    return <div className="container mx-auto px-4 py-16 max-w-xl text-center">
      <h1 className="text-2xl font-bold mb-2">Order not found</h1>
      <Button asChild><Link to="/skills-marketplace/orders">Back to orders</Link></Button>
    </div>;
  }

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;
  const otherId = isBuyer ? order.seller_id : order.buyer_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/skills-marketplace/orders")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-xl">
                <Link to={`/skills-marketplace/${order.offering_id}`} className="hover:underline">
                  {order.offering?.title ?? "Offering"}
                </Link>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Order #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBuyer ? "Provider" : "Buyer"}: {counterpart?.full_name || "—"}
              </p>
            </div>
            <Badge className={STATUS_COLOR[order.status] ?? ""} variant="secondary">{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="font-semibold">{order.hours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold inline-flex items-center text-primary">
                <Euro className="h-4 w-4" /> {(order.amount_cents / 100).toFixed(2)}
              </p>
            </div>
          </div>
          {order.buyer_message && (
            <div className="border-l-2 pl-3">
              <p className="text-xs text-muted-foreground mb-1">Buyer's note</p>
              <p className="text-sm whitespace-pre-wrap">{order.buyer_message}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {isSeller && order.status === "paid" && (
              <Button onClick={() => updateStatus("completed")} className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Mark as completed
              </Button>
            )}
            {(isSeller || isBuyer) && ["pending", "paid"].includes(order.status) && (
              <Button variant="outline" onClick={() => updateStatus("cancelled")} className="gap-2">
                <X className="h-4 w-4" /> Cancel order
              </Button>
            )}
            {isBuyer && order.status === "completed" && (
              <Button onClick={() => setReviewOpen(true)} variant="outline" className="gap-2">
                <Star className="h-4 w-4" /> Leave review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Conversation</CardTitle></CardHeader>
          <CardContent>
            <OrderConversation offeringId={order.offering_id} orderId={order.id} otherUserId={otherId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium capitalize">
                        {e.event_type === "created" ? "Order placed" :
                          `${e.from_status || "—"} → ${e.to_status || "—"}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                      </p>
                      {e.note && <p className="text-xs mt-1">{e.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {isBuyer && (
        <LeaveReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          sellerId={order.seller_id}
          sellerName={counterpart?.full_name ?? undefined}
          onSubmitted={load}
        />
      )}
    </div>
  );
}
