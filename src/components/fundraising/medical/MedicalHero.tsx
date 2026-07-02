import { Heart, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface MedicalHeroProps {
  onCreateCampaign: () => void;
}

export function MedicalHero({ onCreateCampaign }: MedicalHeroProps) {
  return (
    <>
      <FloatingHowItWorks title={"Medical Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
}
