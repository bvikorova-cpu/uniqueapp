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
import { Briefcase, MapPin, DollarSign, Clock, Search, Plus, Building2, Globe, Download } from "lucide-react";
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

  // Import jobs from Adzuna
  const importJobsMutation = useMutation({
    mutationFn: async ({ country, searchQuery }: { country: string; searchQuery: string }) => {
      const { data, error } = await supabase.functions.invoke('import-jobs', {
        body: { country, what: searchQuery, results_per_page: 50 }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "✅ Import úspešný",
        description: `Naimportované ${data.imported} z ${data.total} pracovných ponúk`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba pri importe",
        description: error.message || "Nepodarilo sa importovať pracovné ponuky",
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
            <Button 
              variant="outline"
              onClick={() => importJobsMutation.mutate({ country: 'sk', searchQuery: '' })}
              disabled={importJobsMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {importJobsMutation.isPending ? "Importujem..." : "Import z Adzuna"}
            </Button>
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
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
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
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between">
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
