import { Check, Clock, Package, Truck, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'refunded';

interface OrderTrackerProps {
  status: OrderStatus;
  escrowStatus?: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  className?: string;
}

interface Step {
  key: OrderStatus;
  label: string;
  icon: typeof Check;
  description: string;
}

const steps: Step[] = [
  { key: 'paid', label: 'Paid', icon: Check, description: 'Payment received' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Item sent' },
  { key: 'delivered', label: 'Delivered', icon: Package, description: 'Item received' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, description: 'Funds released' },
];

const statusOrder: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  completed: 4,
  disputed: -1,
  refunded: -2,
};

export function OrderTracker({ 
  status, 
  escrowStatus,
  paidAt, 
  shippedAt, 
  deliveredAt, 
  completedAt,
  className 
}: OrderTrackerProps) {
  const currentStepIndex = statusOrder[status] || 0;
  const isDisputed = status === 'disputed' || escrowStatus === 'disputed';
  const isRefunded = status === 'refunded' || escrowStatus === 'refunded';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepDate = (stepKey: OrderStatus) => {
    switch (stepKey) {
      case 'paid': return formatDate(paidAt);
      case 'shipped': return formatDate(shippedAt);
      case 'delivered': return formatDate(deliveredAt);
      case 'completed': return formatDate(completedAt);
      default: return null;
    }
  };

  if (isDisputed) {
    return (
      <>
        <FloatingHowItWorks title="How Order Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <div className={cn("p-4 rounded-lg bg-destructive/10 border border-destructive/20", className)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-destructive">Dispute in Progress</p>
            <p className="text-sm text-muted-foreground">
              This order is under review. Funds are held until resolution.
            </p>
          </div>
        </div>
      </div>
      </>
      );
  }

  if (isRefunded) {
    return (
      <div className={cn("p-4 rounded-lg bg-orange-500/10 border border-orange-500/20", className)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-orange-600">Order Refunded</p>
            <p className="text-sm text-muted-foreground">
              This order has been refunded to the buyer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepIndex = statusOrder[step.key];
          const isCompleted = currentStepIndex >= stepIndex;
          const isCurrent = currentStepIndex === stepIndex;
          const StepIcon = step.icon;
          const stepDate = getStepDate(step.key);

          return (
            <div key={step.key} className="flex-1 relative">
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute top-5 -left-1/2 w-full h-0.5 -z-10",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
              
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                
                {/* Label */}
                <p className={cn(
                  "mt-2 text-sm font-medium",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                
                {/* Date or description */}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stepDate || (isCurrent ? "In progress" : step.description)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Escrow protection notice */}
      {escrowStatus === 'held' && (
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Buyer protection active. Funds will be released after delivery confirmation.
          </span>
        </div>
      )}
    </div>
  );
}

export default OrderTracker;
