import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, MapPin, DollarSign, Clock, Search, Plus, Building2, Globe } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { JobPreferencesDialog } from "@/components/jobs/JobPreferencesDialog";
import { JobAIAssistant } from "@/components/jobs/JobAIAssistant";
import { JobApplicationDialog } from "@/components/jobs/JobApplicationDialog";
import { OneClickApplyDialog } from "@/components/jobs/OneClickApplyDialog";
import { AIJobOptimizer } from "@/components/jobs/AIJobOptimizer";
import { WorkUserGuide } from "@/components/work/WorkUserGuide";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

const Jobs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check for payment success and activate job listing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const jobId = params.get('job_id');
    const sessionId = params.get('session_id');
    
    if (success === 'true' && jobId && sessionId) {
      // Activate the job listing
      const activateJob = async () => {
        try {
          const { error } = await supabase.functions.invoke('activate-job-listing', {
            body: { jobId, sessionId }
          });

          if (error) throw error;

          toast({
            title: "✅ Payment Successful!",
            description: "Your job listing is now active and visible to candidates",
          });
          
          // Refresh jobs list
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        } catch (error: any) {
          console.error('Activation error:', error);
          toast({
            title: "⚠️ Activation Pending",
            description: "Payment received, your listing will be activated shortly",
          });
        }
      };
      
      activateJob();
      
      // Clean up URL
      window.history.replaceState({}, '', '/jobs');
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "❌ Payment Canceled",
        description: "Your job listing was not published. You can try again anytime.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/jobs');
    }
  }, [toast, queryClient]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isEmployer, setIsEmployer] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [showJobSeekerDialog, setShowJobSeekerDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ days: number; price: number; priceId: string } | null>(null);
  
  // Form states for job seeker profile
  const [jobSeekerProfile, setJobSeekerProfile] = useState({
    position: "",
    location: "",
    description: "",
  });

  // Job listing packages
  const JOB_PACKAGES = [
    { days: 7, price: 29, priceId: "price_1SRNgrGaXSfGtYFtVbmPj1g8", popular: false },
    { days: 14, price: 49, priceId: "price_1SRNhFGaXSfGtYFtwwgk6yOC", popular: true },
    { days: 30, price: 79, priceId: "price_1SRNhXGaXSfGtYFtn9Y73lAp", popular: false },
  ];

  // Form states for creating job
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    company_name: "",
    location: "",
    country: "",
    category: "it_software",
    job_type: "full_time",
    salary_min: "",
    salary_max: "",
    salary_currency: "EUR",
    requirements: "",
    benefits: "",
    contact_email: "",
  });

  // Form states for application
  const [application, setApplication] = useState({
    cover_letter: "",
    resume_url: "",
  });

  // Check if user is employer
  useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "employer")
        .single();
      
      setIsEmployer(!!data);
      return data;
    },
    enabled: !!user,
  });

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", searchQuery, selectedCategory, selectedType, selectedCountry],
    queryFn: async () => {
      let query = supabase
        .from("job_listings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as any);
      }

      if (selectedType !== "all") {
        query = query.eq("job_type", selectedType as any);
      }

      if (selectedCountry !== "all") {
        query = query.eq("country", selectedCountry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JobListing[];
    },
  });

  // Get unique countries from jobs (filter out empty values)
  const countries = Array.from(new Set(jobs.map((job) => job.country).filter(country => country && country.trim() !== ""))).sort();

  // Create job mutation - now creates inactive job first
  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPackage) throw new Error("Must be logged in and package selected");

      const { data: jobData, error } = await supabase.from("job_listings").insert([{
        employer_id: user.id,
        title: newJob.title,
        description: newJob.description,
        company_name: newJob.company_name,
        location: newJob.location,
        country: newJob.country,
        category: newJob.category as any,
        job_type: newJob.job_type as any,
        salary_min: newJob.salary_min ? parseFloat(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? parseFloat(newJob.salary_max) : null,
        salary_currency: newJob.salary_currency,
        requirements: newJob.requirements,
        benefits: newJob.benefits,
        contact_email: newJob.contact_email,
        is_active: false, // Inactive until payment
      }]).select().single();

      if (error) throw error;
      return jobData;
    },
    onSuccess: async (jobData) => {
      if (!selectedPackage || !jobData) return;
      
      try {
        // Call payment edge function
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'create-job-listing-payment',
          {
            body: {
              jobId: jobData.id,
              priceId: selectedPackage.priceId,
              durationDays: selectedPackage.days,
            },
          }
        );

        if (paymentError) throw paymentError;

        // Open Stripe checkout in new tab
        if (paymentData?.url) {
          window.open(paymentData.url, '_blank');
          toast({
            title: "🔄 Payment Required",
            description: "Please complete payment in the new tab to activate your listing",
          });
        }

        // Reset form and close dialogs
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        setShowCreateDialog(false);
        setShowPackageDialog(false);
        setSelectedPackage(null);
        setNewJob({
          title: "",
          description: "",
          company_name: "",
          location: "",
          country: "",
          category: "it_software",
          job_type: "full_time",
          salary_min: "",
          salary_max: "",
          salary_currency: "EUR",
          requirements: "",
          benefits: "",
          contact_email: "",
        });
      } catch (error: any) {
        toast({
          title: "❌ Payment Error",
          description: error.message || "Failed to process payment",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create position",
        variant: "destructive",
      });
    },
  });

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedJob) throw new Error("Must be logged in");

      const { error } = await supabase.from("job_applications").insert({
        job_id: selectedJob.id,
        applicant_id: user.id,
        ...application,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowApplyDialog(false);
      setSelectedJob(null);
      setApplication({
        cover_letter: "",
        resume_url: "",
      });
      toast({
        title: "✅ Application Sent",
        description: "Your application has been successfully sent to the employer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send application",
        variant: "destructive",
      });
    },
  });

  // Register as employer
  const registerEmployerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "employer",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast({
        title: "✅ Registered as Employer",
        description: "Please complete verification to post jobs",
      });
      navigate('/employer-verification');
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create job seeker profile mutation
  const createJobSeekerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      // Here you could save to a job_seekers table if you want to persist this
      // For now we'll just show a success message
      return jobSeekerProfile;
    },
    onSuccess: () => {
      setShowJobSeekerDialog(false);
      setJobSeekerProfile({
        position: "",
        location: "",
        description: "",
      });
      toast({
        title: "✅ Profile Created",
        description: "Your job seeker profile has been created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });


  const handleApply = (job: JobListing) => {
    if (!user) {
      toast({
        title: t('jobs.loginRequired'),
        description: t('jobs.loginDescription'),
      });
      window.location.href = "/auth";
      return;
    }
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const handleViewDetails = (job: JobListing) => {
    if (!user) {
      toast({
        title: t('jobs.loginRequired'),
        description: t('jobs.loginToApplyDesc'),
      });
      window.location.href = "/auth";
      return;
    }
    setSelectedJob(job);
    setShowJobDetailsDialog(true);
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Info banner for non-authenticated users */}
        {!user && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">{t('jobs.welcome', 'Welcome to the job portal!')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('jobs.welcomeDesc', 'You can freely browse all job listings. To apply for positions, you must log in.')}
                  </p>
                </div>
                <Button onClick={() => window.location.href = "/auth"}>
                  {t('jobs.login')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 bg-gradient-primary bg-clip-text text-transparent">
              {t('jobs.title')}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              {user 
                ? t('jobs.subtitle')
                : t('jobs.browseDesc', 'Browse job listings for free - log in to apply')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkUserGuide />
            {user && (
              <>
                <JobPreferencesDialog userId={user.id} />
                <JobAIAssistant />
                <AIJobOptimizer />
              </>
            )}
            {user && isEmployer && (
              <Button onClick={() => navigate('/employer-dashboard')} size="sm" className="text-xs">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">{t('jobs.dashboard.title')}</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            )}
            {user && !isEmployer && (
              <Button onClick={() => registerEmployerMutation.mutate()} disabled={registerEmployerMutation.isPending} size="sm" className="text-xs">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">{registerEmployerMutation.isPending ? "Registering..." : "Register as Employer"}</span>
                <span className="sm:hidden">{registerEmployerMutation.isPending ? "..." : "Employer"}</span>
              </Button>
            )}
            {!user && (
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search positions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(JOB_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {countries.length > 0 && (
              <div className="mt-4">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No positions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-elegant transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle 
                        className="text-xl mb-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleViewDetails(job)}
                      >
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate max-w-[100px] sm:max-w-none">{job.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate max-w-[80px] sm:max-w-none">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                          {job.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {CATEGORIES[job.category as keyof typeof CATEGORIES]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                          <Clock className="h-3 w-3" />
                          {JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}
                        </span>
                        {job.salary_min && job.salary_max && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <DollarSign className="h-3 w-3" />
                            {job.salary_min} - {job.salary_max} {job.salary_currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Job Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {job.description}
                    </p>
                  </div>
                  
                  {job.requirements && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {job.requirements}
                      </p>
                    </div>
                  )}
                  
                  {job.benefits && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Benefits</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {job.benefits}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Contact</h4>
                    <p className="text-sm text-muted-foreground">{job.contact_email}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {job.applications_count} applications
                    </span>
                    <Button onClick={() => handleApply(job)}>
                      {user ? "Apply" : "Sign In to Apply"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedJob?.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {selectedJob?.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted: {selectedJob && new Date(selectedJob.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Badges Section */}
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {selectedJob && CATEGORIES[selectedJob.category as keyof typeof CATEGORIES]}
                </span>
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-secondary border border-secondary-foreground/20">
                  <Clock className="h-4 w-4" />
                  {selectedJob && JOB_TYPES[selectedJob.job_type as keyof typeof JOB_TYPES]}
                </span>
                {selectedJob?.salary_min && selectedJob?.salary_max && (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <DollarSign className="h-4 w-4" />
                    {selectedJob.salary_min} - {selectedJob.salary_max} {selectedJob.salary_currency}
                  </span>
                )}
              </div>

              {/* Job Description */}
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job Description
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedJob?.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedJob?.requirements && (
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Requirements and Qualifications
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {selectedJob?.benefits && (
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Benefits and Perks
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedJob.benefits}
                  </p>
                </div>
              )}

              {/* Salary Details */}
              {selectedJob?.salary_min && selectedJob?.salary_max && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-700 dark:text-green-400" />
                    Salary Range
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Minimum Salary</p>
                      <p className="text-lg font-semibold">{selectedJob.salary_min} {selectedJob.salary_currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Maximum Salary</p>
                      <p className="text-lg font-semibold">{selectedJob.salary_max} {selectedJob.salary_currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Currency</p>
                      <p className="text-lg font-semibold">{selectedJob.salary_currency}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact and Application Info */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Application Email</p>
                    <p className="font-semibold text-lg">{selectedJob?.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground">Number of Applications</p>
                      <p className="font-semibold text-lg">{selectedJob?.applications_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employment Type</p>
                      <p className="font-semibold">{selectedJob && JOB_TYPES[selectedJob.job_type as keyof typeof JOB_TYPES]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-semibold">{selectedJob && CATEGORIES[selectedJob.category as keyof typeof CATEGORIES]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {selectedJob && user && (
                <OneClickApplyDialog
                  jobId={selectedJob.id}
                  jobTitle={selectedJob.title}
                  companyName={selectedJob.company_name}
                />
              )}
              {!user && (
                <Button 
                  className="w-full py-6 text-lg" 
                  onClick={() => {
                    toast({
                      title: "Sign In Required",
                      description: "You must sign in to apply for this position",
                    });
                    window.location.href = "/auth";
                  }}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Sign In to Apply
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Package Selection Dialog */}
        <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Choose Your Job Listing Package</DialogTitle>
              <DialogDescription>
                Select how long you want your job listing to be visible
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
              {JOB_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.days}
                  className={`relative cursor-pointer transition-all hover:shadow-elegant ${
                    selectedPackage?.days === pkg.days ? 'ring-2 ring-primary' : ''
                  } ${pkg.popular ? 'border-primary' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold">
                      {pkg.days} Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">€{pkg.price}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        €{(pkg.price / pkg.days).toFixed(2)} per day
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Visible for {pkg.days} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Unlimited applications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Full job details display</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Email notifications</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPackageDialog(false);
                  setShowCreateDialog(true);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => createJobMutation.mutate()}
                disabled={!selectedPackage || createJobMutation.isPending}
              >
                {createJobMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for Position</DialogTitle>
              <DialogDescription>
                {selectedJob?.title} - {selectedJob?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea
                  id="cover_letter"
                  value={application.cover_letter}
                  onChange={(e) => setApplication({ ...application, cover_letter: e.target.value })}
                  placeholder="Write why you're a suitable candidate..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="resume">Resume Link (optional)</Label>
                <Input
                  id="resume"
                  type="url"
                  value={application.resume_url}
                  onChange={(e) => setApplication({ ...application, resume_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Contact:</strong> {selectedJob?.contact_email}
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "Sending..." : "Send Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Jobs;