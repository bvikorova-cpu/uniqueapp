import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CouponExpiryHeatmap } from "@/components/coupon/CouponExpiryHeatmap";
import { Helmet } from "react-helmet-async";

interface Hub { id: string; slug: string; title: string; description: string | null; banner_url: string | null; accent_color: string | null; coupon_ids: string[]; }
interface Coupon { id: string; title: string; store_name: string; selling_price: number; original_value: number; image_url: string | null; expiry_date: string | null; }

const SeasonalHub = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hub, setHub] = useState<Hub | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data } = await supabase.from("coupon_seasonal_hubs" as any).select("*").eq("slug", slug).maybeSingle();
      const h = (data as any) as Hub | null;
      setHub(h);
      if (h?.coupon_ids?.length) {
        const { data: c } = await supabase.from("coupon_listings")
          .select("id, title, store_name, selling_price, original_value, image_url, expiry_date")
          .in("id", h.coupon_ids).eq("is_active", true).eq("is_sold", false);
        setCoupons(((c as any) || []) as Coupon[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="w-8 h-8 animate-pulse text-primary" /></div>;
  if (!hub) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>Seasonal hub not found.</p>
      <Button asChild><Link to="/coupon-marketplace">Back to coupons</Link></Button>
    </div>
  );

  const accent = hub.accent_color || "#8b5cf6";

  return (
    <div className="min-h-screen pb-12">
      <Helmet>
        <title>{hub.title} — Coupon Marketplace</title>
        <meta name="description" content={hub.description ?? `Curated deals for ${hub.title}`} />
      </Helmet>
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}66, ${accent}22)` }} />
        {hub.banner_url && <img src={hub.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
          <Button variant="ghost" size="sm" asChild className="self-start mb-4"><Link to="/coupon-marketplace"><ArrowLeft className="w-4 h-4" /> All coupons</Link></Button>
          <Badge className="self-start mb-2" style={{ backgroundColor: accent }}><Sparkles className="w-3 h-3 mr-1" /> Seasonal Hub</Badge>
          <h1 className="text-3xl sm:text-5xl font-black mb-2">{hub.title}</h1>
          {hub.description && <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">{hub.description}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <h2 className="font-bold text-xl mb-4">Featured deals ({coupons.length})</h2>
        {coupons.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />No active coupons in this hub yet — check back soon.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coupons.map(c => {
              const sav = Math.round(((c.original_value - c.selling_price) / c.original_value) * 100);
              return (
                <Link key={c.id} to={`/coupon-marketplace?coupon=${c.id}`}>
                  <Card className="overflow-hidden hover:scale-[1.02] transition-all">
                    {c.image_url ? <img src={c.image_url} alt={c.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center"><Ticket className="w-10 h-10 text-primary/50" /></div>}
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">{c.store_name}</p>
                      <p className="font-semibold text-sm line-clamp-2">{c.title}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-primary">€{Number(c.selling_price).toFixed(2)}</span>
                        <span className="text-xs line-through text-muted-foreground">€{Number(c.original_value).toFixed(2)}</span>
                        <Badge className="bg-success">−{sav}%</Badge>
                      </div>
                      <div className="mt-2"><CouponExpiryHeatmap expiry={c.expiry_date} /></div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalHub;
