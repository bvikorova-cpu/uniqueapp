import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, ArrowRight, Lock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsPayoutCardProps {
  available: number;
  minimum?: number;
  hasPayoutMethod: boolean;
  onRequest: () => void;
  onSetupMethod: () => void;
  methodLabel?: string;
  /** Live Stripe payouts capability — when false, withdraw is blocked. */
  stripePayoutsEnabled?: boolean;
  /** Reason payouts are disabled (currently_due field, disabled_reason). */
  payoutsBlockReason?: string | null;
}

/**
 * Premium payout request card — replaces all role-specific withdrawal CTAs.
 */
export const EarningsPayoutCard = ({
  available,
  minimum = 25,
  hasPayoutMethod,
  onRequest,
  onSetupMethod,
  methodLabel = "IBAN / Stripe Connect",
  stripePayoutsEnabled = true,
  payoutsBlockReason = null,
}: EarningsPayoutCardProps) => {
  const canPayout = available >= minimum && hasPayoutMethod && stripePayoutsEnabled;
  const progress = Math.min(100, (available / minimum) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Earnings Payout Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Payout Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Payout Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-500/15 via-card to-yellow-500/10 border-amber-500/40">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30">
              <Banknote className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black">Withdraw Funds</h3>
              <p className="text-xs text-muted-foreground">Min €{minimum} • {methodLabel}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Available</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent"
          >
            €{available.toFixed(2)}
          </motion.p>
        </div>

        {available < minimum && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress to minimum</span>
              <span className="font-bold">€{available.toFixed(2)} / €{minimum}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
              />
            </div>
          </div>
        )}

        {!hasPayoutMethod ? (
          <Button
            onClick={onSetupMethod}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-500/90 hover:to-yellow-500/90 text-black font-bold"
          >
            <Lock className="h-4 w-4 mr-2" /> Set up payout method
          </Button>
        ) : !stripePayoutsEnabled ? (
          <div className="space-y-2">
            <Button disabled className="w-full bg-muted text-muted-foreground font-bold">
              <ShieldAlert className="h-4 w-4 mr-2" /> Stripe payouts not enabled
            </Button>
            {payoutsBlockReason && (
              <p className="text-[11px] text-muted-foreground text-center">
                {payoutsBlockReason}
              </p>
            )}
          </div>
        ) : (
          <Button
            onClick={onRequest}
            disabled={!canPayout}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-500/90 hover:to-yellow-500/90 text-black font-bold disabled:opacity-50"
          >
            Request payout <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
    </>
  );
};
