import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Shield, Star, Store, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Listing {
  id: string; title: string; store_name: string;
  original_value: number; selling_price: number;
  expiry_date: string | null; image_url: string | null;
  category: string; is_sold: boolean; user_id: string;
}
interface SellerStat { seller_id: string; avg_rating: number; review_count: number; }

const slugToName = (slug: string) => slug.replace(/-/g, " ");
const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const CouponBrandPage = () => {
  const { brand = "" } = useParams();
  const brandName = titleCase(slugToName(brand));
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Record<string, SellerStat>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_public_coupon_listings");
      const all = ((data as any) || []) as Listing[];
      const filtered = all.filter(
        (c) => !c.is_sold && c.store_name.toLowerCase() === brandName.toLowerCase()
      );
      setListings(filtered);
      const ids = Array.from(new Set(filtered.map((c) => c.user_id)));
      if (ids.length) {
        const { data: s } = await supabase
          .from("coupon_seller_stats")
          .select("*")
          .in("seller_id", ids);
        const m: Record<string, SellerStat> = {};
        ((s as any[]) || []).forEach((r) => (m[r.seller_id] = r));
        setStats(m);
      }
      setLoading(false);
    })();
  }, [brandName]);

  const stats_summary = useMemo(() => {
    const count = listings.length;
    const avgDisc = count
      ? Math.round(
          listings.reduce(
            (a, c) => a + ((c.original_value - c.selling_price) / c.original_value) * 100,
            0
          ) / count
        )
      : 0;
    const minPrice = count ? Math.min(...listings.map((c) => c.selling_price)) : 0;
    return { count, avgDisc, minPrice };
  }, [listings]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brandName} Coupons & Discount Codes`,
    description: `Buy verified ${brandName} coupons, gift cards and discount codes at up to ${stats_summary.avgDisc}% off.`,
    numberOfItems: stats_summary.count,
  };

  return (
    <>
      <FloatingHowItWorks title="Brand Coupons" intro="Public brand profile with active coupons, verified badge and rating." steps={[
    { title: "Browse coupons", desc: "Scroll the list to see every active promo from this brand." },
    { title: "Copy a code", desc: "Tap a coupon to reveal the code and copy it to your clipboard." },
    { title: "Check validity", desc: "Each coupon shows its expiration date and any usage limits." },
    { title: "Visit the store", desc: "Use the store button to jump to the brand's official site." },
    { title: "Rate the brand", desc: "Leave a star rating so other shoppers can trust the brand faster." }
  ]} />
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <SEO
        title={`${brandName} Coupons & Discount Codes – Save up to ${stats_summary.avgDisc || 50}%`}
        description={`Buy verified ${brandName} coupons, gift cards & discount codes from real sellers. Avg ${stats_summary.avgDisc}% off, 7-day Buyer Guarantee.`}
        canonical={`/coupons/${brand}`}
        jsonLd={jsonLd}
      />
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <Button asChild variant="ghost" className="gap-2 mb-4">
          <Link to="/coupon-marketplace"><ArrowLeft className="w-4 h-4" />Back to Marketplace</Link>
        </Button>

        <header className="mb-8 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-10">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Store className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Brand Store</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3">
            {brandName} <span className="text-primary">Coupons</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Verified {brandName} discount codes, gift cards and vouchers from our marketplace sellers. Every purchase is covered by a 7-day Buyer Guarantee.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
            <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
              <div className="text-2xl font-black">{stats_summary.count}</div>
              <div className="text-[10px] text-muted-foreground">Listings</div>
            </div>
            <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
              <div className="text-2xl font-black text-emerald-500">{stats_summary.avgDisc}%</div>
              <div className="text-[10px] text-muted-foreground">Avg discount</div>
            </div>
            <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
              <div className="text-2xl font-black text-primary">€{stats_summary.minPrice.toFixed(0)}</div>
              <div className="text-[10px] text-muted-foreground">From</div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading…</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No active {brandName} coupons right now</h2>
            <p className="text-muted-foreground mb-4">Check back soon or browse other brands.</p>
            <Button asChild><Link to="/coupon-marketplace">Browse Marketplace</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((c) => {
              const disc = Math.round(((c.original_value - c.selling_price) / c.original_value) * 100);
              return (
                <Link key={c.id} to={`/coupon-marketplace?coupon=${c.id}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:scale-[1.02]">
                    <div className="relative">
                      {c.image_url ? (
                        <img src={c.image_url} alt={`${c.title} - ${brandName} coupon`} loading="lazy" className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Ticket className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-success text-success-foreground">Save {disc}%</Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Store className="w-3 h-3" />{c.store_name}</span>
                        {stats[c.user_id] ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {stats[c.user_id].avg_rating} <span className="text-muted-foreground">({stats[c.user_id].review_count})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">New seller</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{c.title}</h3>
                      <div className="mb-2">
                        <span className="text-lg font-black text-primary">€{c.selling_price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through ml-1">€{c.original_value.toFixed(2)}</span>
                      </div>
                      <Badge variant="outline" className="gap-1 mb-2 border-emerald-500/40 text-emerald-600 text-[10px] px-1.5 py-0">
                        <Shield className="w-3 h-3" />7-day Buyer Guarantee
                      </Badge>
                      {c.expiry_date && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />Expires: {new Date(c.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CouponBrandPage;
