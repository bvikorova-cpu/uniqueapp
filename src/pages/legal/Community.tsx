import { LegalAssistant } from "@/components/legal/LegalAssistant";
import { Users, AlertTriangle, Copyright, Flag } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { AcceptanceTracker } from "@/components/legal/AcceptanceTracker";

const SECTIONS: Section[] = [
  { id: "values", title: "1. Community Values" },
  { id: "allowed", title: "2. What's Allowed" },
  { id: "forbidden", title: "3. What's Forbidden" },
  { id: "moderation", title: "4. Moderation Process" },
  { id: "appeals", title: "5. Appeals" },
  { id: "dmca", title: "6. DMCA / Copyright" },
  { id: "report", title: "7. How to Report" },
  { id: "consequences", title: "8. Consequences" },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LegalHero
          badge="COMMUNITY & DMCA — UNITY V2.0"
          title="Community Guidelines & DMCA"
          subtitle="The rules of conduct that keep UNIQUE safe, respectful, and creative — plus our process for handling copyright complaints."
          effectiveDate="January 20, 2026"
          stats={[
            { label: "Moderation", value: "24/7", icon: <Users className="w-3 h-3" /> },
            { label: "DMCA", value: "✓", icon: <Copyright className="w-3 h-3" /> },
            { label: "Appeals", value: "Open", icon: <Flag className="w-3 h-3" /> },
            { label: "Review", value: "AI+Human", icon: <AlertTriangle className="w-3 h-3" /> },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <LegalSidebar sections={SECTIONS} totalWords={2600} />

          <main className="flex-1 space-y-5 min-w-0">
            <LegalSection id="values" number="§1" title="Our Community Values">
              <ul>
                <li><strong>Respect</strong> — treat everyone with dignity.</li>
                <li><strong>Creativity</strong> — push boundaries safely.</li>
                <li><strong>Safety</strong> — no harm to anyone, especially minors.</li>
              </ul>
            </LegalSection>

            <LegalSection id="allowed" number="§2" title="What's Allowed">
              <ul>
                <li>Creative AI generations within ToS.</li>
                <li>Constructive criticism and feedback.</li>
                <li>Educational content.</li>
                <li>Fiction and satire (clearly labeled).</li>
                <li>Adult content in age-gated, opt-in zones only.</li>
                <li>Tasteful self-promotion of your creator work.</li>
              </ul>
            </LegalSection>

            <LegalSection id="forbidden" number="§3" title="What's Strictly Forbidden">
              <ul>
                <li>🚫 Hate speech, harassment, threats.</li>
                <li>🚫 Illegal content of any kind.</li>
                <li>🚫 CSAM — immediate report to authorities.</li>
                <li>🚫 Identifiable real persons in AI generations without consent.</li>
                <li>🚫 False health or medical claims.</li>
                <li>🚫 Scams, fraud, MLM schemes.</li>
                <li>🚫 Copyright infringement.</li>
                <li>🚫 Spam, doxxing, impersonation.</li>
              </ul>
            </LegalSection>

            <LegalSection id="moderation" number="§4" title="Moderation Process">
              <p><strong>4.1.</strong> AI pre-screens all uploads.</p>
              <p><strong>4.2.</strong> Flagged content reviewed by human moderators within 24 hours.</p>
              <p><strong>4.3.</strong> Severe violations → immediate removal.</p>
              <p><strong>4.4.</strong> All moderation actions logged for audit.</p>
            </LegalSection>

            <LegalSection id="appeals" number="§5" title="Appeals">
              <p>Appeal removed content via <strong>Settings → Moderation Appeals</strong>. Reviewed within 7 days by a different moderator. Final decisions can be escalated to the DPO.</p>
            </LegalSection>

            <LegalSection id="dmca" number="§6" title="DMCA / Copyright Complaints">
              <p>Send DMCA notice to <strong>dmca@unique.app</strong> including:</p>
              <ul>
                <li>Identification of the copyrighted work.</li>
                <li>Identification of infringing material with URL.</li>
                <li>Your contact information.</li>
                <li>Statement of good-faith belief.</li>
                <li>Statement under penalty of perjury.</li>
                <li>Physical or electronic signature.</li>
              </ul>
              <p>Counter-notices accepted with the same elements.</p>
            </LegalSection>

            <LegalSection id="report" number="§7" title="How to Report Content">
              <ol>
                <li>Click the <strong>flag icon</strong> on any content.</li>
                <li>Select reason from dropdown.</li>
                <li>Add details (optional but helpful).</li>
                <li>Submit.</li>
              </ol>
              <p>Severe issues handled within 24h; general violations within 7 days.</p>
            </LegalSection>

            <LegalSection id="consequences" number="§8" title="Consequences of Violations">
              <ul>
                <li><strong>Minor:</strong> Warning</li>
                <li><strong>Moderate:</strong> Content removal</li>
                <li><strong>Serious:</strong> Suspension 7–30 days</li>
                <li><strong>Severe / repeated:</strong> Permanent ban</li>
                <li><strong>Illegal:</strong> Referral to authorities</li>
              </ul>
            </LegalSection>

            <AcceptanceTracker documentType="community" documentTitle="Community Guidelines & DMCA" />
          </main>
        </div>
      </div>
      <LegalAssistant documentType="Community Guidelines & DMCA" documentText="Community Guidelines & DMCA - see content above on this page." />
    </div>
  );
}