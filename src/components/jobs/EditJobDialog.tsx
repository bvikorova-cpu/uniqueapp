import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  country: string;
  category: string;
  job_type: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  contact_email: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
}

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditJobDialog({ job, open, onOpenChange, onSaved }: EditJobDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Job>(job);

  useEffect(() => {
    setForm(job);
  }, [job, open]);

  const handleSave = async () => {
    if (!form.title || !form.company_name || !form.location || !form.country || !form.description || !form.contact_email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("job_listings")
        .update({
          title: form.title,
          company_name: form.company_name,
          location: form.location,
          country: form.country,
          category: form.category as any,
          job_type: form.job_type as any,
          description: form.description,
          requirements: form.requirements || null,
          benefits: form.benefits || null,
          contact_email: form.contact_email,
          salary_min: form.salary_min,
          salary_max: form.salary_max,
          salary_currency: form.salary_currency,
        })
        .eq("id", job.id);

      if (error) throw error;

      toast({ title: "Saved", description: "Job listing updated successfully." });
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job listing.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription>Update your job listing details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Position Title *</Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-company">Company Name *</Label>
            <Input
              id="edit-company"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-country">Country *</Label>
              <Input
                id="edit-country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Type *</Label>
              <Select value={form.job_type} onValueChange={(value) => setForm({ ...form, job_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-salary-min">Salary From</Label>
              <Input
                id="edit-salary-min"
                type="number"
                value={form.salary_min ?? ""}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div>
              <Label htmlFor="edit-salary-max">Salary To</Label>
              <Input
                id="edit-salary-max"
                type="number"
                value={form.salary_max ?? ""}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div>
              <Label htmlFor="edit-currency">Currency</Label>
              <Input
                id="edit-currency"
                value={form.salary_currency}
                onChange={(e) => setForm({ ...form, salary_currency: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Job Description *</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="edit-requirements">Requirements</Label>
            <Textarea
              id="edit-requirements"
              value={form.requirements || ""}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-benefits">Benefits</Label>
            <Textarea
              id="edit-benefits"
              value={form.benefits || ""}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Contact Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
