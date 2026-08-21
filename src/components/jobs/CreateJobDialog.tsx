import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Zap } from "lucide-react";
import { useJobsCredits, JOBS_CREDIT_COSTS } from "@/hooks/useJobsCredits";



import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CATEGORIES = { it_software: "IT & Software",
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
  other: "Other" };

const JOB_TYPES = { full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote" };

const JOB_PACKAGES: Array<{ days: number; credits: number; popular: boolean }> = [
  { days: 7, credits: JOBS_CREDIT_COSTS.listing_7, popular: false },
  { days: 14, credits: JOBS_CREDIT_COSTS.listing_14, popular: true },
  { days: 30, credits: JOBS_CREDIT_COSTS.listing_30, popular: false },
];


interface CreateJobDialogProps {
  userId: string;
  subscribed: boolean;
  onRenewSubscription: () => void;
  prefillCompanyName?: string;
}

export function CreateJobDialog({ userId, subscribed, onRenewSubscription, prefillCompanyName }: CreateJobDialogProps) {
  const { toast } = useToast();
  const { spend } = useJobsCredits();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof JOB_PACKAGES[0] | null>(null);

  const handleOpenDialog = () => {
    setShowCreateDialog(true);
  };

  const [newJob, setNewJob] = useState({ title: "",
    company_name: prefillCompanyName || "",
    location: "",
    country: "",
    category: "it_software",
    job_type: "full_time",
    description: "",
    requirements: "",
    benefits: "",
    contact_email: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "EUR" });

  useEffect(() => {
    if (prefillCompanyName) {
      setNewJob((prev) => ({ ...prev, company_name: prefillCompanyName }));
    }
  }, [prefillCompanyName]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPackage) throw new Error("Package not selected");

      // Credits first — nothing is inserted unless the spend succeeds.
      const paid = await spend(selectedPackage.credits, `job_listing_${selectedPackage.days}d`);
      if (!paid) throw new Error("CREDITS_REQUIRED");

      const now = new Date();
      const expires = new Date(now.getTime() + selectedPackage.days * 24 * 60 * 60 * 1000);

      const { error } = await supabase.from("job_listings").insert([{ employer_id: userId,
        title: newJob.title,
        company_name: newJob.company_name,
        location: newJob.location,
        country: newJob.country,
        category: newJob.category as any,
        job_type: newJob.job_type as any,
        description: newJob.description,
        requirements: newJob.requirements || null,
        benefits: newJob.benefits || null,
        contact_email: newJob.contact_email,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
        salary_currency: newJob.salary_currency,
        is_active: true,
        paid_status: 'paid',
        published_at: now.toISOString(),
        expires_at: expires.toISOString(),
        duration_days: selectedPackage.days } as any]).select().single();

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      setShowPackageDialog(false);
      setShowCreateDialog(false);
      setNewJob({ title: "",
        company_name: "",
        location: "",
        country: "",
        category: "it_software",
        job_type: "full_time",
        description: "",
        requirements: "",
        benefits: "",
        contact_email: "",
        salary_min: "",
        salary_max: "",
        salary_currency: "EUR" });
      setSelectedPackage(null);
      toast({ title: "Job published", description: "Your listing is live and visible to candidates." });
    },
    onError: (error: Error) => { console.error('Job creation error:', error);
      if (error.message === 'CREDITS_REQUIRED') return;
      toast({
        title: "Error",
        description: error.message || "Failed to create job listing",
        variant: "destructive" });
    } });

  return (
    <>
      <FloatingHowItWorks title="How Create Job Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {"Add Position"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{"Add Position"}</DialogTitle>
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
                  placeholder="e.g. City"
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={newJob.country}
                  onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                  placeholder="e.g. Country"
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
              onClick={ () => {
                if (!newJob.title || !newJob.company_name || !newJob.location || !newJob.country || !newJob.description || !newJob.contact_email) {
                  toast({
                    title: "❌ Missing Fields",
                    description: "Please fill in all required fields",
                    variant: "destructive" });
                  return;
                }
                setShowCreateDialog(false);
                setShowPackageDialog(true);
              }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Selection Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Job Listing Package</DialogTitle>
            <DialogDescription>
              Pay with credits — select how long your job listing stays visible
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
                    <div className="text-4xl font-bold flex items-center justify-center gap-2">
                      <Zap className="h-6 w-6 text-primary" />
                      {pkg.credits}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      credits · {(pkg.credits / pkg.days).toFixed(2)} per day
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Visible for {pkg.days} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Reach thousands of candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Application management tools</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowPackageDialog(false);
                setShowCreateDialog(true);
              }}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={() => createJobMutation.mutate()}
              disabled={!selectedPackage || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Publishing..." : `Publish for ${selectedPackage?.credits ?? JOBS_CREDIT_COSTS.listing_7} credits`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
    </>
    );
}
