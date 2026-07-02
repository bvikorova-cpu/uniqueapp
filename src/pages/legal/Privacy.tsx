import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { Lock, Cookie, Eye, Database } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
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

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="GLOBAL PRIVACY — UNITY V2.0"
          title="Privacy & Cookies"
          subtitle="Your data is yours. UNIQUE complies with GDPR, CCPA, UK DPA, LGPD, PIPEDA and equivalent privacy laws worldwide. Here's exactly what we collect, why, who we share it with, and how you control it."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Standards", value: "Global", icon: <Lock className="w-3 h-3" /> },
            { label: "Tracking", value: "Opt-in", icon: <Eye className="w-3 h-3" /> },
            { label: "Cookies", value: "3 types", icon: <Cookie className="w-3 h-3" /> },
            { label: "Storage", value: "Multi-region", icon: <Database className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2800} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="data" number="§1" title="Data We Collect">
              <ul>
                <li><strong>Account</strong> — email, username, password hash.</li>
                <li><strong>Profile</strong> — name, avatar, bio (optional).</li>
                <li><strong>Content</strong> — uploads, AI generations, comments, likes.</li>
                <li><strong>Payment</strong> — handled by Stripe; we never see card numbers.</li>
                <li><strong>Device</strong> — IP, browser, OS, language.</li>
                <li><strong>Cookies</strong> — essential, analytics (opt-in), preferences.</li>
              </ul>
            </LegalSection>

            <LegalSection id="purpose" number="§2" title="Purpose of Processing">
              <ul>
                <li>Provide and operate the platform.</li>
                <li>Process payments and creator payouts.</li>
                <li>Detect and prevent fraud and abuse.</li>
                <li>Improve features (aggregated analytics only).</li>
                <li>Comply with tax and anti-money-laundering obligations.</li>
                <li>Send critical service notifications.</li>
              </ul>
            </LegalSection>

            <LegalSection id="legal" number="§3" title="Legal Basis (GDPR Art. 6)">
              <ul>
                <li><strong>Consent</strong> — analytics, marketing emails.</li>
                <li><strong>Contract</strong> — service delivery, payments.</li>
                <li><strong>Legal obligation</strong> — tax and accounting records.</li>
                <li><strong>Legitimate interest</strong> — fraud prevention, security.</li>
              </ul>
            </LegalSection>

            <LegalSection id="sharing" number="§4" title="Who We Share Data With">
              <ul>
                <li><strong>Stripe</strong> — payment processing.</li>
                <li><strong>Supabase</strong> — hosting (EU region).</li>
                <li><strong>Lovable AI Gateway</strong> — AI features (prompts anonymized).</li>
                <li><strong>Authorities</strong> — only when legally required.</li>
              </ul>
              <p><strong>We never sell your data.</strong></p>
            </LegalSection>

            <LegalSection id="rights" number="§5" title="Your GDPR Rights">
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

            <LegalSection id="retention" number="§6" title="Retention Period">
              <ul>
                <li><strong>Account data</strong> — deleted within 30 days of account closure.</li>
                <li><strong>Payment records</strong> — 10 years (local tax law).</li>
                <li><strong>Security logs</strong> — 12 months.</li>
                <li><strong>Anonymized analytics</strong> — indefinite.</li>
              </ul>
            </LegalSection>

            <LegalSection id="cookies" number="§7" title="Cookies We Use">
              <ul>
                <li><strong>Essential</strong> — session, auth, CSRF (always on).</li>
                <li><strong>Analytics</strong> — anonymized usage (opt-in).</li>
                <li><strong>Preferences</strong> — theme, language (opt-in).</li>
              </ul>
              <p>We do not use third-party advertising cookies.</p>
            </LegalSection>

            <LegalSection id="manage" number="§8" title="Manage Your Cookies">
              <p>Visit <strong>Settings → Privacy</strong> to manage cookie preferences, or use your browser's cookie controls. Disabling essential cookies will prevent the platform from working.</p>
            </LegalSection>

            <LegalSection id="contact" number="§9" title="Data Protection Contact">
              <p>For all privacy-related requests (access, deletion, portability, complaints):</p>
              <p>Email: <strong>privacy@unique.app</strong></p>
              <p>We respond to all verified requests within 30 days, regardless of your country of residence.</p>
            </LegalSection>

            <AcceptanceTracker documentType="privacy" documentTitle="Privacy & Cookie Policy" />
          </main>
        </div>
      </div>
      <LegalAssistant documentType="Privacy & Cookie Policy" documentText="Privacy & Cookie Policy - see content above on this page." />
    </div>
  );
}