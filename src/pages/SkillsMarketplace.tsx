import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, MapPin, Euro, ArrowLeft, Hammer, Wrench, Sparkles,
  Leaf, Laptop, GraduationCap, Palette, Boxes, Crown, Flame, ChevronRight,
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
            className={`h-full overflow-hidden rounded-lg bg-card transition-shadow duration-200 hover:shadow-md ${
              premium ? "border-accent/60" : top ? "border-primary/50" : "border-border"
            }`}
          >
            <div className="flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug line-clamp-2 group-hover/card:underline">{o.title}</h3>
                  {o.price_per_hour != null && (
                    <span className="shrink-0 flex items-center gap-0.5 text-sm font-semibold text-primary">
                      <Euro className="h-3.5 w-3.5" />{o.price_per_hour}/hr
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{o.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{o.category}</span>
                  {regionLabel(o.region) && <span>{regionLabel(o.region)}</span>}
                  {o.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {o.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
              <ProviderTrustBadges
                trust={{
                  isVerified: verified[o.user_id]?.isVerified,
                  verificationTier: verified[o.user_id]?.tier,
                  completedJobs: o.completed_jobs,
                  rating: sellerStats[o.user_id] ?? null,
                }}
              />
              <div className="ml-auto">
                <PromotionBadge
                  featuredAt={o.featured_at}
                  featuredUntil={o.featured_until}
                  premiumAt={o.premium_at}
                  premiumUntil={o.premium_until}
                />
              </div>
            </div>
          </Card>
        </Link>
        {user?.id === o.user_id && (
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 gap-1 bg-background"
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
          { title: 'Deal directly', desc: 'Unlock the chat for 1 credit, agree the price and pay the provider directly — no commission.' },
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

      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <SEO title="Skills Marketplace — Hire microservices" description="Browse services by category for free. Publishing an offering costs 2 credits." canonical="/marketplace" />

          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Browse offerings</h2>
              <p className="text-sm text-muted-foreground">Free to browse — pick a category or search all services.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap sm:justify-end">
              {user && (
                <Button variant="outline" onClick={() => navigate("/skills-marketplace/mine")} className="w-full sm:w-auto">
                  My offerings
                </Button>
              )}
              <Button
                onClick={() => (user ? navigate("/skills-marketplace/new") : navigate("/auth"))}
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Post offering · 2 cr</span>
                <span className="hidden sm:inline">Post an offering · 2 credits</span>
              </Button>
            </div>
          </header>

          {!category ? (
            <>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CATEGORY_FOLDERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setCategory(f.value)}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{f.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{f.desc}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {loading ? "…" : `${counts[f.value] || 0} offering${(counts[f.value] || 0) === 1 ? "" : "s"}`}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setCategory(null)}>
                  <ArrowLeft className="h-4 w-4" /> All categories
                </Button>
                <h2 className="text-lg font-semibold capitalize">{activeFolder?.label ?? category}</h2>
              </div>

              <Tabs defaultValue="offerings" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="offerings">Offerings</TabsTrigger>
                  <TabsTrigger value="requests">Customer requests</TabsTrigger>
                </TabsList>

                <TabsContent value="offerings" className="space-y-5">
                  <div className="rounded-lg border border-border bg-card p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="pl-9" />
                    </div>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / area" />
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
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
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="price_asc">Price: low to high</SelectItem>
                          <SelectItem value="price_desc">Price: high to low</SelectItem>
                          <SelectItem value="top_rated">Top rated providers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
                    </div>
                  ) : filtered.length === 0 ? (
                    <Card className="rounded-lg border-dashed">
                      <CardContent className="p-10 text-center">
                        <p className="text-muted-foreground">
                          No offerings in this category yet. Be the first to{" "}
                          <Link to="/skills-marketplace/new" className="text-primary font-medium underline">post one</Link>.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-8">
                      {premiumList.length > 0 && (
                        <section>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            <Crown className="h-4 w-4 text-accent" /> Premium providers
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {premiumList.map(renderCard)}
                          </div>
                        </section>
                      )}
                      <section>
                        {premiumList.length > 0 && (
                          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Standard &amp; Top offerings
                          </h3>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
