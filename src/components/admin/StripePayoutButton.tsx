import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Loader2 } from "lucide-react";
import {
  useAdminPayoutWithdrawal,
  type PayoutKind,
} from "@/hooks/useAdminPayoutWithdrawal";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  kind: PayoutKind;
  withdrawalId: string;
  amount: number;
  /** Called after a successful payout so the parent can refetch its list. */
  onPaid?: () => void;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "secondary";
  label?: string;
}

/**
 * Admin button that approves a withdrawal request and triggers a Stripe
 * Connect transfer to the creator's connected account. Confirmation dialog
 * prevents accidental payouts.
 */
export function StripePayoutButton({
  kind,
  withdrawalId,
  amount,
  onPaid,
  size = "sm",
  variant = "default",
  label = "Pay via Stripe",
}: Props) {
  const { run, loading } = useAdminPayoutWithdrawal();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    try {
      await run({ kind, withdrawalId, action: "approve", adminNotes: notes || undefined });
      setOpen(false);
      setNotes("");
      onPaid?.();
    } catch {
      /* toast handled by hook */
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Stripe Payout Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Stripe Payout Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stripe Payout Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setOpen(true)}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Zap className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Stripe payout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will instantly transfer{" "}
              <span className="font-semibold text-foreground">€{amount.toFixed(2)}</span>{" "}
              to the creator's connected Stripe account and mark the withdrawal as
              completed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal note about this payout…"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={loading}
            >
              {loading ? "Sending…" : "Send payout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
    </>
  );
}
