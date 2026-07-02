import { useNavigate } from "react-router-dom";
import { PawPrint, ShieldCheck, TrendingUp, Heart } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const PetHero = () => {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Pet Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
