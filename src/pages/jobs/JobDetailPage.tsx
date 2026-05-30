import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Globe, Clock, DollarSign, Building2, ArrowLeft } from "lucide-react";

interface JobDetail {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  company_name: string;
  location: string;
  country: string;
  category: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  requirements: string | null;
  benefits: string | null;
  applications_count: number;
  created_at: string;
  expires_at?: string | null;
  is_remote?: boolean | null;
}

const SITE = "https://www.uniqueapp.fun";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function JobDetailPage() {
  // Param key is `:slug` but we still accept legacy UUIDs for backwards compatibility.
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) return;
      setLoading(true);
      const column = UUID_RE.test(slug) ? "id" : "slug";
      const { data, error } = await (supabase.from as any)("job_listings_public")
        .select("*")
        .eq(column, slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
      } else {
        setJob(data as JobDetail);
        // Canonicalize legacy UUID URL -> slug URL
        if (column === "id" && (data as JobDetail).slug) {
          navigate(`/jobs/listing/${(data as JobDetail).slug}`, { replace: true });
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 container mx-auto px-4">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-12 w-2/3 bg-muted rounded" />
          <div className="h-6 w-1/3 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <>
        <Helmet>
          <title>Job not found — Unique</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-background pt-20 pb-12 container mx-auto px-4 text-center">
          <p className="text-lg mb-4">This job listing is no longer available.</p>
          <Button onClick={() => navigate("/jobs")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Jobs</Button>
        </div>
      </>
    );
  }

  const canonical = `${SITE}/jobs/listing/${job.slug || job.id}`;
  const desc = (job.description || "").slice(0, 155).replace(/\s+/g, " ").trim();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: job.company_name, value: job.id },
    datePosted: job.created_at,
    validThrough: job.expires_at ?? undefined,
    employmentType: job.job_type?.toUpperCase(),
    hiringOrganization: { "@type": "Organization", name: job.company_name },
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: job.country,
      },
    },
    ...(job.salary_min && job.salary_max
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salary_currency || "EUR",
            value: {
              "@type": "QuantitativeValue",
              minValue: Number(job.salary_min),
              maxValue: Number(job.salary_max),
              unitText: "YEAR",
            },
          },
        }
      : {}),
    url: canonical,
  };

  return (
    <>
      <Helmet>
        <title>{`${job.title} — ${job.company_name} | Unique Jobs`}</title>
        <meta name="description" content={desc || `${job.title} at ${job.company_name}.`} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${job.title} — ${job.company_name}`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> All jobs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company_name}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
            <span className="inline-flex items-center gap-1"><Globe className="h-4 w-4" />{job.country}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(job.created_at).toLocaleDateString("en-US")}</span>
            {job.salary_min && job.salary_max && (
              <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />{job.salary_min}–{job.salary_max} {job.salary_currency}</span>
            )}
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <section>
                <h2 className="font-bold text-xl mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{job.description}</p>
              </section>
              {job.requirements && (
                <section>
                  <h2 className="font-bold text-xl mb-2">Requirements</h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{job.requirements}</p>
                </section>
              )}
              {job.benefits && (
                <section>
                  <h2 className="font-bold text-xl mb-2">Benefits</h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{job.benefits}</p>
                </section>
              )}
              <div className="pt-4 border-t">
                <Button onClick={() => navigate(`/jobs?focus=${job.id}`)} className="w-full md:w-auto">
                  Apply on Unique Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
