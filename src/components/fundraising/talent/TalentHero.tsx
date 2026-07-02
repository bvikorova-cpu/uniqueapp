import { useNavigate } from "react-router-dom";
import { Star, Users, TrendingUp, Award } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function TalentHero() {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Talent Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Talent Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Talent Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
}
