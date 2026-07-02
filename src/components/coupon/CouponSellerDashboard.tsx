import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingBag, Star, AlertTriangle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Stats {
  orders_completed: number;
  gross_revenue_eur: number;
  disputes: number;
  dispute_rate_pct: number;
  listings_total: number;
  listings_active: number;
  avg_rating: number;
  review_count: number;
}

export function CouponSellerDashboard({ userId }: { userId: string | null }) {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase.from("coupon_seller_analytics" as any).select("*").eq("seller_id", userId).maybeSingle()
      .then(({ data }) => setS((data as any) ?? {
        orders_completed: 0, gross_revenue_eur: 0, disputes: 0, dispute_rate_pct: 0,
        listings_total: 0, listings_active: 0, avg_rating: 0, review_count: 0,
      }));
  }, [userId]);

  if (!s) return null;
  const tile = (icon: any, label: string, value: string, accent: string, sub?: string) => {
    const Icon = icon;
    return (
    <>
      <FloatingHowItWorks title={"Coupon Seller Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Seller Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Seller Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card><CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${accent}`} /><span className="text-xs text-muted-foreground">{label}</span></div>
        <p className="text-2xl font-black">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent></Card>
    </>
  );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {tile(TrendingUp, "Gross revenue", `€${Number(s.gross_revenue_eur).toFixed(2)}`, "text-emerald-500", "Released escrow only")}
      {tile(ShoppingBag, "Orders completed", String(s.orders_completed), "text-primary")}
      {tile(Star, "Avg rating", s.review_count > 0 ? `${Number(s.avg_rating).toFixed(2)} ★` : "—", "text-amber-500", `${s.review_count} reviews`)}
      {tile(AlertTriangle, "Dispute rate", `${s.dispute_rate_pct}%`, s.dispute_rate_pct > 5 ? "text-rose-500" : "text-muted-foreground", `${s.disputes} disputes`)}
      {tile(Package, "Active listings", `${s.listings_active}/${s.listings_total}`, "text-violet-500")}
    </div>
  );
}
