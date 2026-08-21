import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, MapPin, Users, Calendar, BadgeCheck, Plus, Rocket, Loader2, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_COMPANYPROFILE = [
  { title: "Company overview", desc: "Read the bio, size, industry, HQ and website." },
  { title: "Open positions", desc: "All current job posts are listed here — tap one to see details and apply." },
  { title: "Post a job", desc: "Company owners can add new listings and boost them for more visibility." },
];

export default function CompanyProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: currentUser }, { data: c }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("company_profiles").select("*").eq("slug", slug).maybeSingle(),
    ]);
    setUser(currentUser?.user ?? null);
    if (!c) { setLoading(false); return; }
    setCompany(c);
    setIsOwner(currentUser?.user?.id === c.owner_id);

    const { data: j } = await supabase
      .from("job_listings")
      .select("id, title, location, salary_min, salary_max, salary_currency, is_active, boost_tier, featured_until, boost_until, created_at")
      .eq("company_name", c.name)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setJobs(j || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!company) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Company not found.</p><Button onClick={() => navigate("/jobs")} className="mt-4">Back to Work</Button></div>;

  const now = new Date();

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-12 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Company Profile" intro="Public company page with open positions." steps={HOW_STEPS_COMPANYPROFILE} variant="compact" />
      </div>
      <SEO title={`${company.name} — Jobs`} description={company.description?.slice(0, 155) || `${company.name} company profile.`} />

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20">
        {company.cover_url && <img src={company.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-pink-500/10 p-6 flex items-start gap-4 flex-wrap">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-20 w-20 rounded-2xl object-cover shadow-xl" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-xl">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-[240px]">
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              {company.name}
              {company.is_verified && <BadgeCheck className="h-6 w-6 text-primary" />}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
              {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
              {company.size && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{company.size}</span>}
              {company.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.headquarters}</span>}
              {company.founded_year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{company.founded_year}</span>}
              {company.website && <a href={company.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3 w-3" />Website</a>}
            </div>
          </div>
          {isOwner && user && (
            <div className="flex gap-2 flex-wrap">
              <CreateJobDialog userId={user.id} subscribed={true} onRenewSubscription={() => {}} prefillCompanyName={company.name} />
            </div>
          )}
        </div>
      </motion.div>

      {company.description && <Card><CardContent className="p-5"><p className="text-sm whitespace-pre-line">{company.description}</p></CardContent></Card>}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Open Positions ({jobs.length})</h2>
        {!isOwner && <p className="text-xs text-muted-foreground">Contact email is shown inside each job detail.</p>}
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            No active jobs yet.
            {isOwner && <p className="text-sm mt-1">Click <strong>Post a Job</strong> above to add the first listing.</p>}
          </CardContent></Card>
        ) : jobs.map(j => {
          const isBoosted = j.featured_until && new Date(j.featured_until) > now;
          return (
            <Card key={j.id} className="hover:border-primary/40 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/jobs/listing/${j.id}`)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{j.title}</h3>
                      {isBoosted && <Badge className="text-[10px] bg-amber-500/20 text-amber-500 border-amber-500/30"><Rocket className="h-3 w-3 mr-1" />Boosted</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{j.location}</p>
                    {j.salary_min && (
                      <p className="text-sm text-primary font-semibold mt-1">
                        €{Number(j.salary_min).toLocaleString()}{j.salary_max ? ` – €${Number(j.salary_max).toLocaleString()}` : ""} {j.salary_currency}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/listing/${j.id}`)}>View</Button>
                    {isOwner && (
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/jobs/boost/${j.id}`)}>
                        <Rocket className="h-3.5 w-3.5 mr-1" /> Boost
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
