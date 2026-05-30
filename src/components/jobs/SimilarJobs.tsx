import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Sparkles } from "lucide-react";

interface SimilarJob {
  id: string;
  slug: string | null;
  title: string;
  company_name: string;
  location: string | null;
  category: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean | null;
}

interface Props {
  jobId: string;
  category?: string | null;
  title: string;
  /** ISO country code or freeform country string for soft location boost. */
  country?: string | null;
}

const STOP = new Set([
  "the", "and", "for", "with", "from", "into", "your", "you", "are", "our",
  "this", "that", "will", "have", "has", "but", "not", "all", "any", "can",
  "job", "role", "team", "work", "new", "etc", "über", "und",
]);

const tokenize = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9äöüáéíóúčďéěíňóřšťůúý ]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));

/**
 * Fetches up to 30 candidate listings (same category first), then ranks
 * locally by title-keyword overlap and country match. Returns top 5–10.
 */
export function SimilarJobs({ jobId, category, title, country }: Props) {
  const [items, setItems] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const select =
        "id, slug, title, company_name, location, category, salary_min, salary_max, salary_currency, is_remote, country";

      // Primary: same category. Fallback: any active listing.
      const primary = category
        ? await (supabase.from as any)("job_listings_public")
            .select(select)
            .eq("category", category)
            .neq("id", jobId)
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(30)
        : { data: [] as any[], error: null };

      let rows = (primary.data as any[]) || [];

      if (rows.length < 5) {
        const fallback = await (supabase.from as any)("job_listings_public")
          .select(select)
          .neq("id", jobId)
          .order("created_at", { ascending: false })
          .limit(30 - rows.length);
        const seen = new Set(rows.map((r) => r.id));
        for (const r of (fallback.data as any[]) || []) {
          if (!seen.has(r.id)) rows.push(r);
        }
      }

      // Rank: title keyword overlap (weight 3) + country match (weight 1).
      const baseTokens = new Set(tokenize(title));
      const scored = rows.map((r: any) => {
        const titleTokens = tokenize(r.title);
        const overlap = titleTokens.filter((t) => baseTokens.has(t)).length;
        const countryBoost = country && r.country === country ? 1 : 0;
        return { row: r, score: overlap * 3 + countryBoost };
      });
      scored.sort((a, b) => b.score - a.score);

      if (!cancelled) {
        setItems(scored.slice(0, 8).map((s) => s.row as SimilarJob));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId, category, title, country]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="similar-jobs-heading">
      <h2
        id="similar-jobs-heading"
        className="font-bold text-xl mb-3 flex items-center gap-2"
      >
        <Sparkles className="h-5 w-5 text-primary" /> Similar jobs
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((j) => (
          <Link
            key={j.id}
            to={`/jobs/listing/${j.slug || j.id}`}
            className="block group"
          >
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {j.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {j.company_name}
                  </span>
                  {j.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {j.location}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {j.category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {j.category}
                    </Badge>
                  )}
                  {j.is_remote && (
                    <Badge variant="outline" className="text-[10px]">
                      Remote
                    </Badge>
                  )}
                  {j.salary_min && j.salary_max && (
                    <Badge variant="outline" className="text-[10px]">
                      €{j.salary_min}–€{j.salary_max}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SimilarJobs;
