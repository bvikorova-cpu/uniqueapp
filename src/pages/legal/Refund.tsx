import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { Scale, Coins, CreditCard, Banknote } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
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

export default function Refund() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="GLOBAL REFUND & PAYMENTS — UNITY V2.0"
          title="Refund & Payment Policy"
          subtitle="How money flows on UNIQUE worldwide: multi-currency credits, subscriptions, creator payouts, revenue splits, and what's refundable (and what's not) — across all supported countries."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Currencies", value: "Multi", icon: <Banknote className="w-3 h-3" /> },
            { label: "Processor", value: "Stripe", icon: <CreditCard className="w-3 h-3" /> },
            { label: "Payouts", value: "Weekly", icon: <Coins className="w-3 h-3" /> },
            { label: "Min", value: "€50 / $50", icon: <Scale className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2400} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="scope" number="§1" title="Scope">
              <p>This policy covers all financial transactions: credit purchases, subscriptions, one-time purchases, creator payouts, refunds, chargebacks, and tax obligations.</p>
            </LegalSection>

            <LegalSection id="credits" number="§2" title="Credits Are Non-Refundable">
              <p><strong>2.1.</strong> AI credits are consumable digital goods.</p>
              <p><strong>2.2.</strong> Once purchased, they are non-refundable.</p>
              <p><strong>2.3.</strong> Where mandatory consumer law in your country (e.g. EU 14-day withdrawal, UK CCRs) provides a cooling-off period, it applies only if no credits have been used.</p>
            </LegalSection>

            <LegalSection id="subscriptions" number="§3" title="Subscriptions">
              <p><strong>3.1.</strong> Billed monthly or annually in your local currency where supported.</p>
              <p><strong>3.2.</strong> Cancel anytime — access continues until end of current period.</p>
              <p><strong>3.3.</strong> No prorated refunds for unused time, except where mandatory local consumer law requires.</p>
            </LegalSection>

            <LegalSection id="purchases" number="§4" title="One-Time Purchases">
              <p><strong>4.1.</strong> Digital products: non-refundable once delivered.</p>
              <p><strong>4.2.</strong> Physical products: refundable within the cooling-off period required by your local consumer law (typically 14 days), if unopened and undamaged.</p>
            </LegalSection>

            <LegalSection id="splits" number="§5" title="Revenue Splits">
              <ul>
                <li><strong>Default:</strong> 80% creator / 20% platform</li>
                <li><strong>Pro tier:</strong> 90% creator / 10% platform</li>
                <li>Stripe processing fees and applicable taxes deducted before split.</li>
                <li>Splits visible in real-time in Creator Dashboard.</li>
              </ul>
            </LegalSection>

            <LegalSection id="payouts" number="§6" title="Creator Payouts">
              <ul>
                <li>Via Stripe Connect, processed weekly to creators worldwide.</li>
                <li>Minimum payout: <strong>€50 / $50 / equivalent</strong> in your local currency.</li>
                <li>KYC verification required before first payout (per Stripe Connect rules).</li>
                <li>Available in all countries supported by Stripe Connect (45+ countries).</li>
                <li>Currency conversion handled by Stripe at market rates.</li>
              </ul>
            </LegalSection>

            <LegalSection id="disputes" number="§7" title="Disputes & Chargebacks">
              <p><strong>7.1.</strong> All disputes handled per Stripe's global dispute process.</p>
              <p><strong>7.2.</strong> Fraudulent chargebacks → account termination + permanent ban.</p>
              <p><strong>7.3.</strong> We will provide evidence to contest fraudulent disputes.</p>
              <p><strong>7.4.</strong> Cross-border disputes resolved via online arbitration (ICC rules) where direct resolution fails.</p>
            </LegalSection>

            <LegalSection id="tax" number="§8" title="Taxes">
              <p><strong>8.1.</strong> You are responsible for your own income tax, sales tax, GST, or VAT obligations in your country of residence.</p>
              <p><strong>8.2.</strong> We issue invoices and tax forms (1099, EU invoice, etc.) where legally required by your jurisdiction.</p>
              <p><strong>8.3.</strong> Platform collects and remits applicable consumption taxes (EU VAT, UK VAT, US sales tax, AU GST, etc.) on B2C digital services automatically.</p>
            </LegalSection>

            <AcceptanceTracker documentType="refund" documentTitle="Refund & Payment Policy" />
          </main>
        </div>
      </div>
    </div>
  );
}
