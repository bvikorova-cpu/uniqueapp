import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, TrendingUp, BookOpen } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";

export function StudentHero() {
  const navigate = useNavigate();
  return (
    <PremiumCategoryHero
      badge="Education for All"
      badgeIcon={GraduationCap}
      title="Student Support"
      subtitle="Tuition · Books · Living Costs"
      description="Empower students from underprivileged backgrounds to pursue their education. Every euro is an investment in tomorrow."
      ctaLabel="Start a Student Campaign"
      ctaIcon={BookOpen}
      onCta={() => navigate("/fundraising/student/create")}
      accentColor="cyan"
      stats={[
        { icon: GraduationCap, label: "Students Helped", value: "—" },
        { icon: Users, label: "Supporters", value: "—" },
        { icon: TrendingUp, label: "Platform Fee", value: "5%" },
      ]}
    />
  );
}
