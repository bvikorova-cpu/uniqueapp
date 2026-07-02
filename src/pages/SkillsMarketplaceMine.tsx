import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, ListOrdered, MessageSquare, Euro,
} from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Offering = {
  id: string;
  title: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
};

type Stats = {
  responses: number;
  active_orders: number; // pending or paid
  completed_orders: number;
};

export default function SkillsMarketplaceMine() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("skill_offerings")
      .select("id,title,category,price_per_hour,location,is_active,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load offerings", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = (data as Offering[]) || [];
    setOfferings(list);

    if (list.length) {
      const ids = list.map((o) => o.id);
      const [{ data: resp }, { data: orders }] = await Promise.all([
        supabase
          .from("marketplace_responses")
          .select("offering_id")
          .eq("receiver_id", user.id)
          .in("offering_id", ids),
        supabase
          .from("skill_service_orders")
          .select("offering_id,status")
          .eq("seller_id", user.id)
          .in("offering_id", ids),
      ]);
      const s: Record<string, Stats> = {};
      list.forEach((o) => (s[o.id] = { responses: 0, active_orders: 0, completed_orders: 0 }));
      (resp || []).forEach((r: any) => { if (s[r.offering_id]) s[r.offering_id].responses += 1; });
      (orders || []).forEach((o: any) => {
        if (!s[o.offering_id]) return;
        if (o.status === "completed") s[o.offering_id].completed_orders += 1;
        else if (o.status === "pending" || o.status === "paid") s[o.offering_id].active_orders += 1;
      });
      setStats(s);
    } else {
      setStats({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const toggleActive = async (o: Offering) => {
    const { error } = await supabase
      .from("skill_offerings")
      .update({ is_active: !o.is_active })
      .eq("id", o.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: !o.is_active ? "Offering activated" : "Offering paused" });
    setOfferings((prev) => prev.map((x) => (x.id === o.id ? { ...x, is_active: !o.is_active } : x)));
  };

  const remove = async (o: Offering) => {
    if (!confirm(`Delete "${o.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("skill_offerings").delete().eq("id", o.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Offering deleted" });
    setOfferings((prev) => prev.filter((x) => x.id !== o.id));
  };

  if (!user) {
    return (
      <>
        <FloatingHowItWorks title="How Skills Marketplace Mine works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
        <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to manage your offerings</h1>
        <Button asChild className="mt-4"><Link to="/auth">Sign in</Link></Button>
      </div>
      </>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" asChild className="mb-4 gap-2">
        <Link to="/skills-marketplace"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Offerings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your services, pause or delete them, and track activity.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/skills-marketplace/orders"><ListOrdered className="h-4 w-4" /> My Orders</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/skills-marketplace/new"><Plus className="h-4 w-4" /> New offering</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : offerings.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          You have no offerings yet. <Link to="/skills-marketplace/new" className="text-primary underline">Create your first one</Link>.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {offerings.map((o) => {
            const st = stats[o.id] || { responses: 0, active_orders: 0, completed_orders: 0 };
            return (
              <Card key={o.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        <Link to={`/skills-marketplace/${o.id}`} className="hover:underline">{o.title}</Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="capitalize">{o.category}</Badge>
                        {o.location && <span className="text-xs text-muted-foreground">{o.location}</span>}
                        {o.price_per_hour != null && (
                          <span className="text-xs inline-flex items-center gap-1 text-primary font-medium">
                            <Euro className="h-3 w-3" />{o.price_per_hour}/hr
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{o.is_active ? "Active" : "Paused"}</span>
                      <Switch checked={o.is_active} onCheckedChange={() => toggleActive(o)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1 justify-center">
                        <MessageSquare className="h-3 w-3" /> Messages
                      </div>
                      <div className="font-semibold">{st.responses}</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground">Active orders</div>
                      <div className="font-semibold">{st.active_orders}</div>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground">Completed</div>
                      <div className="font-semibold">{st.completed_orders}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild className="gap-1">
                      <Link to={`/skills-marketplace/${o.id}`}><Eye className="h-3.5 w-3.5" /> View</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="gap-1">
                      <Link to={`/skills-marketplace/${o.id}/edit`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="gap-1">
                      <Link to={`/skills-marketplace/orders`}>
                        <ListOrdered className="h-3.5 w-3.5" /> Orders
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(o)} className="gap-1 ml-auto">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
