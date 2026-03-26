import { Building2, MapPin, Globe, Clock, DollarSign, Flame, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const CATEGORIES: Record<string, string> = {
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

const JOB_TYPES: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

interface JobCardRedesignedProps {
  job: JobListing;
  onViewDetails: (job: JobListing) => void;
  onApply: (job: JobListing) => void;
  isLoggedIn: boolean;
}

export function JobCardRedesigned({ job, onViewDetails, onApply, isLoggedIn }: JobCardRedesignedProps) {
  const isNew = new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isHot = job.applications_count > 10;
  const companyInitials = job.company_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 sm:p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 active:scale-[0.99]">
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        {isNew && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
            <Sparkles className="h-3 w-3" /> NEW
          </span>
        )}
        {isHot && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20">
            <Flame className="h-3 w-3" /> HOT
          </span>
        )}
      </div>

      <div className="flex gap-4">
        {/* Company Logo Placeholder */}
        <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 items-center justify-center text-lg font-black text-primary shrink-0 group-hover:scale-105 transition-transform">
          {companyInitials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Company */}
          <h3
            className="text-base sm:text-lg font-bold mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1 pr-20"
            onClick={() => onViewDetails(job)}
          >
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.company_name}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {job.country}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary">
              {CATEGORIES[job.category] || job.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary text-secondary-foreground">
              <Clock className="h-3 w-3" />
              {JOB_TYPES[job.job_type] || job.job_type}
            </span>
            {job.salary_min && job.salary_max && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/5 text-primary border border-primary/15">
                <DollarSign className="h-3 w-3" />
                {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.salary_currency}
              </span>
            )}
          </div>

          {/* Description preview */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {job.applications_count} applied
              </span>
              <span>
                {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 hover:bg-primary/10 hover:text-primary"
                onClick={() => onViewDetails(job)}
              >
                Details
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 shadow-sm shadow-primary/20"
                onClick={() => onApply(job)}
              >
                {isLoggedIn ? "Apply Now" : "Sign In"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
