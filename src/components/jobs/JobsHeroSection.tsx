import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StatCounterProps {
  end: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}

function StatCounter({ end, label, icon, suffix = "" }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
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
    return (
    <>
      <FloatingHowItWorks title={"Jobs Hero Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Jobs Hero Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Jobs Hero Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center gap-1 p-2.5 sm:p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/20">
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-0.5 sm:mb-1">
        {icon}
      </div>
      <span className="text-xl sm:text-3xl font-black text-foreground">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium text-center leading-tight">{label}</span>
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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-36 sm:h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 px-4 sm:px-8 py-6 sm:py-12">
        <div className="max-w-3xl mb-5 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Job Market is Growing
          </div>
          <h1 className="text-xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight break-words [overflow-wrap:anywhere]">
            Find Your Dream Career
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl">
            Discover opportunities from top companies worldwide.
            Your next career move starts here.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md">
          <StatCounter
            end={totalJobs}
            label="Active Jobs"
            icon={<Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
          />
          <StatCounter
            end={totalCompanies}
            label="Companies"
            icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
          />
          <StatCounter
            end={totalApplications}
            label="Applications"
            icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
          />
        </div>
      </div>
    </div>
  );
}
