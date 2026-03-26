import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCounterProps {
  end: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}

function StatCounter({ end, label, icon, suffix = "" }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/20">
      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
        {icon}
      </div>
      <span className="text-2xl sm:text-3xl font-black text-foreground">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

interface JobsHeroSectionProps {
  totalJobs: number;
  totalCompanies: number;
  totalApplications: number;
}

export function JobsHeroSection({ totalJobs, totalCompanies, totalApplications }: JobsHeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-6 sm:mb-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            Job Market is Growing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Find Your Dream Career
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Discover thousands of opportunities from top companies worldwide.
            Your next career move starts here.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
          <StatCounter
            end={totalJobs || 150}
            label="Active Jobs"
            suffix="+"
            icon={<Briefcase className="h-5 w-5 text-primary" />}
          />
          <StatCounter
            end={totalCompanies || 45}
            label="Companies"
            suffix="+"
            icon={<Building2 className="h-5 w-5 text-primary" />}
          />
          <StatCounter
            end={totalApplications || 1200}
            label="Applications"
            suffix="+"
            icon={<Users className="h-5 w-5 text-primary" />}
          />
        </div>
      </div>
    </div>
  );
}
