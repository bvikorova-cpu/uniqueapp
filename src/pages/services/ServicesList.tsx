import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Clock, Euro, Store, MapPin } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { Helmet } from "react-helmet-async";

interface Provider {
  owner_id: string;
  business_name: string;
  category: string;
  description: string | null;
  city: string | null;
  avatar_url: string | null;
  price_cents: number | null;
  duration_min: number | null;
  languages: string[] | null;
}

const CATEGORIES = ["all", "hair", "nails", "massage", "beauty", "fitness", "tutoring", "cleaning", "repair", "photography", "other"];

export default function ServicesList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("owner_id, business_name, category, description, city, avatar_url, price_cents, duration_min, languages")
        .eq("is_accepting_bookings", true)
        .not("price_cents", "is", null)
        .order("created_at", { ascending: false });
      setProviders((data as Provider[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = providers.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (!q) return true;
    const hay = `${p.business_name} ${p.category} ${p.city ?? ""} ${p.description ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <>
      <Helmet>
        <title>Find a Service Provider · Book Any Service · Unique</title>
        <meta name="description" content="Browse verified service providers (hair, nails, massage, tutoring, repair…) and book a paid slot in EUR." />
      </Helmet>
      <FloatingHowItWorks
        title="How service booking works"
        steps={[
          { title: "Filter", description: "Pick a category or search by name / city." },
          { title: "Pick a slot", description: "Open a provider's calendar and choose a free time." },
          { title: "Pay in EUR", description: "Secure Stripe checkout at the fixed price." },
          { title: "Get confirmed", description: "Provider is emailed; cancel >24h ahead for full refund." },
        ]}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Store className="w-8 h-8 text-primary" /> Find a Service
              </h1>
              <p className="text-muted-foreground">Book any professional — hair, nails, massage, tutoring, repair.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline"><Link to="/services/provider/setup">Offer services</Link></Button>
              <Button asChild variant="outline"><Link to="/my-bookings/services">My bookings</Link></Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>
                {c[0].toUpperCase() + c.slice(1)}
              </Button>
            ))}
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, city or description…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading providers…</p>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">No providers found for this filter.</p>
                <Button asChild><Link to="/services/provider/setup">Be the first to offer your services</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <Card key={p.owner_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.business_name} className="w-14 h-14 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Store className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{p.business_name}</CardTitle>
                        <CardDescription className="capitalize">{p.category}{p.city ? ` · ${p.city}` : ""}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{p.description ?? "No description provided."}</p>
                    <div className="flex items-center gap-3 text-sm mb-4">
                      <span className="flex items-center gap-1"><Euro className="w-4 h-4" />{((p.price_cents ?? 0) / 100).toFixed(2)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{p.duration_min ?? 60} min</span>
                      {p.city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{p.city}</span>}
                      {p.languages?.slice(0, 2).map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                      ))}
                    </div>
                    <Button asChild className="w-full"><Link to={`/services/${p.owner_id}`}>View & Book</Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
