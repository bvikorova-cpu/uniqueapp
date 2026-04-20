import { EarningsDashboard } from "@/components/instructor/EarningsDashboard";
import { EarningsHero, EarningsLiveTicker, EarningsTipsBanner } from "@/components/earnings";

export default function InstructorEarnings() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <EarningsHero
        title="Instructor Earnings"
        subtitle="Manage your course earnings, Stripe Connect & request withdrawals."
        totalEarnings={0}
        available={0}
        pending={0}
        paidOut={0}
        badge="Instructor Treasury"
      />
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <EarningsLiveTicker />
      </div>
      <div className="mb-6"><EarningsTipsBanner /></div>
      <EarningsDashboard />
    </div>
  );
}
