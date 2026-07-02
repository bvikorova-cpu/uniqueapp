import KidsSubscriptionPlans from "@/components/kids/KidsSubscriptionPlans";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const KIDS_PRICING_STEPS = [
  { title: "Compare plans", desc: "Monthly vs annual — annual saves the most." },
  { title: "Pay securely", desc: "Stripe checkout — parent-approved via parental gate." },
  { title: "Unlocks everything", desc: "Premium shows, all AI kids tools, no ads." },
  { title: "Cancel anytime", desc: "Manage or cancel from your account settings." },
];

export default function KidsPricing() {
  return (
    <>
      <FloatingHowItWorks
        title="Kids Gold Pass Pricing"
        intro="Subscribe to Kids Gold Pass or buy individual packs."
        steps={KIDS_PRICING_STEPS}
      />
      <KidsSubscriptionPlans />
    </>
  );
}
