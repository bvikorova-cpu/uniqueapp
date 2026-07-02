import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Truck, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DisputeModal from "./DisputeModal";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface OrderActionsProps {
  orderId: string;
  status: string;
  escrowStatus: string;
  isBuyer: boolean;
  isSeller: boolean;
  onStatusChange: () => void;
}

export function OrderActions({ 
  orderId, 
  status, 
  escrowStatus, 
  isBuyer, 
  isSeller,
  onStatusChange 
}: OrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const handleMarkShipped = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bazaar_orders')
        .update({ 
          status: 'shipped', 
          shipped_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Order marked as shipped");
      onStatusChange();
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bazaar_orders')
        .update({ 
          status: 'delivered', 
          delivered_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Delivery confirmed");
      onStatusChange();
    } catch (error) {
      toast.error("Failed to confirm delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("escrow-release", {
        body: { orderId },
      });

      if (error) throw error;

      toast.success("Funds released to seller", {
        description: "Thank you for your purchase!",
      });
      onStatusChange();
    } catch (error) {
      console.error("Error releasing funds:", error);
      toast.error("Failed to release funds", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const canOpenDispute = isBuyer && 
    ['paid', 'shipped', 'delivered'].includes(status) && 
    escrowStatus === 'held';

  const isDisputed = status === 'disputed' || escrowStatus === 'disputed';

  return (
    <>
      <FloatingHowItWorks title="How Order Actions works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="flex flex-wrap gap-2">
      {/* Seller: Mark as shipped */}
      {isSeller && status === 'paid' && (
        <Button onClick={handleMarkShipped} disabled={loading} className="gap-2">
          <Truck className="h-4 w-4" />
          Mark as Shipped
        </Button>
      )}

      {/* Buyer: Confirm delivery */}
      {isBuyer && status === 'shipped' && (
        <Button onClick={handleConfirmDelivery} disabled={loading} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirm Delivery
        </Button>
      )}

      {/* Buyer: Release funds after delivery */}
      {isBuyer && status === 'delivered' && escrowStatus === 'held' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
              <Shield className="h-4 w-4" />
              Release Funds to Seller
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Release Funds?</AlertDialogTitle>
              <AlertDialogDescription>
                This will release the payment to the seller. Only do this if you're satisfied with the item.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReleaseFunds} className="bg-green-600 hover:bg-green-700">
                Yes, Release Funds
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Buyer: Open dispute */}
      {canOpenDispute && !isDisputed && (
        <>
          <Button 
            variant="outline" 
            onClick={() => setShowDisputeModal(true)} 
            className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <AlertTriangle className="h-4 w-4" />
            Open Dispute
          </Button>
          
          <DisputeModal
            open={showDisputeModal}
            onOpenChange={setShowDisputeModal}
            orderId={orderId}
            onDisputeOpened={onStatusChange}
          />
        </>
      )}

      {/* Status messages */}
      {isDisputed && (
        <div className="w-full p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          Dispute in progress. Our team is reviewing this case.
        </div>
      )}

      {status === 'completed' && (
        <div className="w-full p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Order completed. Funds have been released to the seller.
        </div>
      )}
    </div>
    </>
    );
}

export default OrderActions;
