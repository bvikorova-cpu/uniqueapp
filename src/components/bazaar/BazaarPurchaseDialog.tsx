import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Truck, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCommissionRate } from "@/hooks/useCommissionSettings";

interface BazaarItem {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  user_id: string;
}

interface BazaarPurchaseDialogProps {
  item: BazaarItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BazaarPurchaseDialog({ item, open, onOpenChange }: BazaarPurchaseDialogProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Pull the active platform fee from `platform_commission_settings` (single source of truth).
  const { commissionRate } = useCommissionRate("bazaar");
  const effectiveRate = (commissionRate ?? 10) / 100;
  const commissionAmount = item ? +(item.price * effectiveRate).toFixed(2) : 0;
  const sellerPayout = item ? +(item.price - commissionAmount).toFixed(2) : 0;

  const handlePurchase = async () => {
    if (!item || !shippingAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter your shipping address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to purchase",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-bazaar-order-checkout', {
        body: { 
          itemId: item.id,
          shippingAddress: shippingAddress.trim(),
          buyerNotes: buyerNotes.trim() || null
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Same-tab redirect avoids popup blockers; keep dialog open until navigation triggers.
        onOpenChange(false);
        window.location.href = data.url as string;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item preview */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-xl font-bold text-primary">€{item.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Address *
            </Label>
            <Textarea
              id="address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address including name, street, city, postal code, and country"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Seller (optional)</Label>
            <Input
              id="notes"
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="Any special instructions..."
            />
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Price (incl. shipping)</span>
              <span>€{item.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee (10%)</span>
              <span>€{commissionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Seller Receives</span>
              <span>€{sellerPayout.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>You Pay</span>
              <span>€{item.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted rounded-lg">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>Price includes shipping. Seller is responsible for delivery. Confirm receipt when item arrives.</span>
          </div>

          <Button 
            onClick={handlePurchase} 
            disabled={loading || !shippingAddress.trim()}
            className="w-full gap-2"
            size="lg"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? 'Processing...' : `Pay €${item.price.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
