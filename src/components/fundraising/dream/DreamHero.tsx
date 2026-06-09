import { useNavigate } from "react-router-dom";
import { Sparkles, Rocket, TrendingUp } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export const DreamHero = () => {
  const navigate = useNavigate();
  return (
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
  );
};
