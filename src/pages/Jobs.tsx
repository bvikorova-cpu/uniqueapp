import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, MapPin, DollarSign, Clock, Search, Plus, Building2, Globe, Wrench, Flame, Trophy, Medal, Zap, Bookmark, ListChecks, Bell, HelpCircle, Users, Sparkles, Map as MapIcon } from "lucide-react";
import { ResumeManagerDialog } from "@/components/jobs/ResumeManagerDialog";
import CandidateSearchProfileDialog from "@/components/jobs/CandidateSearchProfileDialog";
import { JobsPushButton } from "@/components/jobs/JobsPushButton";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { MatchScoreBadge } from "@/components/jobs/MatchScoreBadge";
import { CoverLetterDialog } from "@/components/jobs/CoverLetterDialog";
import JobsCinematicHero from "@/components/jobs/JobsCinematicHero";
import { JobsHeroSection } from "@/components/jobs/JobsHeroSection";
import { QuickFilterChips } from "@/components/jobs/QuickFilterChips";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import { JobCardRedesigned } from "@/components/jobs/JobCardRedesigned";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { JobPreferencesDialog } from "@/components/jobs/JobPreferencesDialog";
import { JobAIAssistant } from "@/components/jobs/JobAIAssistant";

import { OneClickApplyDialog } from "@/components/jobs/OneClickApplyDialog";
import { AIJobOptimizer } from "@/components/jobs/AIJobOptimizer";
import { WorkUserGuide } from "@/components/work/WorkUserGuide";

import { useNavigate } from "react-router-dom";
import JobsToolsGrid from "@/components/jobs/JobsToolsGrid";
import JobsApplicationStreaks from "@/components/jobs/JobsApplicationStreaks";
import JobsSkillLeaderboard from "@/components/jobs/JobsSkillLeaderboard";
import JobsCareerAchievements from "@/components/jobs/JobsCareerAchievements";
import { SEO } from "@/components/SEO";
import JobsWeeklyChallenges from "@/components/jobs/JobsWeeklyChallenges";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface JobListing {
  id: string;
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
  contact_email: string;
  applications_count: number;
  created_at: string;
}

const CATEGORIES = {
  it_software: "IT & Software",
  marketing_sales: "Marketing & Sales",
  finance_accounting: "Finance & Accounting",
  healthcare: "Healthcare",
  education: "Education",
  engineering: "Engineering",
  hospitality: "Hospitality",
  retail: "Retail",
  manufacturing: "Manufacturing",
  construction: "Construction",
  transportation: "Transportation",
  other: "Other",
};

const JOB_TYPES = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

type ActiveTab = "jobs" | "tools" | "streaks" | "leaderboard" | "achievements" | "challenges";

const TABS: { id: ActiveTab; label: string; icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "tools", label: "AI Tools", icon: Wrench },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "leaderboard", label: "Ranks", icon: Trophy },
  { id: "achievements", label: "Badges", icon: Medal },
  { id: "challenges", label: "Challenges", icon: Zap },
];

