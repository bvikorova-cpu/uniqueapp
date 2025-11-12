import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Settings } from "lucide-react";

interface StorySubscriptionManagementProps {
  subscribed: boolean;
  onManageSubscription: () => void;
}

export const StorySubscriptionManagement = ({
  subscribed,
  onManageSubscription,
}: StorySubscriptionManagementProps) => {
  if (!subscribed) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Premium Subscription
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-primary">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onManageSubscription}
            className="flex-1"
            variant="outline"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• View and download invoices</p>
          <p>• Update payment method</p>
          <p>• Change or cancel subscription</p>
        </div>
      </CardContent>
    </Card>
  );
};
