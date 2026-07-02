import { Button } from "@/components/ui/button";
import { Contact } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface VCardProfile {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  occupation?: string | null;
  company?: string | null;
  website?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  social_links?: Record<string, string | undefined> | null;
}

const escape = (v: string) =>
  v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

function buildVCard(p: VCardProfile, profileUrl: string): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const name = p.full_name || "Profile";
  const parts = name.split(" ");
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ") || "";
  lines.push(`N:${escape(last)};${escape(first)};;;`);
  lines.push(`FN:${escape(name)}`);
  if (p.company) lines.push(`ORG:${escape(p.company)}`);
  if (p.occupation) lines.push(`TITLE:${escape(p.occupation)}`);
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${escape(p.email)}`);
  if (p.phone) lines.push(`TEL;TYPE=CELL:${escape(p.phone)}`);
  if (p.website) lines.push(`URL:${escape(p.website)}`);
  if (p.location) lines.push(`ADR;TYPE=WORK:;;${escape(p.location)};;;;`);
  if (p.bio) lines.push(`NOTE:${escape(p.bio.slice(0, 300))}`);
  lines.push(`URL;TYPE=PROFILE:${escape(profileUrl)}`);
  if (p.social_links) {
    Object.entries(p.social_links).forEach(([k, v]) => {
      if (v && /^https?:\/\//.test(v)) lines.push(`X-SOCIALPROFILE;TYPE=${k}:${escape(v)}`);
    });
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export const VCardDownloadButton = ({
  profile,
  profileUrl,
}: {
  profile: VCardProfile;
  profileUrl?: string;
}) => {
  const handleDownload = () => {
    const url = profileUrl || (typeof window !== "undefined" ? window.location.href : "");
    const vcard = buildVCard(profile, url);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dlUrl;
    a.download = `${(profile.full_name || "contact").replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(dlUrl);
  };

  return (
    <>
      <FloatingHowItWorks title={"V Card Download Button - How it works"} steps={[{ title: 'Open', desc: 'Access the V Card Download Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in V Card Download Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="bg-card/80 backdrop-blur-md border-amber-400/30"
    >
      <Contact className="h-4 w-4 mr-2" />
      Save contact
    </Button>
    </>
  );
};
