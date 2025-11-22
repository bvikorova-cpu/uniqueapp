import { Card } from "@/components/ui/card";
import { ReferralWithdrawalRequest } from "@/components/referral/ReferralWithdrawalRequest";

const ReferralDashboard = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Referral Dashboard
          </span>
        </h1>
        <p className="text-muted-foreground">
          Manage your referral earnings and withdrawal requests
        </p>
      </Card>

      <ReferralWithdrawalRequest />
    </div>
  );
};

export default ReferralDashboard;