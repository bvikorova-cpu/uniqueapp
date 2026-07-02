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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Undo2, Loader2 } from "lucide-react";
import { useAdminRefund } from "@/hooks/useAdminRefund";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  paymentRecordId: string;
  /** Original amount in EUR (display only). */
  amount: number;
  /** Allow partial refunds. Defaults to true. */
  allowPartial?: boolean;
  onRefunded?: () => void;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "destructive" | "secondary";
  label?: string;
}

/**
 * Admin button that refunds a Stripe payment via `admin-refund-payment`.
 * Confirmation dialog with reason + optional partial amount + admin notes.
 */
export function RefundButton({
  paymentRecordId,
  amount,
  allowPartial = true,
  onRefunded,
  size = "sm",
  variant = "destructive",
  label = "Refund",
}: Props) {
  const { refund, loading } = useAdminRefund();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"duplicate" | "fraudulent" | "requested_by_customer">(
    "requested_by_customer",
  );
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    const amountCents = partialAmount
      ? Math.round(parseFloat(partialAmount) * 100)
      : undefined;
    try {
      await refund({ paymentRecordId, amountCents, reason, adminNotes: notes || undefined });
      setOpen(false);
      setPartialAmount("");
      setNotes("");
      onRefunded?.();
    } catch {
      /* toast handled in hook */
    }
  };

  const partialValid =
    !partialAmount ||
    (parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= amount);

  return (
    <>
      <FloatingHowItWorks title={"Refund Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Refund Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Refund Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
          <Undo2 className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Issue Stripe refund?</AlertDialogTitle>
            <AlertDialogDescription>
              Original payment:{" "}
              <span className="font-semibold text-foreground">€{amount.toFixed(2)}</span>.
              The funds will be returned to the customer's original payment method.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v: any) => setReason(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate charge</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {allowPartial && (
              <div className="space-y-2">
                <Label>Partial amount (€) — leave empty for full refund</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={amount}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder={`Full €${amount.toFixed(2)}`}
                />
                {!partialValid && (
                  <p className="text-xs text-destructive">
                    Amount must be between €0.01 and €{amount.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Admin notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal note about this refund…"
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={loading || !partialValid}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Refunding…" : "Issue refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
    </>
  );
}
