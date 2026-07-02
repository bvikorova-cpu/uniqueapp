import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Globe, MapPin, Users, Calendar, BadgeCheck, Star, Loader2, MessageSquarePlus, DollarSign, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ReviewDialog } from "@/components/jobs/ReviewDialog";
import { SalaryDialog } from "@/components/jobs/SalaryDialog";
import { InterviewQuestionDialog } from "@/components/jobs/InterviewQuestionDialog";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_COMPANYPROFILE = [
  { title: "Overview", desc: "Read the company bio, size, industry, HQ and website." },
  { title: "See open roles", desc: "All current job posts appear as cards \u2014 tap one to open the full detail." },
  { title: "Read reviews", desc: "Employee ratings and reviews are aggregated here. Verified reviews are marked." },
  { title: "Follow the company", desc: "Get notified about new posts. Owners can claim/edit the profile in the employer area." },
];

export default function CompanyProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [qOpen, setQOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("company_profiles").select("*").eq("slug", slug).maybeSingle();
    if (!c) { setLoading(false); return; }
    setCompany(c);
    const [r, s, q, j] = await Promise.all([
      supabase.from("company_reviews").select("*").eq("company_id", c.id).order("created_at", { ascending: false }),
      supabase.from("salary_reports").select("*").eq("company_id", c.id).order("created_at", { ascending: false }),
      supabase.from("interview_questions").select("*").eq("company_id", c.id).order("created_at", { ascending: false }),
      supabase.from("job_listings").select("id,title,location,salary_min,salary_max").eq("company_name", c.name).eq("is_active", true).limit(10),
    ]);
    setReviews(r.data || []); setSalaries(s.data || []); setQuestions(q.data || []); setJobs(j.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!company) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Company not found.</p><Button onClick={() => navigate("/jobs/companies")} className="mt-4">Back to Companies</Button></div>;

  const avgSalary = salaries.length ? Math.round(salaries.reduce((s, x) => s + Number(x.base_salary || 0), 0) / salaries.length) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-12 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Company Profile" intro="Public page of a single employer." steps={HOW_STEPS_COMPANYPROFILE} variant="compact" />
      </div>
      <SEO title={`${company.name} — Reviews, Salaries, Jobs`} description={company.description?.slice(0, 155) || `${company.name} company profile.`} />

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
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />{Number(company.rating_avg || 0).toFixed(1)}</span>
              <span className="text-muted-foreground">{reviews.length} reviews</span>
              <span className="text-muted-foreground">{salaries.length} salaries</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setReviewOpen(true)} className="gap-1"><MessageSquarePlus className="h-4 w-4" />Review</Button>
            <Button size="sm" variant="secondary" onClick={() => setSalaryOpen(true)} className="gap-1"><DollarSign className="h-4 w-4" />Salary</Button>
            <Button size="sm" variant="secondary" onClick={() => setQOpen(true)} className="gap-1"><HelpCircle className="h-4 w-4" />Interview Q</Button>
          </div>
        </div>
      </motion.div>

      {company.description && <Card><CardContent className="p-5"><p className="text-sm whitespace-pre-line">{company.description}</p></CardContent></Card>}

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="salaries">Salaries ({salaries.length})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({questions.length})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-3 mt-4">
          {reviews.length === 0 ? <p className="text-center text-muted-foreground py-8">No reviews yet.</p> :
            reviews.map(r => (
              <Card key={r.id}><CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold">{r.title}</h3>
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />{r.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.job_title || "Anonymous"} · {r.employment_status || ""}</p>
                {r.pros && <p className="text-sm mt-2"><span className="font-semibold text-emerald-500">Pros:</span> {r.pros}</p>}
                {r.cons && <p className="text-sm mt-1"><span className="font-semibold text-rose-500">Cons:</span> {r.cons}</p>}
                {r.advice && <p className="text-sm mt-1 text-muted-foreground"><span className="font-semibold">Advice:</span> {r.advice}</p>}
              </CardContent></Card>
            ))}
        </TabsContent>

        <TabsContent value="salaries" className="space-y-3 mt-4">
          {salaries.length > 0 && (
            <Card className="border-primary/30 bg-primary/5"><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Average base salary</p>
              <p className="text-2xl font-black text-primary">€{avgSalary.toLocaleString()}</p>
            </CardContent></Card>
          )}
          {salaries.length === 0 ? <p className="text-center text-muted-foreground py-8">No salary data yet.</p> :
            salaries.map(s => (
              <Card key={s.id}><CardContent className="p-4 flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{s.job_title}</h3>
                  <p className="text-xs text-muted-foreground">{s.years_experience} yrs · {s.location || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">€{Number(s.base_salary).toLocaleString()}</p>
                  {(s.bonus > 0 || s.equity > 0) && <p className="text-xs text-muted-foreground">+€{(Number(s.bonus) + Number(s.equity)).toLocaleString()} bonus/equity</p>}
                </div>
              </CardContent></Card>
            ))}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-3 mt-4">
          {questions.length === 0 ? <p className="text-center text-muted-foreground py-8">No interview questions yet.</p> :
            questions.map(q => (
              <Card key={q.id}><CardContent className="p-4">
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold">{q.question}</h3>
                  <Badge variant="outline" className="capitalize">{q.difficulty}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{q.job_title} · {q.category}</p>
                {q.answer_tips && <p className="text-sm mt-2 text-muted-foreground">💡 {q.answer_tips}</p>}
              </CardContent></Card>
            ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-3 mt-4">
          {jobs.length === 0 ? <p className="text-center text-muted-foreground py-8">No active jobs.</p> :
            jobs.map(j => (
              <Card key={j.id} className="hover:border-primary/40 cursor-pointer" onClick={() => navigate(`/jobs?id=${j.id}`)}>
                <CardContent className="p-4">
                  <h3 className="font-bold">{j.title}</h3>
                  <p className="text-xs text-muted-foreground">{j.location}</p>
                  {j.salary_min && <p className="text-sm text-primary font-semibold mt-1">€{j.salary_min}{j.salary_max ? `–€${j.salary_max}` : ""}</p>}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} companyId={company.id} onSubmitted={load} />
      <SalaryDialog open={salaryOpen} onOpenChange={setSalaryOpen} companyId={company.id} companyName={company.name} onSubmitted={load} />
      <InterviewQuestionDialog open={qOpen} onOpenChange={setQOpen} companyId={company.id} companyName={company.name} onSubmitted={load} />
    </div>
  );
}
