import { useNavigate } from "react-router-dom";
import { Sparkles, Rocket, TrendingUp } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const DreamHero = () => {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Dream Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Dream Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dream Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <PremiumCategoryHero
      badge="Make Wishes Real"
      badgeIcon={Sparkles}
      title="Dream Maker"
      subtitle="Travel · Adventure · Bucket Lists"
      description="Help people achieve once-in-a-lifetime dreams. From world travels to creative passions — every dream deserves a chance."
      ctaLabel="Share Your Dream"
      ctaIcon={Sparkles}
      onCta={() => navigate("/fundraising/dream/create")}
      accentColor="purple"
      stats={[
        { icon: Rocket, label: "Dreams Funded", value: "—" },
        { icon: TrendingUp, label: "Total Raised", value: "—" },
        { icon: Sparkles, label: "Platform Fee", value: "7%" },
      ]}
    />
    </>
  );
};