const Jobs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("jobs");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check for payment success and activate job listing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const jobId = params.get('job_id');
    const sessionId = params.get('session_id');
    if (success === 'true' && jobId && sessionId) {
      const activateJob = async () => {
        try {
          const { error } = await supabase.functions.invoke('activate-job-listing', {
            body: { jobId, sessionId }
          });
          if (error) throw error;
          toast({ title: "✅ Payment Successful!", description: "Your job listing is now active and visible to candidates" });
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        } catch (error: any) {
          toast({ title: "⚠️ Activation Pending", description: "Payment received, your listing will be activated shortly" });
        }
      };
      activateJob();
      window.history.replaceState({}, '', '/jobs');
    } else if (params.get('canceled') === 'true') {
      toast({ title: "❌ Payment Canceled", description: "Your job listing was not published.", variant: "destructive" });
      window.history.replaceState({}, '', '/jobs');
    }
  }, [toast, queryClient]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isEmployer, setIsEmployer] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const [application, setApplication] = useState({ cover_letter: "", resume_url: "" });


  useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("user_roles").select("*").eq("user_id", user.id).eq("role", "employer").single();
      setIsEmployer(!!data);
      return data;
    },
    enabled: !!user,
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", searchQuery, selectedCategory, selectedType, selectedCountry],
    queryFn: async () => {
      // Read from sanitized view (excludes employer contact_email).
      // Employers/admins/applicants get the full row by querying job_listings
      // directly (RLS allows it). Anonymous browsers stay PII-safe.
      let query = (supabase.from as any)("job_listings_public")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      if (selectedCategory !== "all") query = query.eq("category", selectedCategory as any);
      if (selectedType !== "all") query = query.eq("job_type", selectedType as any);
      if (selectedCountry !== "all") query = query.eq("country", selectedCountry);
      const { data, error } = await query;
      if (error) throw error;
      return data as JobListing[];
    },
  });

  const countries = Array.from(new Set(jobs.map((job) => job.country).filter(c => c && c.trim() !== ""))).sort();




  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedJob) throw new Error("Must be logged in");
      const { error } = await supabase.from("job_applications").insert({ job_id: selectedJob.id, applicant_id: user.id, ...application });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowApplyDialog(false);
      setSelectedJob(null);
      setApplication({ cover_letter: "", resume_url: "" });
      toast({ title: "✅ Application Sent", description: "Your application has been sent" });
    },
    onError: (error: any) => { toast({ title: "❌ Error", description: error.message, variant: "destructive" }); },
  });

  const registerEmployerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "employer" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast({ title: "✅ Registered as Employer", description: "Please complete verification to post jobs" });
      navigate('/employer-verification');
    },
    onError: (error: Error) => { toast({ title: "❌ Registration Failed", description: error.message, variant: "destructive" }); },
  });

  const filteredJobs = jobs.filter((job) => {
    if (!quickFilter) return true;
    switch (quickFilter) {
      case "remote": return job.job_type === "remote";
      case "full_time": return job.job_type === "full_time";
      case "part_time": return job.job_type === "part_time";
      case "internship": return job.job_type === "internship";
      case "it_software": return job.category === "it_software";
      case "hot": return job.applications_count > 10;
      case "new": return new Date(job.created_at) > new Date(Date.now() - 86400000);
      case "high_salary": return (job.salary_max ?? 0) > 50000;
      default: return true;
    }
  });

  const handleApply = (job: JobListing) => {
    if (!user) { toast({ title: "Login Required", description: "Please sign in to apply" }); window.location.href = "/auth"; return; }
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const handleViewDetails = (job: JobListing) => {
    if (!user) { toast({ title: "Login Required", description: "Please sign in to view details" }); window.location.href = "/auth"; return; }
    setSelectedJob(job);
    setShowJobDetailsDialog(true);
  };

  return (
    <>
      <SEO
        title="Jobs - Find your next career opportunity"
        description="Browse jobs, apply with AI assistance and track applications. Employers post jobs and find verified candidates on Unique."
        canonical="/jobs"
      />
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Cinematic Hero */}
        <JobsCinematicHero
          totalJobs={jobs.length}
          totalCompanies={new Set(jobs.map(j => j.company_name)).size}
          totalApplications={jobs.reduce((sum, j) => sum + j.applications_count, 0)}
          streak={0}
        />
        <HeroRewardedAd sectionKey="page_jobs" />

        <JobsHeroSection
          totalJobs={jobs.length}
          totalCompanies={new Set(jobs.map(j => j.company_name)).size}
          totalApplications={jobs.reduce((sum, j) => sum + j.applications_count, 0)}
        />


        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30">
          {TABS.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className={`text-xs gap-1.5 ${activeTab === tab.id ? "bg-amber-500/90 hover:bg-amber-600 text-white" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "tools" && <JobsToolsGrid />}
        {activeTab === "streaks" && <JobsApplicationStreaks />}
        {activeTab === "leaderboard" && <JobsSkillLeaderboard />}
        {activeTab === "achievements" && <JobsCareerAchievements />}
        {activeTab === "challenges" && <JobsWeeklyChallenges />}

        {activeTab === "jobs" && (
          <>
            {/* Info banner for non-authenticated users */}
            {!user && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Welcome to the Job Portal!</p>
                      <p className="text-sm text-muted-foreground">Browse all job listings for free. Sign in to apply for positions.</p>
                    </div>
                    <Button onClick={() => window.location.href = "/auth"}>Sign In</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <WorkUserGuide />
              {user && (
                <>
                  <JobPreferencesDialog userId={user.id} />
                  <JobAIAssistant />
                  <AIJobOptimizer />
                  <ResumeManagerDialog />
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/saved')}>
                    <Bookmark className="h-3.5 w-3.5 mr-1" /> Saved
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/applications')}>
                    <ListChecks className="h-3.5 w-3.5 mr-1" /> Tracker
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/alerts')}>
                    <Bell className="h-3.5 w-3.5 mr-1" /> Alerts
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/companies')}>
                    <Building2 className="h-3.5 w-3.5 mr-1" /> Companies
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/salaries')}>
                    <DollarSign className="h-3.5 w-3.5 mr-1" /> Salaries
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/interviews')}>
                    <HelpCircle className="h-3.5 w-3.5 mr-1" /> Interviews
                  </Button>
                  <CandidateSearchProfileDialog />
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/for-you')}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> For You
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/map')}>
                    <MapIcon className="h-3.5 w-3.5 mr-1" /> Map
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/mock-interview')}>
                    🎤 Mock Interview
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/assessments')}>
                    🏆 Assessments
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/career-path')}>
                    🗺️ Career Path
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/referrals')}>
                    🤝 Referrals
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/video-resumes')}>
                    🎬 Video Resume
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/diversity/self-id')}>
                    💗 Self-ID
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/references')}>
                    👥 References
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/jobs/background-checks')}>
                    🛡️ BG Checks
                  </Button>
                  <JobsPushButton />
                </>
              )}
              {user && isEmployer && (
                <>
                  <Button onClick={() => navigate('/employer-dashboard')} size="sm" className="text-xs">
                    <Building2 className="h-3.5 w-3.5 mr-1" /> Dashboard
                  </Button>
                  <Button onClick={() => navigate('/jobs/candidate-search')} size="sm" variant="outline" className="text-xs">
                    <Users className="h-3.5 w-3.5 mr-1" /> Find candidates
                  </Button>
                  <Button onClick={() => navigate('/jobs/rejection-templates')} size="sm" variant="outline" className="text-xs">
                    <HelpCircle className="h-3.5 w-3.5 mr-1" /> Templates
                  </Button>
                  <Button onClick={() => navigate('/jobs/diversity/reports')} size="sm" variant="outline" className="text-xs">
                    📊 Diversity
                  </Button>
                  <Button onClick={() => navigate('/jobs/ai-jd-writer')} size="sm" variant="outline" className="text-xs">
                    ✨ AI JD Writer
                  </Button>
                  <Button onClick={() => navigate('/jobs/onboarding')} size="sm" variant="outline" className="text-xs">
                    📋 Onboarding
                  </Button>
                  <Button onClick={() => navigate('/jobs/background-checks')} size="sm" variant="outline" className="text-xs">
                    🛡️ BG Checks
                  </Button>
                  <Button onClick={() => navigate('/jobs/templates')} size="sm" variant="outline" className="text-xs">
                    📄 Templates
                  </Button>
                  <Button onClick={() => navigate('/jobs/bulk-hiring')} size="sm" variant="outline" className="text-xs">
                    👥 Bulk Hiring
                  </Button>
                  <Button onClick={() => navigate('/jobs/headhunters')} size="sm" variant="outline" className="text-xs">
                    🎯 Headhunters
                  </Button>
                </>
              )}
              {user && !isEmployer && (
                <Button onClick={() => registerEmployerMutation.mutate()} disabled={registerEmployerMutation.isPending} size="sm" className="text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  {registerEmployerMutation.isPending ? "Registering..." : "Register as Employer"}
                </Button>
              )}
              {!user && <Button onClick={() => window.location.href = "/auth"} size="sm">Sign In</Button>}
            </div>

            {/* Filters */}
            <Card className="mb-4 sm:mb-6">
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search positions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORIES).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(JOB_TYPES).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {countries.length > 0 && (
                  <div className="mt-4">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {countries.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <QuickFilterChips activeFilter={quickFilter} onFilterChange={setQuickFilter} />

            {/* Main Content: Jobs + Sidebar */}
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (<div key={i} className="h-40 rounded-2xl bg-muted/50" />))}
                    </div>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                      <Briefcase className="h-10 w-10 text-amber-500" />
                    </div>
                    <p className="text-lg font-semibold mb-1">
                      {jobs.length === 0 ? "Be the first employer" : "No positions found"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {jobs.length === 0
                        ? "No active job listings yet. Post the first one and reach thousands of candidates."
                        : "Try adjusting your filters or search query"}
                    </p>
                    {user && !isEmployer && jobs.length === 0 && (
                      <Button onClick={() => registerEmployerMutation.mutate()} disabled={registerEmployerMutation.isPending} size="sm">
                        <Building2 className="h-4 w-4 mr-1.5" />
                        Register as Employer
                      </Button>
                    )}
                    {user && isEmployer && jobs.length === 0 && (
                      <Button onClick={() => navigate('/employer-dashboard')} size="sm">
                        <Plus className="h-4 w-4 mr-1.5" /> Post a Job
                      </Button>
                    )}
                    {!user && jobs.length === 0 && (
                      <Button onClick={() => window.location.href = "/auth"} size="sm">Sign In to Post</Button>
                    )}
                  </div>

                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-medium px-1">{filteredJobs.length} position{filteredJobs.length !== 1 ? "s" : ""} found</p>
                    {filteredJobs.map((job) => (
                      <JobCardRedesigned key={job.id} job={job} onViewDetails={handleViewDetails} onApply={handleApply} isLoggedIn={!!user} />
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden lg:block w-72 xl:w-80 shrink-0">
                <div className="sticky top-24"><JobsSidebar /></div>
              </div>
            </div>
          </>
        )}

        {/* Job Details Dialog */}
        <Dialog open={showJobDetailsDialog} onOpenChange={setShowJobDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">{selectedJob?.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{selectedJob?.company_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedJob?.location}</div>
                    <div className="flex items-center gap-1"><Globe className="h-4 w-4" />{selectedJob?.country}</div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted: {selectedJob && new Date(selectedJob.created_at).toLocaleDateString('en-US')}</div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {selectedJob && CATEGORIES[selectedJob.category as keyof typeof CATEGORIES]}
                </span>
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-secondary border border-secondary-foreground/20">
                  <Clock className="h-4 w-4" />{selectedJob && JOB_TYPES[selectedJob.job_type as keyof typeof JOB_TYPES]}
                </span>
                {selectedJob?.salary_min && selectedJob?.salary_max && (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <DollarSign className="h-4 w-4" />{selectedJob.salary_min} - {selectedJob.salary_max} {selectedJob.salary_currency}
                  </span>
                )}
              </div>
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedJob?.description}</p>
              </div>
              {selectedJob?.requirements && (
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-xl mb-3">Requirements and Qualifications</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedJob.requirements}</p>
                </div>
              )}
              {selectedJob?.benefits && (
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-xl mb-3">Benefits and Perks</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedJob.benefits}</p>
                </div>
              )}
              {selectedJob?.salary_min && selectedJob?.salary_max && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-700 dark:text-green-400" />Salary Range</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><p className="text-sm text-muted-foreground mb-1">Minimum</p><p className="text-lg font-semibold">{selectedJob.salary_min} {selectedJob.salary_currency}</p></div>
                    <div><p className="text-sm text-muted-foreground mb-1">Maximum</p><p className="text-lg font-semibold">{selectedJob.salary_max} {selectedJob.salary_currency}</p></div>
                    <div><p className="text-sm text-muted-foreground mb-1">Currency</p><p className="text-lg font-semibold">{selectedJob.salary_currency}</p></div>
                  </div>
                </div>
              )}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="font-bold text-xl mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div><p className="text-sm text-muted-foreground mb-1">Application Email</p><p className="font-semibold text-lg">{selectedJob?.contact_email}</p></div>
                  <div className="flex items-center gap-6 text-sm pt-2 border-t border-border">
                    <div><p className="text-muted-foreground">Applications</p><p className="font-semibold text-lg">{selectedJob?.applications_count}</p></div>
                    <div><p className="text-muted-foreground">Type</p><p className="font-semibold">{selectedJob && JOB_TYPES[selectedJob.job_type as keyof typeof JOB_TYPES]}</p></div>
                    <div><p className="text-muted-foreground">Category</p><p className="font-semibold">{selectedJob && CATEGORIES[selectedJob.category as keyof typeof CATEGORIES]}</p></div>
                  </div>
                </div>
              </div>
              {selectedJob && user && (
                <div className="flex flex-wrap gap-2 items-center">
                  <MatchScoreBadge jobId={selectedJob.id} />
                  <SaveJobButton jobId={selectedJob.id} />
                  <CoverLetterDialog jobId={selectedJob.id} jobTitle={selectedJob.title} jobDescription={selectedJob.description} companyName={selectedJob.company_name} />
                  <OneClickApplyDialog jobId={selectedJob.id} jobTitle={selectedJob.title} companyName={selectedJob.company_name} />
                </div>
              )}
              {!user && (
                <Button className="w-full py-6 text-lg" onClick={() => { toast({ title: "Sign In Required" }); window.location.href = "/auth"; }}>
                  <Search className="h-5 w-5 mr-2" /> Sign In to Apply
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>



        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for Position</DialogTitle>
              <DialogDescription>{selectedJob?.title} - {selectedJob?.company_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea id="cover_letter" value={application.cover_letter} onChange={(e) => setApplication({ ...application, cover_letter: e.target.value })} placeholder="Write why you're a suitable candidate..." rows={6} />
              </div>
              <div>
                <Label htmlFor="resume">Resume Link (optional)</Label>
                <Input id="resume" type="url" value={application.resume_url} onChange={(e) => setApplication({ ...application, resume_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="bg-muted p-4 rounded-lg"><p className="text-sm text-muted-foreground"><strong>Contact:</strong> {selectedJob?.contact_email}</p></div>
              <Button className="w-full" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                {applyMutation.isPending ? "Sending..." : "Send Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
};

export default Jobs;
