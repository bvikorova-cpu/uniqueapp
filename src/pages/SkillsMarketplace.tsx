import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MapPin, Euro } from "lucide-react";
import { SEO } from "@/components/SEO";

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "construction", label: "Construction" },
  { value: "repairs", label: "Repairs" },
  { value: "cleaning", label: "Cleaning" },
  { value: "gardening", label: "Gardening" },
  { value: "technology", label: "Technology" },
  { value: "teaching", label: "Teaching" },
  { value: "creative", label: "Creative" },
  { value: "other", label: "Other" },
];

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

export default function SkillsMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");

  const [sellerStats, setSellerStats] = useState<Record<string, { avg: number; count: number }>>({});

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
          .from("seller_reviews" as any)
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

  const filtered = useMemo(() => {
    let list = offerings;
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (o) => o.title.toLowerCase().includes(term) || o.description.toLowerCase().includes(term),
      );
    }
    if (category !== "all") list = list.filter((o) => o.category === category);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SEO title="Skills Marketplace — Hire & offer microservices" description="Browse and order microservices. Offer your own skills and get paid in EUR." />

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Skills Marketplace</h1>
          <p className="text-muted-foreground mt-1">Find someone to get the job done — or offer your own skills.</p>
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
            <Plus className="h-4 w-4" /> Post an offering
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <div className="md:col-span-4 flex items-center justify-between">
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
          No offerings match your filters. Be the first to <Link to="/skills-marketplace/new" className="text-primary underline">post one</Link>.
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
                  <div className="flex items-center justify-between text-sm pt-2">
                    {o.location && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {o.location}
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
    </div>
  );
}
