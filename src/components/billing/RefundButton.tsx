import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  subscriptionId: string;
  onDone?: () => void;
}

interface Eligibility {
  eligible: boolean;
  hours_left?: number;
  amount?: number;
  currency?: string;
  reason?: string;
}

/** 24h money-back button — visible only if backend confirms eligibility. */
export default function RefundButton({ subscriptionId, onDone }: Props) {
  const { toast } = useToast();
  const [elig, setElig] = useState<Eligibility | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.functions.invoke("check-refund-eligibility", {
        body: { subscription_id: subscriptionId },
      });
      if (data) setElig(data as Eligibility);
    })();
  }, [subscriptionId]);

  if (!elig?.eligible) return null;

  const doRefund = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("refund-membership", {
        body: { subscription_id: subscriptionId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "Refunded", description: "Your subscription has been canceled and refunded." });
      onDone?.();
    } catch (e: any) {
      toast({ title: "Refund failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const hrsLeft = Math.ceil(elig.hours_left ?? 0);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
          Refund ({hrsLeft}h left)
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request full refund?</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will be canceled immediately and {((elig.amount ?? 0) / 100).toFixed(2)}{" "}
            {elig.currency?.toUpperCase()} will be refunded to your original payment method
            within 5-10 business days. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep subscription</AlertDialogCancel>
          <AlertDialogAction onClick={doRefund}>Refund & cancel</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
