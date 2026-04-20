import { PremiumManagementCard } from "@/components/subscription/PremiumManagementCard";

interface SubscriptionManagementProps {
  subscribed: boolean;
  onManageSubscription: () => void;
}

export const SubscriptionManagement = ({ subscribed, onManageSubscription }: SubscriptionManagementProps) => (
  <PremiumManagementCard
    subscribed={subscribed}
    onManage={onManageSubscription}
    title="Homework Premium"
    description="Unlimited AI homework help, billing & invoices."
  />
);
