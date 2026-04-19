import { Users, AlertTriangle, Copyright, Flag } from "lucide-react";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalSidebar, LegalSection as Section } from "@/components/legal/LegalSidebar";
import { LegalSection } from "@/components/legal/LegalSection";
import { LegalAssistant } from "@/components/legal/LegalAssistant";
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

const RAW = "Community Guidelines and DMCA Policy UNITY V2.0. Values: respect, creativity, safety. Forbidden: hate, harassment, illegal, NSFW outside designated areas, scams, copyright infringement, identifiable real persons in AI without consent, false health claims. Moderation: AI + human review. Appeals via Settings. DMCA: notice to dmca@unique.app with required elements. Counter-notices accepted.";

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
            <LegalSection id="values" number="§1" title="Our Community Values" documentType="community" rawText="Three core values: respect (treat everyone with dignity), creativity (push boundaries safely), safety (no harm to anyone, especially minors).">
              <ul>
                <li><strong>Respect</strong> — treat everyone with dignity.</li>
                <li><strong>Creativity</strong> — push boundaries safely.</li>
                <li><strong>Safety</strong> — no harm to anyone, especially minors.</li>
              </ul>
            </LegalSection>

            <LegalSection id="allowed" number="§2" title="What's Allowed" documentType="community" rawText="Creative AI generations within ToS. Constructive criticism. Educational content. Fiction and satire (clearly labeled). Adult content only in age-gated, opt-in zones. Marketing your own creator work tastefully.">
              <ul>
                <li>Creative AI generations within ToS.</li>
                <li>Constructive criticism and feedback.</li>
                <li>Educational content.</li>
                <li>Fiction and satire (clearly labeled).</li>
                <li>Adult content in age-gated, opt-in zones only.</li>
                <li>Tasteful self-promotion of your creator work.</li>
              </ul>
            </LegalSection>

            <LegalSection id="forbidden" number="§3" title="What's Strictly Forbidden" documentType="community" rawText="Hate speech, harassment, threats. Illegal content of any kind. CSAM (immediate report to authorities). Identifiable real persons in AI generations without consent. False health or medical claims. Scams, fraud, MLM. Copyright infringement. Spam. Doxxing. Impersonation.">
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

            <LegalSection id="moderation" number="§4" title="Moderation Process" documentType="community" rawText="AI pre-screen all uploads. Flagged content reviewed by human moderators within 24 hours. Severe violations trigger immediate removal. We log all moderation actions for audit.">
              <p><strong>4.1.</strong> AI pre-screens all uploads.</p>
              <p><strong>4.2.</strong> Flagged content reviewed by human moderators within 24 hours.</p>
              <p><strong>4.3.</strong> Severe violations → immediate removal.</p>
              <p><strong>4.4.</strong> All moderation actions logged for audit.</p>
            </LegalSection>

            <LegalSection id="appeals" number="§5" title="Appeals" documentType="community" rawText="If your content was removed, you may appeal via Settings → Moderation Appeals. Appeals reviewed within 7 days by a different moderator. Decision is final but you may escalate to DPO.">
              <p>Appeal removed content via <strong>Settings → Moderation Appeals</strong>. Reviewed within 7 days by a different moderator. Final decisions can be escalated to the DPO.</p>
            </LegalSection>

            <LegalSection id="dmca" number="§6" title="DMCA / Copyright Complaints" documentType="community" rawText="Send DMCA notice to dmca@unique.app with: identification of copyrighted work, identification of infringing material with URL, your contact info, statement of good faith belief, statement under penalty of perjury, your physical or electronic signature. Counter-notices accepted with same elements.">
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

            <LegalSection id="report" number="§7" title="How to Report Content" documentType="community" rawText="Click the flag icon on any content. Select reason. Add details. Submit. We respond within 24 hours for severe issues, 7 days for general violations.">
              <ol>
                <li>Click the <strong>flag icon</strong> on any content.</li>
                <li>Select reason from dropdown.</li>
                <li>Add details (optional but helpful).</li>
                <li>Submit.</li>
              </ol>
              <p>Severe issues handled within 24h; general violations within 7 days.</p>
            </LegalSection>

            <LegalSection id="consequences" number="§8" title="Consequences of Violations" documentType="community" rawText="Warning for minor first offense. Content removal for moderate. Account suspension 7-30 days for serious. Permanent ban for severe or repeated. Legal referral for illegal activity. Pending payouts may be withheld pending investigation.">
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

      <LegalAssistant documentType="community" documentText={RAW} />
    </div>
  );
}
