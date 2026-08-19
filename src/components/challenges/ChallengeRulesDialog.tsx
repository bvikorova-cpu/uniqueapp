import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollText } from "lucide-react";

/**
 * Official skill-based competition rules for the Eco / Healthy Challenge.
 * Presentation-only: opens a modal with the full legal text.
 */
export function ChallengeRulesDialog({
  sectionName = "Eco Challenge",
  triggerClassName,
}: {
  sectionName?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={
            triggerClassName ??
            "w-full bg-white/10 hover:bg-white/20 border-white/30 text-white gap-1.5"
          }
        >
          <ScrollText className="w-3.5 h-3.5" />
          Contest rules
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Official Contest Rules — {sectionName}</DialogTitle>
          <DialogDescription>
            Skill-based competition. Please read carefully before participating.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5 text-sm leading-relaxed text-foreground/90">
            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">1. Type of competition</h3>
              <p>
                This is a <strong>skill-based and activity-based competition</strong>. The winner is
                determined exclusively by the number of points earned for completed eco challenges,
                according to a transparent leaderboard. Chance, luck or any form of drawing plays no
                role whatsoever.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">2. Eligibility</h3>
              <p>
                The competition is open to all users — with or without a subscription. Participants
                must be at least 18 years old, or have the consent of a legal guardian.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">3. Prize payout</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI credits are credited to the winner's account automatically.</li>
                <li>
                  The cash prize is paid out via supported payment methods (e.g. Stripe / PayPal).
                  Payout is conditional on the winner's cooperation with identity verification
                  (KYC/AML) where required by the payment provider.
                </li>
                <li>
                  The cash prize is paid once it reaches a minimum of <strong>€10</strong>. If the
                  amount is lower, it rolls over to the following month.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">4. Taxes</h3>
              <p>
                The prize recipient (winner) is solely responsible for declaring and paying any taxes
                on the prize in accordance with the laws applicable in their country of tax
                residence.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">5. Fair play and disqualification</h3>
              <p>
                The operator reserves the right to disqualify any user found cheating, using
                automated bots, creating fake accounts, or manipulating results in any way.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ChallengeRulesDialog;
