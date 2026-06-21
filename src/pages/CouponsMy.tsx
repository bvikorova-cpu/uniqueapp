import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

interface MyCoupon {
  id: string;
  code: string;
  brand: string | null;
  discount: string | null;
  status: string;
  claimed_at: string;
  expires_at: string | null;
}

export default function CouponsMy() {
  const { user } = useAuth();
  const [items, setItems] = useState<MyCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("coupon_claims")
          .select("id, code, brand, discount, status, claimed_at, expires_at")
          .eq("user_id", user.id)
          .order("claimed_at", { ascending: false });
        if (error) throw error;
        setItems((data as MyCoupon[]) || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <>
      <SEO title="My Coupons — Unique" description="Your claimed coupon codes." />
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" /> My Coupons
        </h1>

        {!user ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            <p className="mb-4">Sign in to see your claimed coupons.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent></Card>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            <p className="mb-4">You haven't claimed any coupons yet.</p>
            <Button asChild><Link to="/coupon-marketplace">Browse Coupon Marketplace</Link></Button>
          </CardContent></Card>
        ) : (
          <ul className="space-y-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{c.brand ?? "Coupon"}</span>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-lg tracking-wider bg-muted rounded px-3 py-2 inline-block">{c.code}</div>
                  {c.discount && <p className="text-sm text-muted-foreground mt-2">{c.discount}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Claimed {new Date(c.claimed_at).toLocaleDateString()}
                    {c.expires_at && ` · expires ${new Date(c.expires_at).toLocaleDateString()}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
