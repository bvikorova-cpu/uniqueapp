import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, Briefcase, Clock, Globe, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PublicJob {
  id: string;
  slug: string | null;
  title: string | null;
  company_name: string | null;
  location: string | null;
  country: string | null;
  category: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
}

const JOB_TYPES: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "it_software", label: "IT & Software" },
  { value: "marketing_sales", label: "Marketing & Sales" },
  { value: "finance_accounting", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "engineering", label: "Engineering" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "construction", label: "Construction" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

export function JobListingsFeed() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("all");
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      let q = (supabase.from as any)("job_listings_public")
        .select(
          "id, slug, title, company_name, location, country, category, job_type, salary_min, salary_max, salary_currency, is_remote, is_featured, created_at"
        )
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (category !== "all") q = q.eq("category", category);
      if (debounced) {
        const esc = debounced.replace(/[%,]/g, "");
        q = q.or(
          `title.ilike.%${esc}%,company_name.ilike.%${esc}%,location.ilike.%${esc}%,description.ilike.%${esc}%`
        );
      }

      const { data } = await q;
      if (cancelled) return;
      setJobs((data as PublicJob[]) || []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [debounced, category, limit]);

  const salary = (j: PublicJob) => {
    if (!j.salary_min && !j.salary_max) return null;
    const cur = j.salary_currency || "EUR";
    const sym = cur === "EUR" ? "€" : cur;
    if (j.salary_min && j.salary_max) return `${sym}${j.salary_min} – ${sym}${j.salary_max}`;
    return `${sym}${j.salary_min || j.salary_max}`;
  };

  const heading = useMemo(
    () => (debounced ? `Results for "${debounced}"` : "Latest job openings"),
    [debounced]
  );

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">{heading}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Browse open positions posted by employers worldwide.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, company or location…"
            className="pl-9 bg-card/60 backdrop-blur-xl"
            aria-label="Search job listings"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              setLimit(12);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              category === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-xl p-10 text-center">
          <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold mb-1">No job listings found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search, or be the first to post a job.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => navigate(`/jobs/listing/${j.slug || j.id}`)}
              className="text-left group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
                  {j.title}
                </h3>
                {j.is_featured && (
                  <Badge variant="outline" className="shrink-0 text-[10px] border-amber-500/40 text-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-current" /> TOP
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {j.company_name}
                </span>
                <span className="inline-flex items-center gap-1">
                  {j.is_remote ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {j.is_remote ? "Remote" : j.location || j.country || "—"}
                </span>
                {j.job_type && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {JOB_TYPES[j.job_type] || j.job_type}
                  </span>
                )}
              </div>
              {salary(j) && (
                <p className="mt-2 text-xs font-semibold text-primary">{salary(j)}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && jobs.length >= limit && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setLimit((l) => l + 12)}>
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
