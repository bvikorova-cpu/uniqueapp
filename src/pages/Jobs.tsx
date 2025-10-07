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
  marketing_sales: "Marketing & Predaj",
  finance_accounting: "Financie & Účtovníctvo",
  healthcare: "Zdravotníctvo",
  education: "Vzdelávanie",
  engineering: "Inžinierstvo",
  hospitality: "Pohostinstvo",
  retail: "Maloobchod",
  manufacturing: "Výroba",
  construction: "Stavebníctvo",
  transportation: "Doprava",
  other: "Ostatné",
};

const JOB_TYPES = {
  full_time: "Plný úväzok",
  part_time: "Čiastočný úväzok",
  contract: "Zmluva",
  internship: "Stáž",
  remote: "Na diaľku",
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

  // Get unique countries from jobs
  const countries = Array.from(new Set(jobs.map((job) => job.country))).sort();

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
        title: "✅ Pozícia vytvorená",
        description: "Pracovná ponuka bola úspešne pridaná",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa vytvoriť pozíciu",
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
        title: "✅ Žiadosť odoslaná",
        description: "Vaša žiadosť bola úspešne odoslaná zamestnávateľovi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa odoslať žiadosť",
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
        title: "✅ Registrácia úspešná",
        description: "Teraz môžete pridávať pracovné ponuky",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa zaregistrovať ako zamestnávateľ",
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
        title: "✅ Profil vytvorený",
        description: "Váš profil hľadajúceho prácu bol vytvorený",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa vytvoriť profil",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Prihlásenie potrebné</CardTitle>
            <CardDescription>
              Pre prístup k pracovným ponukám sa musíte prihlásiť
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/auth"}>
              Prihlásiť sa
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
              Pracovné Ponuky
            </h1>
            <p className="text-muted-foreground">
              Nájdite svoju vysnívanú prácu z celého sveta
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showJobSeekerDialog} onOpenChange={setShowJobSeekerDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Hľadám prácu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Hľadám prácu</DialogTitle>
                  <DialogDescription>
                    Zadajte údaje o tom, akú prácu hľadáte
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seeker-position">Pozícia *</Label>
                    <Input
                      id="seeker-position"
                      value={jobSeekerProfile.position}
                      onChange={(e) => setJobSeekerProfile({ ...jobSeekerProfile, position: e.target.value })}
                      placeholder="napr. Frontend Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seeker-location">Lokalita *</Label>
                    <Input
                      id="seeker-location"
                      value={jobSeekerProfile.location}
                      onChange={(e) => setJobSeekerProfile({ ...jobSeekerProfile, location: e.target.value })}
                      placeholder="napr. Bratislava alebo Remote"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seeker-description">Popis *</Label>
                    <Textarea
                      id="seeker-description"
                      value={jobSeekerProfile.description}
                      onChange={(e) => setJobSeekerProfile({ ...jobSeekerProfile, description: e.target.value })}
                      placeholder="Popíšte svoje skúsenosti, zručnosti a čo hľadáte..."
                      rows={6}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createJobSeekerMutation.mutate()}
                    disabled={createJobSeekerMutation.isPending || !jobSeekerProfile.position || !jobSeekerProfile.location || !jobSeekerProfile.description}
                  >
                    {createJobSeekerMutation.isPending ? "Vytváram..." : "Vytvoriť profil"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {isEmployer ? (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Pridať pozíciu
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pridať pracovnú pozíciu</DialogTitle>
                  <DialogDescription>
                    Vytvorte novú pracovnú ponuku
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Názov pozície *</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="napr. Senior React Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Názov firmy *</Label>
                    <Input
                      id="company"
                      value={newJob.company_name}
                      onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                      placeholder="napr. Tech Solutions s.r.o."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Lokalita *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="napr. Bratislava"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Krajina *</Label>
                      <Input
                        id="country"
                        value={newJob.country}
                        onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                        placeholder="napr. Slovensko"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategória *</Label>
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
                      <Label htmlFor="type">Typ práce *</Label>
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
                      <Label htmlFor="salary_min">Plat od</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={newJob.salary_min}
                        onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary_max">Plat do</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={newJob.salary_max}
                        onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Mena</Label>
                      <Input
                        id="currency"
                        value={newJob.salary_currency}
                        onChange={(e) => setNewJob({ ...newJob, salary_currency: e.target.value })}
                        placeholder="EUR"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Popis pozície *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Popíšte pracovnú pozíciu..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Požiadavky</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="Vymenujte požiadavky..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="benefits">Benefity</Label>
                    <Textarea
                      id="benefits"
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                      placeholder="Aké benefity ponúkate?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Kontaktný email *</Label>
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
                    {createJobMutation.isPending ? "Vytváram..." : "Vytvoriť pozíciu"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            ) : (
              <Button onClick={() => registerEmployerMutation.mutate()} disabled={registerEmployerMutation.isPending}>
                <Building2 className="h-4 w-4 mr-2" />
                {registerEmployerMutation.isPending ? "Registrujem..." : "Registrovať ako zamestnávateľ"}
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
                    placeholder="Hľadať pozície..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategória" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky kategórie</SelectItem>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ práce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky typy</SelectItem>
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
                    <SelectValue placeholder="Krajina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky krajiny</SelectItem>
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
            <p className="text-muted-foreground">Načítavam pozície...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Žiadne pozície neboli nájdené</p>
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
                    <h4 className="font-semibold text-sm mb-2">Popis pozície</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                  
                  {job.requirements && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Požiadavky</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.requirements}
                      </p>
                    </div>
                  )}
                  
                  {job.benefits && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Benefity</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.benefits}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Kontakt</h4>
                    <p className="text-sm text-muted-foreground">{job.contact_email}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {job.applications_count} žiadostí
                    </span>
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyDialog(true);
                      }}
                    >
                      Reagovať na ponuku
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
                      Zverejnené: {selectedJob && new Date(selectedJob.created_at).toLocaleDateString('sk-SK')}
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
                  Popis pracovnej pozície
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
                    Požiadavky a kvalifikácia
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
                    Benefity a výhody
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
                    Platové ohodnotenie
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Minimálny plat</p>
                      <p className="text-lg font-semibold">{selectedJob.salary_min} {selectedJob.salary_currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Maximálny plat</p>
                      <p className="text-lg font-semibold">{selectedJob.salary_max} {selectedJob.salary_currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Mena</p>
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
                  Kontaktné informácie
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email pre žiadosti</p>
                    <p className="font-semibold text-lg">{selectedJob?.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground">Počet žiadostí</p>
                      <p className="font-semibold text-lg">{selectedJob?.applications_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Typ úväzku</p>
                      <p className="font-semibold">{selectedJob && JOB_TYPES[selectedJob.job_type as keyof typeof JOB_TYPES]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kategória</p>
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
                Reagovať na túto pozíciu
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reagovať na pozíciu</DialogTitle>
              <DialogDescription>
                {selectedJob?.title} - {selectedJob?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cover_letter">Motivačný list</Label>
                <Textarea
                  id="cover_letter"
                  value={application.cover_letter}
                  onChange={(e) => setApplication({ ...application, cover_letter: e.target.value })}
                  placeholder="Napíšte prečo ste vhodným kandidátom..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="resume">Odkaz na životopis (voliteľné)</Label>
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
                  <strong>Kontakt:</strong> {selectedJob?.contact_email}
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "Odosielam..." : "Odoslať žiadosť"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Jobs;
