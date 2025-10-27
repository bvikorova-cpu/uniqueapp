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
  const [user, setUser] = useState<SupabaseUser | null>(null);

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
  
  // Form states for job seeker profile
  const [jobSeekerProfile, setJobSeekerProfile] = useState({
    position: "",
    location: "",
    description: "",
  });

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

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("job_listings").insert([{
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
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowCreateDialog(false);
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
      toast({
        title: "✅ Position Created",
        description: "Job listing has been successfully added",
      });
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
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      setIsEmployer(true);
      toast({
        title: "✅ Registration Successful",
        description: "You can now add job listings",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to register as employer",
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


  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You must be signed in to access job listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Job Listings
            </h1>
            <p className="text-muted-foreground">
              Find your dream job from around the world
            </p>
          </div>
          <div className="flex gap-2">
            {isEmployer ? (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Position
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Job Position</DialogTitle>
                  <DialogDescription>
                    Create a new job listing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Position Title *</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="e.g. Senior React Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={newJob.company_name}
                      onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                      placeholder="e.g. Tech Solutions Ltd."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="e.g. Bratislava"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={newJob.country}
                        onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                        placeholder="e.g. Slovakia"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newJob.category} onValueChange={(value) => setNewJob({ ...newJob, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORIES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Job Type *</Label>
                      <Select value={newJob.job_type} onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(JOB_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="salary_min">Salary From</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={newJob.salary_min}
                        onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary_max">Salary To</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={newJob.salary_max}
                        onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={newJob.salary_currency}
                        onChange={(e) => setNewJob({ ...newJob, salary_currency: e.target.value })}
                        placeholder="EUR"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the job position..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="List requirements..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                      placeholder="What benefits do you offer?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Contact Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newJob.contact_email}
                      onChange={(e) => setNewJob({ ...newJob, contact_email: e.target.value })}
                      placeholder="hr@company.com"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createJobMutation.mutate()}
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? "Creating..." : "Create Position"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            ) : (
              <Button onClick={() => registerEmployerMutation.mutate()} disabled={registerEmployerMutation.isPending}>
                <Building2 className="h-4 w-4 mr-2" />
                {registerEmployerMutation.isPending ? "Registering..." : "Register as Employer"}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
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
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetailsDialog(true);
                        }}
                      >
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
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
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyDialog(true);
                      }}
                    >
                      Apply for Position
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
              <Button 
                className="w-full py-6 text-lg" 
                onClick={() => {
                  setShowJobDetailsDialog(false);
                  setShowApplyDialog(true);
                }}
              >
                <Search className="h-5 w-5 mr-2" />
                Apply for This Position
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