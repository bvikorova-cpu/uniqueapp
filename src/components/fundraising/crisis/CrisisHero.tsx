import { useNavigate } from "react-router-dom";
import { AlertTriangle, Zap, Users, TrendingUp } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export function CrisisHero() {
  const navigate = useNavigate();
  return (
    <PremiumCategoryHero
      badge="Emergency Response"
      badgeIcon={AlertTriangle}
      title="Crisis Relief"
      subtitle="Disasters · Emergencies · Rapid Response"
      description="Verified within 24 hours. Funds released immediately when disaster strikes. Every minute counts."
      ctaLabel="Report Emergency"
      ctaIcon={AlertTriangle}
      onCta={() => navigate("/fundraising/crisis/create")}
      accentColor="amber"
      stats={[
        { icon: Zap, label: "Active Crises", value: "—" },
        { icon: Users, label: "People Helped", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "8%" },
      ]}
    />
  );
}
