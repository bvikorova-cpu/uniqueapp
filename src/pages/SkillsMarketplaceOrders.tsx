import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Euro, ShoppingBag, Inbox, CheckCircle2, X, Star } from "lucide-react";
import LeaveReviewDialog from "@/components/skills/LeaveReviewDialog";

type Order = {
  id: string;
  offering_id: string;
  buyer_id: string;
  seller_id: string;
  hours: number;
  amount_cents: number;
  currency: string;
  status: string;
  buyer_message: string | null;
  created_at: string;
  offering?: { title: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  paid: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function SkillsMarketplaceOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [buying, setBuying] = useState<Order[]>([]);
  const [selling, setSelling] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewFor, setReviewFor] = useState<{ sellerId: string; sellerName?: string } | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase
        .from("skill_service_orders")
        .select("*, offering:skill_offerings(title)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("skill_service_orders")
        .select("*, offering:skill_offerings(title)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setBuying((b as Order[]) || []);
    setSelling((s as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("skill_service_orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Order ${status}` });
    load();
  };

  const renderList = (orders: Order[], mode: "buyer" | "seller") => {
    if (loading) return <Skeleton className="h-24 w-full" />;
    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-base">
                    <Link to={`/skills-marketplace/${o.offering_id}`} className="hover:underline">
                      {o.offering?.title ?? "Offering"}
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(o.created_at).toLocaleString()} · {o.hours}h
                  </p>
                </div>
                <Badge className={STATUS_COLOR[o.status] ?? ""} variant="secondary">{o.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-lg font-semibold inline-flex items-center">
                <Euro className="h-4 w-4" /> {(o.amount_cents / 100).toFixed(2)}
              </div>
              {o.buyer_message && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap border-l-2 pl-3">
                  {o.buyer_message}
                </p>
              )}
              {mode === "seller" && o.status === "paid" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(o.id, "completed")} className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
                  </Button>
                </div>
              )}
              {mode === "buyer" && o.status === "pending" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "cancelled")} className="gap-1">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              )}
              {mode === "buyer" && o.status === "paid" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "completed")} className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm delivery
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your orders</h1>
        <Button asChild className="mt-4"><Link to="/auth">Sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4 gap-2">
        <Link to="/skills-marketplace"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>

      <Tabs defaultValue="buying">
        <TabsList>
          <TabsTrigger value="buying" className="gap-2"><ShoppingBag className="h-4 w-4" /> Buying ({buying.length})</TabsTrigger>
          <TabsTrigger value="selling" className="gap-2"><Inbox className="h-4 w-4" /> Selling ({selling.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="buying" className="mt-4">{renderList(buying, "buyer")}</TabsContent>
        <TabsContent value="selling" className="mt-4">{renderList(selling, "seller")}</TabsContent>
      </Tabs>
    </div>
  );
}
