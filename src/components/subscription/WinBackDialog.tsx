import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Heart, Pause, Gift, X } from "lucide-react";

interface WinBackDialogProps {
  open: boolean;
  onClose: () => void;
  onPause: () => void;
  onAcceptDiscount: () => void;
  onConfirmCancel: () => void;
  cancelling?: boolean;
}

/**
 * Three-step retention flow shown when user clicks "Cancel".
 * Step 1: emotional appeal + offer pause
 * Step 2: 50% discount for next 3 months
 * Step 3: confirm cancel
 */
export const WinBackDialog = ({
  open,
  onClose,
  onPause,
  onAcceptDiscount,
  onConfirmCancel,
  cancelling,
}: WinBackDialogProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <AlertDialogContent className="max-w-md">
        {step === 1 && (
          <>
            <AlertDialogHeader>
              <div className="mx-auto mb-3 p-3 rounded-2xl bg-rose-500/15 w-fit">
                <Heart className="h-7 w-7 text-rose-500" />
              </div>
              <AlertDialogTitle className="text-center text-2xl">Wait — before you go</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                You've been with us for a while. We'd hate to see you leave. Need a break instead?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-3">
              <Button onClick={() => { onPause(); handleClose(); }} variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <Pause className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Pause for 1 month</div>
                  <div className="text-xs text-muted-foreground">Keep your data, no charges</div>
                </div>
              </Button>
              <Button onClick={() => setStep(2)} variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <Gift className="h-5 w-5 text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold">See exclusive offer</div>
                  <div className="text-xs text-muted-foreground">Just for you</div>
                </div>
              </Button>
              <Button onClick={() => setStep(3)} variant="ghost" size="sm" className="text-muted-foreground">
                No thanks, continue cancelling
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <AlertDialogHeader>
              <div className="mx-auto mb-3 p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 w-fit">
                <Gift className="h-7 w-7 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-center text-2xl">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  50% OFF
                </span>{" "}
                for 3 months
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Stay with us at half the price. No strings — cancel anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={() => { onAcceptDiscount(); handleClose(); }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold"
                size="lg"
              >
                ✨ Claim 50% Off
              </Button>
              <Button onClick={() => setStep(3)} variant="ghost" size="sm">
                No thanks, cancel anyway
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <AlertDialogHeader>
              <div className="mx-auto mb-3 p-3 rounded-2xl bg-destructive/15 w-fit">
                <X className="h-7 w-7 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center">Confirm cancellation</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Your subscription will remain active until the end of the current billing period.
                You'll lose access to premium features after that.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={onConfirmCancel}
                disabled={cancelling}
                variant="destructive"
                className="w-full"
              >
                {cancelling ? "Cancelling..." : "Yes, cancel my subscription"}
              </Button>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Keep my subscription
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
