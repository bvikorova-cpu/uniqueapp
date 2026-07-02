import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Sparkles } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
  country?: string | null;
}

interface Props {
  jobId: string;
  category?: string | null;
  title: string;
  country?: string | null;
}

/**
 * Server-side full-text ranking via Postgres `find_similar_jobs` RPC
 * (tsvector + GIN index over title/requirements/description, with
 * category + country boosts and a "latest active" fallback baked in).
 *
 * Falls back to a category-based client query if the RPC errors so the
 * widget keeps rendering even during DB migration / cold cache.
 */
export function SimilarJobs({ jobId, category, title, country }: Props) {
  const [items, setItems] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Primary: server-side FTS RPC.
      const { data, error } = await (supabase.rpc as any)("find_similar_jobs", {
        _job_id: jobId,
        _limit: 8,
      });

      let rows: SimilarJob[] = [];
      if (!error && Array.isArray(data) && data.length > 0) {
        rows = data as SimilarJob[];
      } else {
        // Fallback: same-category newest, then latest active.
        const sel =
          "id, slug, title, company_name, location, category, salary_min, salary_max, salary_currency, is_remote, country";
        const same = category
          ? await (supabase.from as any)("job_listings_public")
              .select(sel)
              .eq("category", category)
              .neq("id", jobId)
              .order("created_at", { ascending: false })
              .limit(8)
          : { data: [] };
        rows = ((same.data as any[]) || []) as SimilarJob[];
        if (rows.length < 5) {
          const more = await (supabase.from as any)("job_listings_public")
            .select(sel)
            .neq("id", jobId)
            .order("created_at", { ascending: false })
            .limit(8 - rows.length);
          const seen = new Set(rows.map((r) => r.id));
          for (const r of (more.data as any[]) || []) {
            if (!seen.has(r.id)) rows.push(r as SimilarJob);
          }
        }
      }

      if (!cancelled) {
        setItems(rows.slice(0, 8));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [jobId, category, title, country]);

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Similar Jobs works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <div className="grid sm:grid-cols-2 gap-3 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      </>
      );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="similar-jobs-heading">
      <h2 id="similar-jobs-heading" className="font-bold text-xl mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> Similar jobs
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((j) => (
          <Link key={j.id} to={`/jobs/listing/${j.slug || j.id}`} className="block group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {j.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />{j.company_name}
                  </span>
                  {j.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{j.location}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {j.category && <Badge variant="secondary" className="text-[10px]">{j.category}</Badge>}
                  {j.is_remote && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
                  {j.salary_min && j.salary_max && (
                    <Badge variant="outline" className="text-[10px]">€{j.salary_min}–€{j.salary_max}</Badge>
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
