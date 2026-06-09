import { useNavigate } from "react-router-dom";
import { Star, Users, TrendingUp, Award } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export function TalentHero() {
  const navigate = useNavigate();
  return (
    <PremiumCategoryHero
      badge="Sponsor Rising Stars"
      badgeIcon={Star}
      title="Talent Sponsorship"
      subtitle="Artists · Athletes · Creators"
      description="Discover and back the next generation of talent. Sponsor athletes, artists, and creators who need support to reach the top."
      ctaLabel="Showcase Your Talent"
      ctaIcon={Star}
      onCta={() => navigate("/fundraising/talent/create")}
      accentColor="rose"
      stats={[
        { icon: Star, label: "Talents Supported", value: "—" },
        { icon: Users, label: "Sponsors", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "10%" },
      ]}
    />
  );
}
