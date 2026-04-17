import { useNavigate } from "react-router-dom";
import { Shield, Users, Award, TrendingUp } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export const HeroHero = () => {
  const navigate = useNavigate();
  return (
    <PremiumCategoryHero
      badge="Heroes Among Us"
      badgeIcon={Shield}
      title="Community Hero"
      subtitle="Firefighters · Teachers · Volunteers"
      description="Recognize and reward people who serve our communities. Help local heroes with what they need to keep doing good."
      ctaLabel="Nominate a Hero"
      ctaIcon={Award}
      onCta={() => navigate("/fundraising/hero/create")}
      accentColor="emerald"
      stats={[
        { icon: Shield, label: "Heroes Supported", value: "—" },
        { icon: Award, label: "Verified Orgs", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "5%" },
      ]}
    />
  );
};
