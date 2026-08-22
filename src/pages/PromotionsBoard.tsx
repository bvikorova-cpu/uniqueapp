import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Plus, ExternalLink, Megaphone, Filter, Search, MapPin, Maximize2 } from "lucide-react";
import { useResolvedStorageUrl } from "@/lib/storageSigned";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import SEO from "@/components/SEO";
import promoVideo from "@/assets/section-videos/promotions-board.mp4.asset.json";

interface PromoListing {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  tier: "standard" | "top";
  active_until: string | null;
  category: string | null;
  city: string | null;
}

const PROMO_CATEGORIES = ["all", "business", "event", "restaurant", "beauty", "fitness", "shop", "service", "real_estate", "job", "other"];

function prettyDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function PromoMedia({ url, type, alt, full = false }: { url: string; type: string; alt: string; full?: boolean }) {
  const resolved = useResolvedStorageUrl(url);
  if (!resolved) {
    return <div className="w-full h-full bg-muted animate-pulse" />;
  }
  const cls = full ? "w-full max-h-[80vh] object-contain" : "w-full h-full object-cover";
  if (type === "video") {
    return (
      <video
        src={resolved}
        muted={!full}
        loop
        autoPlay
        playsInline
        controls={full}
        className={cls}
      />
    );
  }
  return <img src={resolved} alt={alt} loading={full ? "eager" : "lazy"} className={cls} />;
}

function PromoCard({ listing }: { listing: PromoListing }) {
  const isTop = listing.tier === "top";
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={`overflow-hidden group hover:shadow-xl transition-all duration-300 h-full ${
          isTop ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open ${listing.title}`}
          className="relative aspect-[4/3] w-full bg-muted overflow-hidden block cursor-zoom-in"
        >
          <PromoMedia url={listing.media_url} type={listing.media_type} alt={listing.title} />
          {isTop && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-accent text-white shadow-md">
              <Crown className="h-3 w-3 mr-1" /> TOP
            </Badge>
          )}
          <span className="absolute bottom-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4" />
          </span>
        </button>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-1">{listing.title}</h3>
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            {listing.link_url ? (
              <a
                href={listing.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline min-w-0"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">Visit ({prettyDomain(listing.link_url)})</span>
              </a>
            ) : (
              <span />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-2 sm:p-4">
          <div className="rounded-lg overflow-hidden bg-black/90 flex items-center justify-center">
            {open && <PromoMedia url={listing.media_url} type={listing.media_type} alt={listing.title} full />}
          </div>
          <div className="px-1 pt-2">
            <h3 className="font-bold text-lg">{listing.title}</h3>
            {listing.description && <p className="text-sm text-muted-foreground mt-1">{listing.description}</p>}
            {listing.link_url && (
              <a
                href={listing.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Visit ({prettyDomain(listing.link_url)})
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}


export default function PromotionsBoard() {
  const [listings, setListings] = useState<PromoListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      (async () => {
        setLoading(true);
        let query = supabase
          .from("promo_listings")
          .select("id,title,description,media_url,media_type,link_url,tier,active_until,category,city")
          .eq("status", "active")
          .gt("active_until", new Date().toISOString())
          .order("tier", { ascending: true }) // 'top' < 'standard' alphabetically
          .order("created_at", { ascending: false })
          .limit(200);
        const term = q.trim();
        if (term) {
          const pattern = `%${term}%`;
          query = query.or(
            `title.ilike.${pattern},description.ilike.${pattern},city.ilike.${pattern},category.ilike.${pattern}`
          );
        }
        const { data } = await query;
        setListings((data as PromoListing[]) ?? []);
        setLoading(false);
      })();
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);




  const cities = useMemo(() => {
    const s = new Set<string>();
    listings.forEach((l) => { if (l.city) s.add(l.city); });
    return ["all", ...Array.from(s).sort()];
  }, [listings]);

  const filtered = listings.filter((l) => {
    if (cat !== "all" && (l.category ?? "other") !== cat) return false;
    if (cityFilter !== "all" && !(l.city ?? "").toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (!q) return true;
    const hay = `${l.title} ${l.description ?? ""} ${l.city ?? ""} ${l.category ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const topListings = filtered.filter((l) => l.tier === "top");
  const standardListings = filtered.filter((l) => l.tier === "standard");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promotions Board — Unique"
        description="Public promotions board. Publish your flyer, poster or promo video for €20 per month. Boost to TOP for €50 per month."
      />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[380px] max-h-[560px] overflow-hidden">
        <video
          src={promoVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-20">
          <div className="mb-3 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 ring-2 ring-white/30">
            <Megaphone className="h-9 w-9 text-white" />
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-white mb-4"
            style={{ textShadow: "0 4px 30px rgba(139,92,246,0.55)" }}
          >
            Promotions <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">Board</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
            Promote your business, event or offer. Public visibility from just €20 per month.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/promotions/new"><Plus className="h-4 w-4 mr-1" /> Publish a promo</Link>
            </Button>
            <Button asChild size="lg" className="bg-white/95 text-primary hover:bg-white shadow-xl shadow-black/20 border-2 border-white/50 font-bold">
              <Link to="/promotions/mine"><Crown className="h-4 w-4 mr-1" /> My promotions</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid grid-cols-1">
          <FloatingHowItWorks
            title="Promotions Board — How it works"
            intro="A public board for anyone who wants to promote a business, product, event or offer."
            steps={[
              { title: "Upload", desc: "Add a photo or video (flyer, poster, promo clip) and a short description." },
              { title: "Choose a plan", desc: "Standard placement €20/month, or TOP placement (pinned to the top) €50/month." },
              { title: "Pay with credits", desc: "Credits are deducted instantly and your listing goes live for 30 days." },
              { title: "Get seen", desc: "Your promo appears on this public board — visible to every visitor of Unique." },
              { title: "Manage", desc: "Edit, hide or re-publish anytime from My promotions." },
            ]}
          />
        </div>

        <div className="rounded-xl border bg-card p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Filter className="w-4 h-4" /> Filter promotions</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROMO_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">City / area</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Type a city…"
                  value={cityFilter === "all" ? "" : cityFilter}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setCityFilter(val ? val : "all");
                  }}
                  className="pl-9"
                  list="promo-city-suggestions"
                />
                <datalist id="promo-city-suggestions">
                  {cities.filter((c) => c !== "all").map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Title, city, description…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-16">Loading promotions…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No active promotions yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to promote something!</p>
            <Button asChild variant="premium">
              <Link to="/promotions/new"><Plus className="h-4 w-4 mr-1" /> Publish the first promo</Link>
            </Button>
          </div>
        ) : (
          <>
            {topListings.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Top promotions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topListings.map((l) => (
                    <PromoCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}

            {standardListings.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">All promotions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {standardListings.map((l) => (
                    <PromoCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
