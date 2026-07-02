import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Star, Loader2, Plus, BadgeCheck, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_COMPANIES = [
  { title: "Search a company", desc: "Type a name to filter the directory of employers on Unique." },
  { title: "Open a company profile", desc: "See ratings, employee reviews, culture info and every open job at that company." },
  { title: "Follow to get updates", desc: "Follow a company to receive alerts when they post a new role." },
  { title: "Leave a review", desc: "Verified employees can post a rating + review that helps other candidates decide." },
];

export default function Companies() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    let query = supabase.from("company_profiles").select("*").order("rating_avg", { ascending: false }).limit(60);
    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <SEO title="Companies — Reviews & Ratings" description="Browse company profiles, reviews and ratings from real employees." />
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-pink-500/10 border border-primary/20 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-pink-500 shadow-xl shadow-primary/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Companies</h1>
              <p className="text-sm text-muted-foreground">{items.length} profiles</p>
            </div>
          </div>
          <Button onClick={() => navigate("/jobs/companies/new")} className="gap-2"><Plus className="h-4 w-4" />Add company</Button>
        </div>
      </motion.div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies..." className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <Button variant="secondary" onClick={load}>Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No companies yet. Be the first to add one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => (
            <Card key={c.id} className="hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate(`/jobs/companies/${c.slug}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold flex items-center gap-1 truncate">
                      {c.name}
                      {c.is_verified && <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{c.industry || "—"} · {c.headquarters || "—"}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />{Number(c.rating_avg || 0).toFixed(1)}</span>
                      <span className="text-muted-foreground">{c.reviews_count} reviews</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
