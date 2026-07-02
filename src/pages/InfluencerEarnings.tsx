import { InfluencerEarningsPage } from "@/components/influencer/InfluencerEarningsPage";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function InfluencerEarnings() {
  return (
    <>
      <FloatingHowItWorks
        title="How Influencer Earnings works"
        steps={[
          { title: 'View earnings', description: 'Track credits, tips, and brand-deal revenue.' },
          { title: 'Meet payout threshold', description: 'Reach €50 to unlock a payout.' },
          { title: 'Request payout', description: 'Stripe Connect sends funds to your bank.' },
          { title: 'Download reports', description: 'Export CSV for taxes and accounting.' },
        ]}
      />
    <div className="container mx-auto p-6 max-w-7xl">
      <InfluencerEarningsPage />
    </div>
    </>
  );
}
