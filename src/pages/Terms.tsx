import { Shield, FileText, Scale, Users, Lock } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { AcceptanceTracker } from "@/components/legal/AcceptanceTracker";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const SECTIONS: Section[] = [
  { id: "scope", title: "1. Scope & Acceptance" },
  { id: "definitions", title: "2. Definitions" },
  { id: "registration", title: "3. Registration & Age (16+)" },
  { id: "content", title: "4. User Content & Licenses" },
  { id: "payments", title: "5. Payments & Credits" },
  { id: "creator", title: "6. Creator Obligations" },
  { id: "prohibited", title: "7. Prohibited Conduct" },
  { id: "ip", title: "8. Intellectual Property" },
  { id: "termination", title: "9. Termination" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "law", title: "11. Governing Law" },
  { id: "changes", title: "12. Changes to Terms" },
];

const LEGAL_PAGES = [
  { to: "/legal/privacy", icon: Lock, title: "Privacy & Cookies", desc: "GDPR, data we collect, cookies" },
  { to: "/legal/refund", icon: Scale, title: "Refund & Payments", desc: "Stripe Connect, credits, payouts" },
  { to: "/legal/creator", icon: FileText, title: "Creator Agreement", desc: "Revenue splits, obligations" },
  { to: "/legal/community", icon: Users, title: "Community & DMCA", desc: "Conduct rules, copyright" },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="UNITY V2.0 — GLOBAL PROTECTIVE EDITION"
          title="Platform Terms & Conditions"
          subtitle="The complete legal agreement between you and UNIQUE — a global platform serving creators and users worldwide. Every section, every clause, every safeguard designed to protect creators, users, and the platform across all jurisdictions."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Sections", value: "12", icon: <FileText className="w-3 h-3" /> },
            { label: "Edition", value: "V2.0", icon: <Shield className="w-3 h-3" /> },
            { label: "Reach", value: "Global", icon: <Scale className="w-3 h-3" /> },
            { label: "Audit", value: "Logged", icon: <Lock className="w-3 h-3" /> },
          ]}
        />

        {/* Legal pages quick-nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {LEGAL_PAGES.map((p) => (
            <Link key={p.to} to={p.to}>
              <Card className="p-4 h-full bg-card/80 backdrop-blur-sm border-amber-400/15 hover:border-amber-400/40 hover:-translate-y-1 transition-all">
                <p.icon className="w-6 h-6 text-amber-400 mb-2" />
                <h3 className="font-bold text-sm">{p.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{p.desc}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={4200} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="scope" number="§1" title="Scope & Acceptance">
              <p><strong>1.1.</strong> These terms govern the relationship between the Operator (UNIQUE s.r.o., Germany) and all Users/Creators.</p>
              <p><strong>1.2.</strong> By accessing or using the platform you unconditionally and immediately agree to be bound.</p>
              <p><strong>1.3.</strong> If you disagree with any part, you must stop using the service.</p>
              <p><strong>1.4. Age rating — 16+.</strong> The main platform is rated <strong>16+</strong>. See <a href="#registration" className="text-amber-400 underline">§3 Registration & Age</a> for full details and the Kids Channel for ages 6–12.</p>
            </LegalSection>

            <LegalSection id="definitions" number="§2" title="Definitions">
              <ul>
                <li><strong>Operator</strong> — UNIQUE s.r.o.</li>
                <li><strong>User</strong> — any registered account holder.</li>
                <li><strong>Creator</strong> — a User who monetizes content.</li>
                <li><strong>Credits</strong> — platform consumables purchased via Stripe.</li>
                <li><strong>Tier</strong> — subscription level (Free, Pro, Business).</li>
              </ul>
            </LegalSection>

            <LegalSection id="registration" number="§3" title="Account Registration & Age Requirement">
              <p><strong>3.1. Minimum age — 16+.</strong> The main UNIQUE platform is intended for users aged <strong>16 and over</strong>, in line with GDPR Art. 8 and equivalent international child-protection standards. By registering, you confirm you are at least 16 years old.</p>
              <p><strong>3.2. Date of birth verification.</strong> A date of birth is required at signup. Accounts where the calculated age is below 16 are automatically blocked from the main platform.</p>
              <p><strong>3.3. Children aged 6–12 — Kids Channel.</strong> Younger children may only use the dedicated <Link to="/kids-channel" className="text-amber-400 underline">Kids Channel</Link>, which requires a parent/guardian account, parental controls and a Gold Pass. Children aged 13–15 are not currently supported.</p>
              <p><strong>3.4. Misrepresentation of age.</strong> Providing a false date of birth is a material breach of these terms and grounds for immediate termination and deletion of the account and content.</p>
              <p><strong>3.5. Account integrity.</strong> One account per person. You are responsible for keeping credentials secure.</p>
              <p><strong>3.6. Suspension.</strong> We may suspend or terminate accounts for breach of these terms, including age misrepresentation.</p>
            </LegalSection>

            <LegalSection id="content" number="§4" title="User Content & Licenses">
              <p><strong>4.1.</strong> You retain full ownership of all content you upload.</p>
              <p><strong>4.2.</strong> You grant UNIQUE a worldwide, non-exclusive license to host, display, distribute, and promote your content on the platform.</p>
              <p><strong>4.3.</strong> You are solely responsible for ensuring you have the legal right to upload all content.</p>
            </LegalSection>

            <LegalSection id="payments" number="§5" title="Payments & Credits">
              <p><strong>5.1.</strong> All transactions are processed in EUR via Stripe.</p>
              <p><strong>5.2.</strong> Credits are non-refundable consumables.</p>
              <p><strong>5.3.</strong> Creators receive payouts via Stripe Connect — see <Link to="/legal/creator" className="text-amber-400 underline">Creator Agreement</Link>.</p>
              <p><strong>5.4.</strong> Platform and payment processor fees are deducted before payout.</p>
            </LegalSection>

            <LegalSection id="creator" number="§6" title="Creator Obligations">
              <p><strong>6.1.</strong> Comply with all tax obligations in your jurisdiction.</p>
              <p><strong>6.2.</strong> Complete KYC verification before payouts.</p>
              <p><strong>6.3.</strong> Honor all obligations to subscribers and customers.</p>
              <p><strong>6.4.</strong> Comply with the <Link to="/legal/community" className="text-amber-400 underline">Community Guidelines</Link>.</p>
            </LegalSection>

            <LegalSection id="prohibited" number="§7" title="Prohibited Conduct">
              <ul>
                <li>Illegal content of any kind.</li>
                <li>Harassment, hate speech, threats, or incitement to violence.</li>
                <li>Spam, scams, fraudulent schemes.</li>
                <li>Copyright or trademark infringement.</li>
                <li>Exploitation of minors.</li>
                <li>Medical advice or false health claims.</li>
                <li>Identifiable real persons in AI generations without consent.</li>
              </ul>
            </LegalSection>

            <LegalSection id="ip" number="§8" title="Intellectual Property">
              <p><strong>8.1.</strong> The UNIQUE brand, code, and design are owned exclusively by the Operator.</p>
              <p><strong>8.2.</strong> AI-generated content is owned by the User who generated it (subject to §4).</p>
              <p><strong>8.3.</strong> DMCA notices are handled per the <Link to="/legal/community" className="text-amber-400 underline">DMCA Policy</Link>.</p>
            </LegalSection>

            <LegalSection id="termination" number="§9" title="Termination">
              <p><strong>9.1.</strong> You may delete your account anytime in Settings.</p>
              <p><strong>9.2.</strong> We may terminate accounts that breach these terms.</p>
              <p><strong>9.3.</strong> Pending payouts above minimum threshold are processed within 30 days of termination.</p>
            </LegalSection>

            <LegalSection id="liability" number="§10" title="Limitation of Liability">
              <p><strong>10.1.</strong> The platform is provided "as is" without warranties.</p>
              <p><strong>10.2.</strong> Maximum aggregate liability is limited to fees paid in the past 12 months.</p>
              <p><strong>10.3.</strong> No liability for indirect, consequential, or punitive damages.</p>
            </LegalSection>

            <LegalSection id="law" number="§11" title="Governing Law & Disputes">
              <p><strong>11.1.</strong> UNIQUE operates as a global platform and complies with international standards including GDPR (EU), CCPA (California), UK Data Protection Act, LGPD (Brazil), PIPEDA (Canada), and equivalent privacy and consumer protection laws worldwide.</p>
              <p><strong>11.2.</strong> Disputes are first addressed through good-faith negotiation, then through binding arbitration under the rules of the International Chamber of Commerce (ICC), with proceedings conducted online in English.</p>
              <p><strong>11.3.</strong> Mandatory consumer protection rights granted to you by the laws of your country of residence are not affected by these terms.</p>
              <p><strong>11.4.</strong> Where local law requires, users may also bring claims in the competent courts of their country of residence.</p>
            </LegalSection>

            <LegalSection id="changes" number="§12" title="Changes to Terms">
              <p><strong>12.1.</strong> We may update these terms at any time.</p>
              <p><strong>12.2.</strong> Material changes notified by email and in-app banner 30 days before effect.</p>
              <p><strong>12.3.</strong> Continued use after effective date constitutes acceptance.</p>
            </LegalSection>

            <AcceptanceTracker documentType="terms" documentTitle="UNIQUE Platform Terms & Conditions" />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Terms;
