import { Instagram, Linkedin, Twitter, Youtube, Globe, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

interface Props {
  value: SocialLinks;
  onChange: (next: SocialLinks) => void;
}

const FIELDS: { key: keyof SocialLinks; label: string; icon: React.ElementType; placeholder: string; color: string }[] = [
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourname", color: "text-pink-400" },
  { key: "tiktok",    label: "TikTok",    icon: Music2,    placeholder: "https://tiktok.com/@yourname",   color: "text-foreground" },
  { key: "linkedin",  label: "LinkedIn",  icon: Linkedin,  placeholder: "https://linkedin.com/in/yourname", color: "text-sky-400" },
  { key: "twitter",   label: "X / Twitter", icon: Twitter, placeholder: "https://x.com/yourname",         color: "text-foreground" },
  { key: "youtube",   label: "YouTube",   icon: Youtube,   placeholder: "https://youtube.com/@yourname",  color: "text-red-400" },
  { key: "website",   label: "Website",   icon: Globe,     placeholder: "https://your-site.com",          color: "text-emerald-400" },
];

export const SocialLinksSection = ({ value, onChange }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Social Links Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Social Links Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Social Links Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FIELDS.map(({ key, label, icon: Icon, placeholder, color }) => (
        <div key={key}>
          <Label className="flex items-center gap-1.5 text-xs">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            {label}
          </Label>
          <Input
            placeholder={placeholder}
            value={value[key] || ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
    </>
  );
};
