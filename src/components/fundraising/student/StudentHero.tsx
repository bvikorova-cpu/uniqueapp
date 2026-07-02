import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, TrendingUp, BookOpen } from "lucide-react";
import { PremiumCategoryHero } from "@/components/fundraising/PremiumCategoryHero";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function StudentHero() {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Student Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Student Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Student Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
}
