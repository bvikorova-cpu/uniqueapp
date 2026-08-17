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
  image_url: string | null;
  created_at: string;
};

function SkillsMarketplaceContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
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
      const { data } = await supabase
        .from("skill_offerings")
        .select("id,user_id,title,description,category,price_per_hour,location,image_url,created_at")
        .eq("is_active", true)
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
    if (sort === "price_asc") list = [...list].sort((a, b) => (a.price_per_hour ?? 0) - (b.price_per_hour ?? 0));
    if (sort === "price_desc") list = [...list].sort((a, b) => (b.price_per_hour ?? 0) - (a.price_per_hour ?? 0));
    if (sort === "top_rated")
      list = [...list].sort(
        (a, b) => (sellerStats[b.user_id]?.avg ?? 0) - (sellerStats[a.user_id]?.avg ?? 0),
      );
    return list;
  }, [offerings, q, category, location, sort, sellerStats]);

  const activeFolder = CATEGORY_FOLDERS.find((f) => f.value === category);

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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SEO title="Skills Marketplace — Hire microservices" description="Browse services by category for free. Publishing an offering costs 2 credits." canonical="/marketplace" />


      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Browse offerings</h2>
          <p className="text-muted-foreground mt-1">
            Pick a category folder or search across all services.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user && (
            <Button variant="outline" onClick={() => navigate("/skills-marketplace/mine")} className="gap-2">
              My offerings
            </Button>
          )}
          {user && (
            <Button variant="outline" onClick={() => navigate("/skills-marketplace/orders")} className="gap-2">
              My orders
            </Button>
          )}
          <Button
            onClick={() => (user ? navigate("/skills-marketplace/new") : navigate("/auth"))}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Post an offering · 2 credits
          </Button>
        </div>
      </header>

      {!category ? (
        <>
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORY_FOLDERS.map((f) => (
              <button key={f.value} onClick={() => setCategory(f.value)} className="text-left">
                <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-semibold">{f.label}</div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{f.desc}</p>
                    <Badge variant="secondary">
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
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" className="gap-2" onClick={() => setCategory(null)}>
              <ArrowLeft className="h-4 w-4" /> All categories
            </Button>
            <h2 className="text-xl font-semibold capitalize">{activeFolder?.label ?? category}</h2>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="pl-9" />
              </div>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
              <div className="md:col-span-3 flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
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
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              No offerings in this category yet. Be the first to{" "}
              <Link to="/skills-marketplace/new" className="text-primary underline">post one</Link>.
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((o) => (
                <Link to={`/skills-marketplace/${o.id}`} key={o.id} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {o.image_url && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={o.image_url} alt={o.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{o.title}</CardTitle>
                        <Badge variant="secondary" className="capitalize shrink-0">{o.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">{o.description}</p>
                      <div className="flex items-center justify-between text-sm pt-2 gap-2 flex-wrap">
                        {o.location && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {o.location}
                          </span>
                        )}
                        {sellerStats[o.user_id] && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {sellerStats[o.user_id].avg.toFixed(1)} ({sellerStats[o.user_id].count})
                          </span>
                        )}
                        {o.price_per_hour != null && (
                          <span className="flex items-center gap-1 font-semibold text-primary ml-auto">
                            <Euro className="h-3.5 w-3.5" /> {o.price_per_hour}/hr
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default function SkillsMarketplace() {
  return (
      <SkillsMarketplaceContent />
  );
}
