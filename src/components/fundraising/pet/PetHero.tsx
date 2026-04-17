import { useNavigate } from "react-router-dom";
import { PawPrint, ShieldCheck, TrendingUp, Heart } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export const PetHero = () => {
  const navigate = useNavigate();
  return (
    <PremiumCategoryHero
      badge="Verified Animal Rescue"
      badgeIcon={PawPrint}
      title="Pet Rescue"
      subtitle="Shelters · Medical · Food & Care"
      description="Help abandoned, sick, and rescued animals get the care they deserve. All shelters are vetted before going live."
      ctaLabel="Start a Rescue Campaign"
      ctaIcon={Heart}
      onCta={() => navigate("/fundraising/pet/create")}
      accentColor="amber"
      stats={[
        { icon: PawPrint, label: "Animals Helped", value: "—" },
        { icon: ShieldCheck, label: "Verified Shelters", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "6%" },
      ]}
    />
  );
};
