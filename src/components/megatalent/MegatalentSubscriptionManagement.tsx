import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  subscriptionTier: 'premium' | 'top_premium' | null;
  canceling: boolean;
  onManage: () => void;
  onCancel: () => void;
}

const MegatalentSubscriptionManagement = ({ subscriptionTier, canceling, onManage, onCancel }: Props) => (
  <Card className="border-yellow-500/10">
    <CardHeader><CardTitle className="text-xl">Subscription Management</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
        <div>
          <p className="font-medium">Current Subscription</p>
          <p className="text-sm text-muted-foreground capitalize">{subscriptionTier === 'top_premium' ? 'Top Premium' : 'Premium'}</p>
        </div>
        <Badge className="bg-yellow-500 text-black">Active</Badge>
      </div>
      <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">If you cancel your subscription, it will remain active until the end of the paid period. The paid amount is non-refundable.</p>
      <Button variant="default" className="w-full" onClick={onManage}>
        Manage Subscription (Stripe Portal)
      </Button>
      <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10" onClick={onCancel} disabled={canceling}>
        {canceling ? 'Canceling...' : 'Cancel Subscription'}
      </Button>
    </CardContent>
  </Card>
);

export default MegatalentSubscriptionManagement;
