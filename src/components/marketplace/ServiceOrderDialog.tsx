import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, Euro, AlertCircle } from "lucide-react";
import { useCommissionRate } from "@/hooks/useCommissionSettings";
import { FEE_DEFAULTS } from "@/lib/feeRates";

interface ServiceOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: {
    id: string;
    title: string;
    description: string;
    price_per_hour: number | null;
    user_id: string;
    profiles: { full_name: string | null } | null;
  };
}

export function ServiceOrderDialog({ open, onOpenChange, offering }: ServiceOrderDialogProps) {
  const [requirements, setRequirements] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [totalAmount, setTotalAmount] = useState(offering.price_per_hour?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { commissionRate } = useCommissionRate("service_order");
  const ratePct = commissionRate ?? FEE_DEFAULTS.service_order;
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const commissionAmount = Number(((totalAmountNum * ratePct) / 100).toFixed(2));
  const sellerPayout = Number((totalAmountNum - commissionAmount).toFixed(2));

  const handleOrder = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Requirements needed",
        description: "Please describe what you need from this service",
        variant: "destructive"
      });
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-service-order-checkout", {
        body: {
          offeringId: offering.id,
          requirements,
          deliveryDays: parseInt(deliveryDays),
          totalAmount: parseFloat(totalAmount)
        }
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: "Redirecting to payment",
          description: "Complete your payment to confirm the order"
        });
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Order failed",
        description: error.message || "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Service</DialogTitle>
          <DialogDescription>
            {offering.title} by {offering.profiles?.full_name || "Provider"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="requirements">Your Requirements *</Label>
            <Textarea
              id="requirements"
              placeholder="Describe exactly what you need. Be specific about your requirements, preferences, and any important details..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Total Amount (€) *</Label>
              <div className="relative mt-1">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="delivery">Delivery Time (days)</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delivery"
                  type="number"
                  min="1"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {totalAmountNum > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service Amount:</span>
                <span>€{totalAmountNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee ({ratePct}%):</span>
                <span>-€{commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t">
                <span>Provider Receives:</span>
                <span className="text-primary">€{sellerPayout.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              After payment, you'll be able to chat with the provider. 
              Funds are held securely until you approve the delivered work.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleOrder} disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay €{totalAmountNum.toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
