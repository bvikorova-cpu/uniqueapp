import { FileText, Crown, Coins, ShieldCheck } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { AcceptanceTracker } from "@/components/legal/AcceptanceTracker";

const SECTIONS: Section[] = [
  { id: "eligibility", title: "1. Creator Eligibility" },
  { id: "splits", title: "2. Revenue Splits" },
  { id: "kyc", title: "3. KYC & Identity" },
  { id: "obligations", title: "4. Creator Obligations" },
  { id: "exclusivity", title: "5. Non-Exclusivity" },
  { id: "promo", title: "6. Promotion Rights" },
  { id: "termination", title: "7. Termination" },
];

export default function Creator() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="CREATOR AGREEMENT — UNITY V2.0"
          title="Creator Agreement"
          subtitle="The contract between you (Creator) and UNIQUE. Revenue splits, payout terms, your rights, your obligations. Built to protect creators."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Default Split", value: "80/20", icon: <Coins className="w-3 h-3" /> },
            { label: "Pro Split", value: "90/10", icon: <Crown className="w-3 h-3" /> },
            { label: "KYC", value: "Stripe", icon: <ShieldCheck className="w-3 h-3" /> },
            { label: "Exclusivity", value: "None", icon: <FileText className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2200} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="eligibility" number="§1" title="Creator Eligibility">
              <ul>
                <li>18 years or older.</li>
                <li>Valid bank account in a Stripe Connect supported country.</li>
                <li>Completed KYC verification.</li>
                <li>Accepted Platform Terms and Community Guidelines.</li>
              </ul>
            </LegalSection>

            <LegalSection id="splits" number="§2" title="Revenue Splits">
              <ul>
                <li><strong>Default:</strong> 80% creator / 20% platform</li>
                <li><strong>Pro tier:</strong> 90% creator / 10% platform</li>
                <li>Applied after Stripe processing fees.</li>
                <li>Real-time visibility in Creator Dashboard.</li>
                <li>30-day notice for any split adjustment.</li>
              </ul>
            </LegalSection>

            <LegalSection id="kyc" number="§3" title="KYC & Identity Verification">
              <p><strong>3.1.</strong> KYC handled entirely by Stripe Connect.</p>
              <p><strong>3.2.</strong> Required: government ID, proof of address, business registration (if applicable).</p>
              <p><strong>3.3.</strong> We never store identity documents directly.</p>
            </LegalSection>

            <LegalSection id="obligations" number="§4" title="Creator Obligations">
              <ul>
                <li>Pay your own income tax and VAT.</li>
                <li>Deliver content as promised.</li>
                <li>Honor all subscriptions and purchases.</li>
                <li>Respond to user complaints in reasonable time.</li>
                <li>Comply with Community Guidelines.</li>
                <li>Maintain accurate listings.</li>
              </ul>
            </LegalSection>

            <LegalSection id="exclusivity" number="§5" title="Non-Exclusivity">
              <p>UNIQUE is <strong>non-exclusive</strong>. You may sell the same or different content on other platforms. We do not require exclusivity, ever.</p>
            </LegalSection>

            <LegalSection id="promo" number="§6" title="Platform Promotion Rights">
              <p><strong>6.1.</strong> You grant UNIQUE the right to feature your content in marketing, homepage, newsletters, and social media.</p>
              <p><strong>6.2.</strong> Your creator credit is always preserved.</p>
              <p><strong>6.3.</strong> You may opt out per item via Creator Dashboard.</p>
            </LegalSection>

            <LegalSection id="termination" number="§7" title="Termination">
              <p><strong>7.1.</strong> Either party may terminate at any time.</p>
              <p><strong>7.2.</strong> Pending payouts processed within 30 days.</p>
              <p><strong>7.3.</strong> Outstanding subscriber obligations must be honored or refunded.</p>
            </LegalSection>

            <AcceptanceTracker documentType="creator" documentTitle="Creator Agreement" />
          </main>
        </div>
      </div>
    </div>
  );
}
