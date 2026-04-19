import { Lock, Cookie, Eye, Database } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { AcceptanceTracker } from "@/components/legal/AcceptanceTracker";

const SECTIONS: Section[] = [
  { id: "data", title: "1. Data We Collect" },
  { id: "purpose", title: "2. Purpose of Processing" },
  { id: "legal", title: "3. Legal Basis (GDPR)" },
  { id: "sharing", title: "4. Data Sharing" },
  { id: "rights", title: "5. Your Rights" },
  { id: "retention", title: "6. Retention Period" },
  { id: "cookies", title: "7. Cookies" },
  { id: "manage", title: "8. Manage Cookies" },
  { id: "contact", title: "9. Data Protection Officer" },
];

const RAW = "UNIQUE Privacy Policy and Cookie Policy under GDPR. We collect account data, content metadata, payment data via Stripe, device info, cookies. Lawful bases include consent, contract, legitimate interest. Rights include access, rectification, erasure, portability, restriction, objection, withdrawal of consent. DPO contact dpo@unique.app.";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="GDPR COMPLIANT — UNITY V2.0"
          title="Privacy & Cookies"
          subtitle="Your data is yours. Here's exactly what we collect, why we collect it, who we share it with, and how you can control all of it."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "GDPR", value: "✓", icon: <Lock className="w-3 h-3" /> },
            { label: "Tracking", value: "Opt-in", icon: <Eye className="w-3 h-3" /> },
            { label: "Cookies", value: "3 types", icon: <Cookie className="w-3 h-3" /> },
            { label: "Storage", value: "EU only", icon: <Database className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2800} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="data" number="§1" title="Data We Collect" documentType="privacy" rawText="We collect: account data (email, username, password hash); profile data (name, avatar, bio); content metadata (uploads, AI generations, comments); payment data via Stripe (we never see card numbers); device data (IP, browser, OS); cookies and session tokens.">
              <ul>
                <li><strong>Account</strong> — email, username, password hash.</li>
                <li><strong>Profile</strong> — name, avatar, bio (optional).</li>
                <li><strong>Content</strong> — uploads, AI generations, comments, likes.</li>
                <li><strong>Payment</strong> — handled by Stripe; we never see card numbers.</li>
                <li><strong>Device</strong> — IP, browser, OS, language.</li>
                <li><strong>Cookies</strong> — essential, analytics (opt-in), preferences.</li>
              </ul>
            </LegalSection>

            <LegalSection id="purpose" number="§2" title="Purpose of Processing" documentType="privacy" rawText="We process your data to: provide the service; process payments and payouts; protect against fraud; improve features through aggregated analytics; comply with legal obligations (tax, AML); send critical service notifications.">
              <ul>
                <li>Provide and operate the platform.</li>
                <li>Process payments and creator payouts.</li>
                <li>Detect and prevent fraud and abuse.</li>
                <li>Improve features (aggregated analytics only).</li>
                <li>Comply with tax and anti-money-laundering obligations.</li>
                <li>Send critical service notifications.</li>
              </ul>
            </LegalSection>

            <LegalSection id="legal" number="§3" title="Legal Basis (GDPR Art. 6)" documentType="privacy" rawText="Lawful bases: consent for analytics and marketing; contract for service delivery and payments; legal obligation for tax records; legitimate interest for fraud prevention and security.">
              <ul>
                <li><strong>Consent</strong> — analytics, marketing emails.</li>
                <li><strong>Contract</strong> — service delivery, payments.</li>
                <li><strong>Legal obligation</strong> — tax and accounting records.</li>
                <li><strong>Legitimate interest</strong> — fraud prevention, security.</li>
              </ul>
            </LegalSection>

            <LegalSection id="sharing" number="§4" title="Who We Share Data With" documentType="privacy" rawText="We share data with: Stripe (payments), Supabase (hosting in EU region), Lovable AI Gateway (AI features, anonymized prompts), authorities when legally required. We never sell your data.">
              <ul>
                <li><strong>Stripe</strong> — payment processing.</li>
                <li><strong>Supabase</strong> — hosting (EU region).</li>
                <li><strong>Lovable AI Gateway</strong> — AI features (prompts anonymized).</li>
                <li><strong>Authorities</strong> — only when legally required.</li>
              </ul>
              <p><strong>We never sell your data.</strong></p>
            </LegalSection>

            <LegalSection id="rights" number="§5" title="Your GDPR Rights" documentType="privacy" rawText="You have the right to: access your data; rectify inaccurate data; erasure (right to be forgotten); data portability; restriction of processing; object to processing; withdraw consent at any time; lodge a complaint with a supervisory authority.">
              <ul>
                <li>Access — request a copy of your data.</li>
                <li>Rectification — correct inaccurate data.</li>
                <li>Erasure — "right to be forgotten".</li>
                <li>Portability — receive data in machine-readable format.</li>
                <li>Restriction — limit how we use your data.</li>
                <li>Objection — object to processing for legitimate interest.</li>
                <li>Withdraw consent — at any time.</li>
                <li>Complaint — lodge with supervisory authority.</li>
              </ul>
            </LegalSection>

            <LegalSection id="retention" number="§6" title="Retention Period" documentType="privacy" rawText="Account data: deleted within 30 days of account closure. Payment records: 10 years (tax law). Logs and security events: 12 months. Anonymized analytics: indefinite.">
              <ul>
                <li><strong>Account data</strong> — deleted within 30 days of account closure.</li>
                <li><strong>Payment records</strong> — 10 years (Slovak tax law).</li>
                <li><strong>Security logs</strong> — 12 months.</li>
                <li><strong>Anonymized analytics</strong> — indefinite.</li>
              </ul>
            </LegalSection>

            <LegalSection id="cookies" number="§7" title="Cookies We Use" documentType="privacy" rawText="Essential cookies: session, authentication, CSRF (always on). Analytics: anonymized usage stats (opt-in). Preferences: theme, language (opt-in). No third-party advertising cookies.">
              <ul>
                <li><strong>Essential</strong> — session, auth, CSRF (always on).</li>
                <li><strong>Analytics</strong> — anonymized usage (opt-in).</li>
                <li><strong>Preferences</strong> — theme, language (opt-in).</li>
              </ul>
              <p>We do not use third-party advertising cookies.</p>
            </LegalSection>

            <LegalSection id="manage" number="§8" title="Manage Your Cookies" documentType="privacy" rawText="You can manage cookies in Settings → Privacy or via your browser settings. Disabling essential cookies will break the platform.">
              <p>Visit <strong>Settings → Privacy</strong> to manage cookie preferences, or use your browser's cookie controls. Disabling essential cookies will prevent the platform from working.</p>
            </LegalSection>

            <LegalSection id="contact" number="§9" title="Data Protection Officer" documentType="privacy" rawText="DPO email dpo@unique.app. Postal address UNIQUE s.r.o., Bratislava, Slovak Republic.">
              <p>Email: <strong>dpo@unique.app</strong></p>
              <p>Post: UNIQUE s.r.o., Bratislava, Slovak Republic</p>
            </LegalSection>

            <AcceptanceTracker documentType="privacy" documentTitle="Privacy & Cookie Policy" />
          </main>
        </div>
      </div>

      <LegalAssistant documentType="privacy" documentText={RAW} />
    </div>
  );
}
