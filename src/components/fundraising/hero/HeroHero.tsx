import { useNavigate } from "react-router-dom";
import { Shield, Users, Award, TrendingUp } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const HeroHero = () => {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Hero Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Hero Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hero Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
