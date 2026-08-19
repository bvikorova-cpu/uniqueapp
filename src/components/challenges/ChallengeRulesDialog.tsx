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

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">6. Personal data (GDPR)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  The operator processes only the data necessary to run the competition: account
                  identifier, display name, submitted proof content, points and, for winners, the
                  data required for payout and identity verification.
                </li>
                <li>
                  Legal basis: performance of the contest terms (contract) and the operator's
                  legitimate interest in preventing fraud; payout data are processed to fulfil legal
                  and accounting obligations.
                </li>
                <li>
                  Winners' display names may be published in the leaderboard and winner
                  announcement. No contact details are ever published.
                </li>
                <li>
                  Data are retained only for as long as necessary (contest and accounting periods),
                  and are not sold or shared for marketing purposes.
                </li>
                <li>
                  You may exercise your rights of access, rectification, erasure, restriction,
                  portability and objection, and lodge a complaint with your supervisory authority,
                  at any time via the contact below.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">7. Content rights and licence</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  You keep full ownership of the photos, videos and texts you submit.
                </li>
                <li>
                  By submitting, you grant the operator a free, non-exclusive, worldwide licence to
                  display, reproduce and share your submission inside the platform and in
                  promotion of the competition, for the duration of the contest and its archiving.
                </li>
                <li>
                  You confirm that the submission is your own, that you hold all necessary rights,
                  and that any identifiable person shown has agreed to be featured.
                </li>
                <li>
                  Submissions that infringe third-party rights, or that are illegal, harmful or
                  misleading, will be removed and may lead to disqualification.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">8. Liability</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Participation is voluntary and at your own risk. You are solely responsible for
                  performing challenge activities safely and lawfully.
                </li>
                <li>
                  Nothing in the competition constitutes medical, nutritional or professional
                  advice.
                </li>
                <li>
                  The operator is not liable for technical outages, data loss caused by third-party
                  providers, delays of payment providers, or for indirect or consequential damages,
                  except where liability cannot be excluded by law.
                </li>
                <li>
                  The operator may modify, suspend or cancel the competition for serious operational
                  or legal reasons; already earned prize entitlements remain unaffected.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">9. Complaints and governing law</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Complaints about results or payouts must be submitted within 30 days of the
                  monthly results announcement; the operator responds within 30 days.
                </li>
                <li>
                  These rules are governed by the law applicable at the operator's registered seat,
                  without prejudice to mandatory consumer-protection rights in your place of
                  residence.
                </li>
                <li>
                  These rules complement the platform Terms of Service and Privacy Policy; in case
                  of conflict regarding the competition, these rules prevail.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">10. Operator and contact</h3>
              <p>
                The competition is organised by the operator of the UNIQUE platform
                (uniqueapp.fun). For any question, data-protection request or complaint, contact{" "}
                <a
                  href="mailto:support@unique-platform.com"
                  className="font-semibold text-primary underline"
                >
                  support@unique-platform.com
                </a>
                .
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ChallengeRulesDialog;
