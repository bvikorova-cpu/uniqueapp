import { PremiumManagementCard } from "@/components/subscription/PremiumManagementCard";

interface StorySubscriptionManagementProps {
  subscribed: boolean;
  onManageSubscription: () => void;
}

export const StorySubscriptionManagement = ({
  subscribed,
  onManageSubscription,
}: StorySubscriptionManagementProps) => (
  <PremiumManagementCard
    subscribed={subscribed}
    onManage={onManageSubscription}
    title="Story Premium"
    description="Unlimited AI bedtime stories, billing & invoices."
  />
);
