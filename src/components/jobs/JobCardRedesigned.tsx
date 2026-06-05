import { Building2, MapPin, Globe, Clock, DollarSign, Flame, Sparkles, Users, Star } from "lucide-react";
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
  is_featured?: boolean | null;
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
    <div className="group relative rounded-xl sm:rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-3 sm:p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 active:scale-[0.99]">
      {/* Badges */}
      {(isNew || isHot || job.is_featured) && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5">
          {job.is_featured && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" /> FEATURED
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> NEW
            </span>
          )}
          {isHot && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20">
              <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> HOT
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3 sm:gap-4">
        {/* Company Logo Placeholder */}
        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-xs sm:text-lg font-black text-primary shrink-0 group-hover:scale-105 transition-transform">
          {companyInitials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Company */}
          <h3
            className="text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1 pr-16 sm:pr-20"
            onClick={() => onViewDetails(job)}
          >
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-0.5 sm:gap-1">
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="truncate max-w-[80px] sm:max-w-none">{job.company_name}</span>
            </span>
            <span className="inline-flex items-center gap-0.5 sm:gap-1">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="truncate max-w-[60px] sm:max-w-none">{job.location}</span>
            </span>
            {job.country && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1">
                <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="truncate max-w-[60px] sm:max-w-none">{job.country}</span>
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-semibold bg-primary/10 text-primary">
              {CATEGORIES[job.category] || job.category}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-semibold bg-secondary text-secondary-foreground">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {JOB_TYPES[job.job_type] || job.job_type}
            </span>
            {job.salary_min && job.salary_max && (
              <span className="inline-flex items-center gap-0.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold bg-primary/5 text-primary border border-primary/15">
                <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.salary_currency}
              </span>
            )}
          </div>

          {/* Description preview */}
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
            {job.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 sm:gap-1">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {job.applications_count} applied
              </span>
              <span>
                {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 hover:bg-primary/10 hover:text-primary"
                onClick={() => onViewDetails(job)}
              >
                Details
              </Button>
              <Button
                size="sm"
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-2.5 sm:px-3 shadow-sm shadow-primary/20"
                onClick={() => onApply(job)}
              >
                {isLoggedIn ? "Apply" : "Sign In"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
