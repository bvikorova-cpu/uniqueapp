import { PremiumManagementCard } from "@/components/subscription/PremiumManagementCard";

interface ScienceSubscriptionManagementProps {
  subscribed: boolean;
  onManageSubscription: () => void;
}

export const ScienceSubscriptionManagement = ({
  subscribed,
  onManageSubscription,
}: ScienceSubscriptionManagementProps) => (
  <PremiumManagementCard
    subscribed={subscribed}
    onManage={onManageSubscription}
    title="Science Premium"
    description="Unlock all experiments, manage billing & invoices."
  />
);
