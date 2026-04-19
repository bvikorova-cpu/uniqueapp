import { Scale, Coins, CreditCard, Banknote } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { AcceptanceTracker } from "@/components/legal/AcceptanceTracker";

const SECTIONS: Section[] = [
  { id: "scope", title: "1. Scope" },
  { id: "credits", title: "2. Credits Are Non-Refundable" },
  { id: "subscriptions", title: "3. Subscriptions" },
  { id: "purchases", title: "4. One-Time Purchases" },
  { id: "splits", title: "5. Revenue Splits" },
  { id: "payouts", title: "6. Creator Payouts" },
  { id: "disputes", title: "7. Disputes & Chargebacks" },
  { id: "tax", title: "8. Taxes" },
];

const RAW = "UNIQUE Refund and Payment Policy. Credits are non-refundable consumables. Subscriptions can be canceled anytime, no prorated refund. Creator earnings split via Stripe Connect: 80/20 default, 90/10 Pro tier. Payouts weekly, minimum 50 EUR. KYC required. Chargebacks handled via Stripe. Users responsible for own taxes.";

export default function Refund() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="REFUND & PAYMENTS — UNITY V2.0"
          title="Refund & Payment Policy"
          subtitle="How money flows on UNIQUE: credits, subscriptions, creator payouts, revenue splits, and what's refundable (and what's not)."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Currency", value: "EUR", icon: <Banknote className="w-3 h-3" /> },
            { label: "Processor", value: "Stripe", icon: <CreditCard className="w-3 h-3" /> },
            { label: "Payouts", value: "Weekly", icon: <Coins className="w-3 h-3" /> },
            { label: "Min", value: "€50", icon: <Scale className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2400} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="scope" number="§1" title="Scope" documentType="refund" rawText="This policy covers all financial transactions on the platform: credit purchases, subscriptions, one-time purchases, creator payouts, refunds, chargebacks, and tax obligations.">
              <p>This policy covers all financial transactions: credit purchases, subscriptions, one-time purchases, creator payouts, refunds, chargebacks, and tax obligations.</p>
            </LegalSection>

            <LegalSection id="credits" number="§2" title="Credits Are Non-Refundable" documentType="refund" rawText="AI credits are consumable digital goods. Once purchased, they are non-refundable except as required by EU consumer law for the 14-day withdrawal period and only if no credits have been used.">
              <p><strong>2.1.</strong> AI credits are consumable digital goods.</p>
              <p><strong>2.2.</strong> Once purchased, they are non-refundable.</p>
              <p><strong>2.3.</strong> EU 14-day withdrawal applies only if zero credits have been used.</p>
            </LegalSection>

            <LegalSection id="subscriptions" number="§3" title="Subscriptions" documentType="refund" rawText="Subscriptions billed monthly or annually. Cancel anytime in Settings; access continues until the end of the current period. No prorated refunds for unused time, except as required by EU law.">
              <p><strong>3.1.</strong> Billed monthly or annually.</p>
              <p><strong>3.2.</strong> Cancel anytime — access continues until end of current period.</p>
              <p><strong>3.3.</strong> No prorated refunds for unused time (except where EU law requires).</p>
            </LegalSection>

            <LegalSection id="purchases" number="§4" title="One-Time Purchases" documentType="refund" rawText="Digital products are non-refundable once delivered. Physical products refundable within 14 days under EU distance selling law if unopened and undamaged.">
              <p><strong>4.1.</strong> Digital products: non-refundable once delivered.</p>
              <p><strong>4.2.</strong> Physical products: refundable within 14 days (unopened, undamaged) under EU distance selling.</p>
            </LegalSection>

            <LegalSection id="splits" number="§5" title="Revenue Splits" documentType="refund" rawText="Default creator revenue split is 80% creator, 20% platform. Pro tier creators receive 90/10 split. Stripe processing fees deducted before split. All splits transparently visible in Creator Dashboard.">
              <ul>
                <li><strong>Default:</strong> 80% creator / 20% platform</li>
                <li><strong>Pro tier:</strong> 90% creator / 10% platform</li>
                <li>Stripe processing fees deducted before split.</li>
                <li>Splits visible in real-time in Creator Dashboard.</li>
              </ul>
            </LegalSection>

            <LegalSection id="payouts" number="§6" title="Creator Payouts" documentType="refund" rawText="Payouts via Stripe Connect, weekly. Minimum payout 50 EUR. KYC verification required before first payout. Country support per Stripe Connect availability list.">
              <ul>
                <li>Via Stripe Connect, processed weekly.</li>
                <li>Minimum payout: <strong>€50</strong></li>
                <li>KYC verification required before first payout.</li>
                <li>Available countries per Stripe Connect supported regions.</li>
              </ul>
            </LegalSection>

            <LegalSection id="disputes" number="§7" title="Disputes & Chargebacks" documentType="refund" rawText="Disputes handled per Stripe dispute process. Fraudulent chargebacks may result in account termination and ban from the platform. We provide evidence to dispute fraudulent claims.">
              <p><strong>7.1.</strong> All disputes handled per Stripe's dispute process.</p>
              <p><strong>7.2.</strong> Fraudulent chargebacks → account termination + permanent ban.</p>
              <p><strong>7.3.</strong> We will provide evidence to contest fraudulent disputes.</p>
            </LegalSection>

            <LegalSection id="tax" number="§8" title="Taxes" documentType="refund" rawText="Users are responsible for their own income tax and VAT obligations in their jurisdiction. We issue invoices and 1099-equivalent forms where required by law. EU VAT MOSS handled by the platform for B2C digital services.">
              <p><strong>8.1.</strong> You are responsible for your own income tax and VAT.</p>
              <p><strong>8.2.</strong> We issue invoices and tax forms where legally required.</p>
              <p><strong>8.3.</strong> EU VAT MOSS handled by platform for B2C digital services.</p>
            </LegalSection>

            <AcceptanceTracker documentType="refund" documentTitle="Refund & Payment Policy" />
          </main>
        </div>
      </div>

      <LegalAssistant documentType="refund" documentText={RAW} />
    </div>
  );
}
