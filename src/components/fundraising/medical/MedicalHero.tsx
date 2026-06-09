import { Heart, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

interface MedicalHeroProps {
  onCreateCampaign: () => void;
}

export function MedicalHero({ onCreateCampaign }: MedicalHeroProps) {
  return (
    <PremiumCategoryHero
      badge="Verified Medical Fundraising"
      badgeIcon={ShieldCheck}
      title="Medical Fundraising"
      subtitle="Treatments · Surgeries · Recoveries"
      description="Help patients and families afford life-saving treatment. Every campaign is verified before going live — your donation has direct impact."
      ctaLabel="Start Your Campaign"
      ctaIcon={Heart}
      onCta={onCreateCampaign}
      accentColor="rose"
      stats={[
        { icon: Heart, label: "Campaigns", value: "—" },
        { icon: Users, label: "Donors", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "6%" },
      ]}
    />
  );
}
