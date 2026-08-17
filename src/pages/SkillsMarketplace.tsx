import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, MapPin, Euro, ArrowLeft, Hammer, Wrench, Sparkles,
  Leaf, Laptop, GraduationCap, Palette, Boxes, Crown, Flame,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { SKILL_REGIONS, regionLabel } from "@/components/skills/skillRegions";
import { SkillRequestsBoard } from "@/components/skills/SkillRequestsBoard";
import { SkillPromoteDialog } from "@/components/skills/SkillPromoteDialog";
import { ProviderTrustBadges } from "@/components/skills/ProviderTrustBadges";
import { PromotionBadge } from "@/components/skills/PromotionBadge";



import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";


const HERO_VIDEO_URL = "/__l5e/assets-v1/1fc3d14b-b578-456c-bf84-eef5461ab4d5/skills-marketplace-hero.mp4";
const HERO_VIDEO_SECONDS = 10;

const CATEGORY_FOLDERS = [
  { value: "construction", label: "Construction", icon: Hammer, desc: "Building, renovations, assembly" },
  { value: "repairs", label: "Repairs", icon: Wrench, desc: "Fixing, plumbing, electrics" },
  { value: "cleaning", label: "Cleaning", icon: Sparkles, desc: "Homes, offices, after-party" },
  { value: "gardening", label: "Gardening", icon: Leaf, desc: "Lawns, trees, landscaping" },
  { value: "technology", label: "Technology", icon: Laptop, desc: "IT, web, devices" },
  { value: "teaching", label: "Teaching", icon: GraduationCap, desc: "Tutoring, lessons, coaching" },
  { value: "creative", label: "Creative", icon: Palette, desc: "Design, photo, music" },
  { value: "other", label: "Other", icon: Boxes, desc: "Everything else" },
] as const;

type Offering = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  region: string | null;
  image_url: string | null;
  created_at: string;
  featured_at: string | null;
  featured_until: string | null;
  premium_at: string | null;
  premium_until: string | null;
  completed_jobs: number | null;
};

const isActive = (until?: string | null) => !!until && new Date(until).getTime() > Date.now();

function SkillsMarketplaceContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("newest");
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, { isVerified: boolean; tier: string | null }>>({});
  const [sellerStats, setSellerStats] = useState<Record<string, { avg: number; count: number }>>({});


  const category = params.get("category");
  const setCategory = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set("category", value);
    else next.delete("category");
    setParams(next, { replace: true });
  };




  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("skill_offerings")
        .select("id,user_id,title,description,category,price_per_hour,location,region,image_url,created_at,featured_at,featured_until,premium_at,premium_until,completed_jobs")
        .eq("is_active", true)
        .order("premium_until", { ascending: false, nullsFirst: false })
        .order("featured_until", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(200);
      const list = (data as Offering[]) || [];
      setOfferings(list);
      const sellerIds = [...new Set(list.map((o) => o.user_id))];
      if (sellerIds.length) {
        const { data: reviews } = await supabase
          .from("seller_reviews")
          .select("seller_id, rating")
          .in("seller_id", sellerIds)
          .eq("is_hidden", false);
        const agg: Record<string, { sum: number; count: number }> = {};
        (((reviews as unknown) as { seller_id: string; rating: number }[]) || []).forEach((r) => {
          agg[r.seller_id] = agg[r.seller_id] || { sum: 0, count: 0 };
          agg[r.seller_id].sum += r.rating;
          agg[r.seller_id].count += 1;
        });
        const stats: Record<string, { avg: number; count: number }> = {};
        Object.entries(agg).forEach(([k, v]) => (stats[k] = { avg: v.sum / v.count, count: v.count }));
        setSellerStats(stats);

        const { data: profs } = await (supabase as any)
          .from("profiles")
          .select("id, is_verified, verification_tier")
          .in("id", sellerIds);
        const vmap: Record<string, { isVerified: boolean; tier: string | null }> = {};
        (profs || []).forEach((p: any) => {
          vmap[p.id] = { isVerified: !!p.is_verified, tier: p.verification_tier ?? null };
        });
        setVerified(vmap);
      }

      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    offerings.forEach((o) => { c[o.category] = (c[o.category] || 0) + 1; });
    return c;
  }, [offerings]);

  const filtered = useMemo(() => {
    let list = offerings;
    if (category) list = list.filter((o) => o.category === category);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (o) => o.title.toLowerCase().includes(term) || o.description.toLowerCase().includes(term),
      );
    }
    if (location.trim()) {
      const term = location.toLowerCase();
      list = list.filter((o) => (o.location || "").toLowerCase().includes(term));
    }
    if (region !== "all") list = list.filter((o) => o.region === region);
    if (sort === "price_asc") list = [...list].sort((a, b) => (a.price_per_hour ?? 0) - (b.price_per_hour ?? 0));
    if (sort === "price_desc") list = [...list].sort((a, b) => (b.price_per_hour ?? 0) - (a.price_per_hour ?? 0));
    if (sort === "top_rated")
      list = [...list].sort(
        (a, b) => (sellerStats[b.user_id]?.avg ?? 0) - (sellerStats[a.user_id]?.avg ?? 0),
      );
    return list;
  }, [offerings, q, category, location, region, sort, sellerStats]);

  const premiumList = useMemo(() => filtered.filter((o) => isActive(o.premium_until)), [filtered]);
  const standardList = useMemo(() => filtered.filter((o) => !isActive(o.premium_until)), [filtered]);


  const activeFolder = CATEGORY_FOLDERS.find((f) => f.value === category);

  const renderCard = (o: Offering) => {
    const premium = isActive(o.premium_until);
    const top = isActive(o.featured_until);
    const folder = CATEGORY_FOLDERS.find((f) => f.value === o.category);
    const Icon = folder?.icon ?? Boxes;
    return (
      <div key={o.id} className="relative group/card">
        <Link to={`/skills-marketplace/${o.id}`} className="block h-full">
          <Card
            className={`h-full overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-sm transition-all duration-300 group-hover/card:-translate-y-1 ${
              premium
                ? "border-accent/50 shadow-[0_10px_40px_-16px_hsl(var(--accent)/0.55)]"
                : top
                ? "border-primary/40 shadow-[0_10px_40px_-18px_hsl(var(--primary)/0.45)]"
                : "border-border/60 hover:border-primary/30 hover:shadow-xl"
            }`}
          >
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-accent/15">
              {o.image_url ? (
                <img
                  src={o.image_url}
                  alt={o.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-primary/50" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card via-card/60 to-transparent" />
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <PromotionBadge
                  featuredAt={o.featured_at}
                  featuredUntil={o.featured_until}
                  premiumAt={o.premium_at}
                  premiumUntil={o.premium_until}
                />
                <Badge variant="secondary" className="capitalize backdrop-blur bg-background/80">
                  {o.category}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg leading-snug line-clamp-2 group-hover/card:text-primary transition-colors">
                {o.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">{o.description}</p>
              <ProviderTrustBadges
                trust={{
                  isVerified: verified[o.user_id]?.isVerified,
                  verificationTier: verified[o.user_id]?.tier,
                  completedJobs: o.completed_jobs,
                  rating: sellerStats[o.user_id] ?? null,
                }}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-border/50 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {regionLabel(o.region) && <span>{regionLabel(o.region)}</span>}
                  {o.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {o.location}
                    </span>
                  )}
                </div>
                {o.price_per_hour != null && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    <Euro className="h-3.5 w-3.5" /> {o.price_per_hour}/hr
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        {user?.id === o.user_id && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 left-2 gap-1 shadow-lg backdrop-blur bg-background/85"
            onClick={(e) => { e.preventDefault(); setPromoteId(o.id); }}
          >
            <Flame className="h-3.5 w-3.5" /> Promote
          </Button>
        )}
      </div>
    );
  };



  return (
    <>
      <FloatingHowItWorks title="How Skills Marketplace works" steps={[
          { title: 'Free access', desc: 'Browsing the Skills section is free — no entry fee.' },
          { title: 'Pick a category', desc: 'Open a category folder and browse offerings inside it.' },
          { title: 'Publish an offering', desc: 'Opening your own offering costs 2 credits — no commission.' },
          { title: 'Order & review', desc: 'Contact the provider, order the service and leave a review.' },
        ]} />
      <section className="relative overflow-hidden border-b border-border/40">
        <video
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.currentTime >= HERO_VIDEO_SECONDS) v.currentTime = 0;
          }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/75 to-accent/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="container relative mx-auto px-4 py-16 md:py-20 max-w-7xl text-center">
          <Badge variant="outline" className="mb-5 border-primary/40 bg-background/60 backdrop-blur px-4 py-1.5 text-xs tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5 mr-2" /> Skills Marketplace
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.05] bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Find someone to get the job done
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            Browse services by category for free — or offer your own skills. Publishing an offering costs 2 credits.
          </p>
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.07] to-transparent" />
        <div className="container relative mx-auto px-4 py-10 max-w-7xl">
      <SEO title="Skills Marketplace — Hire microservices" description="Browse services by category for free. Publishing an offering costs 2 credits." canonical="/marketplace" />


      <header className="mb-8 rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_18px_60px_-32px_hsl(var(--primary)/0.4)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Free to browse
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Browse offerings
            </h2>
            <p className="text-muted-foreground max-w-md">
              Pick a category folder or search across all services.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap md:justify-end">
            {user && (
              <Button variant="outline" onClick={() => navigate("/skills-marketplace/mine")} className="gap-2 rounded-full">
                My offerings
              </Button>
            )}
            {user && (
              <Button variant="outline" onClick={() => navigate("/skills-marketplace/orders")} className="gap-2 rounded-full">
                My orders
              </Button>
            )}
            <Button
              onClick={() => (user ? navigate("/skills-marketplace/new") : navigate("/auth"))}
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Post an offering · 2 credits
            </Button>
          </div>
        </div>
      </header>

      {!category ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold">Categories</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORY_FOLDERS.map((f, i) => (
              <button key={f.value} onClick={() => setCategory(f.value)} className="text-left group/cat">
                <Card className="relative h-full overflow-hidden rounded-2xl border-border/60 bg-card/70 backdrop-blur-sm transition-all duration-300 group-hover/cat:-translate-y-1.5 group-hover/cat:border-primary/40 group-hover/cat:shadow-[0_18px_45px_-20px_hsl(var(--primary)/0.5)]">
                  <div
                    className={`absolute inset-0 opacity-60 transition-opacity duration-300 group-hover/cat:opacity-100 ${
                      i % 3 === 0
                        ? "bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
                        : i % 3 === 1
                        ? "bg-gradient-to-tr from-accent/10 via-transparent to-primary/10"
                        : "bg-gradient-to-b from-primary/10 to-transparent"
                    }`}
                  />
                  <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                  <CardContent className="relative p-5 space-y-2.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md transition-transform duration-300 group-hover/cat:scale-110 group-hover/cat:rotate-3">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="font-semibold flex items-center gap-1.5">
                      {f.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-300 text-primary group-hover/cat:opacity-100 group-hover/cat:translate-x-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{f.desc}</p>
                    <Badge variant="secondary" className="rounded-full bg-background/80 backdrop-blur">
                      {loading ? "…" : `${counts[f.value] || 0} offering${(counts[f.value] || 0) === 1 ? "" : "s"}`}
                    </Badge>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Button variant="ghost" className="gap-2 rounded-full" onClick={() => setCategory(null)}>
              <ArrowLeft className="h-4 w-4" /> All categories
            </Button>
            <h2 className="text-xl font-semibold capitalize">{activeFolder?.label ?? category}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
          </div>


          <Tabs defaultValue="offerings" className="w-full">
            <TabsList className="mb-5 rounded-full bg-muted/60 backdrop-blur p-1">
              <TabsTrigger value="offerings" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow">Offerings</TabsTrigger>
              <TabsTrigger value="requests" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow">Customer requests</TabsTrigger>
            </TabsList>

            <TabsContent value="offerings" className="space-y-6">
              <Card className="rounded-2xl border-border/60 bg-card/70 backdrop-blur-xl shadow-sm">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="pl-9 rounded-full bg-background/70" />
                  </div>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / area" className="rounded-full bg-background/70" />
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="rounded-full bg-background/70"><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All regions</SelectItem>
                      {SKILL_REGIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="md:col-span-2 flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"}
                    </p>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-48 rounded-full bg-background/70"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price_asc">Price: low to high</SelectItem>
                        <SelectItem value="price_desc">Price: high to low</SelectItem>
                        <SelectItem value="top_rated">Top rated providers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-primary/30 bg-card/60 backdrop-blur">
                  <CardContent className="p-12 text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                      <Sparkles className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      No offerings in this category yet. Be the first to{" "}
                      <Link to="/skills-marketplace/new" className="text-primary font-medium underline">post one</Link>.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-10">
                  {premiumList.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          <Crown className="h-5 w-5 text-accent" /> Premium providers
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {premiumList.map(renderCard)}
                      </div>
                    </section>
                  )}
                  <section>
                    {premiumList.length > 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold">Standard &amp; Top offerings</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {standardList.map(renderCard)}
                    </div>
                  </section>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests">
              <SkillRequestsBoard category={category} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <SkillPromoteDialog
        offeringId={promoteId}
        open={!!promoteId}
        onOpenChange={(v) => !v && setPromoteId(null)}
        onPromoted={() => window.location.reload()}
      />
        </div>
      </div>
    </>
  );


}

export default function SkillsMarketplace() {
  return (
      <SkillsMarketplaceContent />
  );
}
