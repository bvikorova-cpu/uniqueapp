import { Eye, Globe, Lock, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export type Visibility = "public" | "friends" | "private";
export type ProfileTheme = "default" | "cinematic" | "minimal" | "neon" | "editorial";

export interface FieldVisibility {
  email?: Visibility;
  phone?: Visibility;
  location?: Visibility;
  birth_date?: Visibility;
  socials?: Visibility;
}

interface Props {
  visibility: FieldVisibility;
  onVisibilityChange: (v: FieldVisibility) => void;
  accentColor: string;
  onAccentChange: (hex: string) => void;
  theme: ProfileTheme;
  onThemeChange: (t: ProfileTheme) => void;
}

const ACCENTS = [
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#a855f7", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#ef4444", name: "Crimson" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#f5f5f5", name: "Pearl" },
];

const THEMES: { id: ProfileTheme; label: string; desc: string }[] = [
  { id: "default", label: "Default", desc: "Balanced glass" },
  { id: "cinematic", label: "Cinematic", desc: "Dark + filmic" },
  { id: "minimal", label: "Minimal", desc: "Clean & airy" },
  { id: "neon", label: "Neon", desc: "Bold glow" },
  { id: "editorial", label: "Editorial", desc: "Magazine style" },
];

const FIELDS: { key: keyof FieldVisibility; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "birth_date", label: "Birth date" },
  { key: "socials", label: "Social links" },
];

const VIS_OPTIONS: { v: Visibility; label: string; icon: React.ElementType }[] = [
  { v: "public", label: "Public", icon: Globe },
  { v: "friends", label: "Friends only", icon: Users },
  { v: "private", label: "Private", icon: Lock },
];

export const PrivacyAndStyle = ({
  visibility, onVisibilityChange, accentColor, onAccentChange, theme, onThemeChange,
}: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Privacy And Style - How it works"} steps={[{ title: 'Open', desc: 'Access the Privacy And Style section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Privacy And Style.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Privacy */}
      <div>
        <Label className="flex items-center gap-1.5 mb-3 text-sm font-bold">
          <Eye className="h-4 w-4 text-amber-400" />
          Field Privacy
        </Label>
        <div className="space-y-2">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-sm">{label}</span>
              <Select
                value={visibility[key] || "public"}
                onValueChange={(v) => onVisibilityChange({ ...visibility, [key]: v as Visibility })}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIS_OPTIONS.map(({ v, label: l, icon: I }) => (
                    <SelectItem key={v} value={v}>
                      <span className="flex items-center gap-1.5">
                        <I className="h-3 w-3" />
                        {l}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div>
        <Label className="mb-3 block text-sm font-bold">Accent Color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map(({ hex, name }) => (
            <button
              key={hex}
              type="button"
              onClick={() => onAccentChange(hex)}
              title={name}
              className={`h-9 w-9 rounded-xl transition-all ${
                accentColor === hex ? "ring-2 ring-foreground scale-110 shadow-lg" : "ring-1 ring-border/40 hover:scale-105"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <Label className="mb-3 block text-sm font-bold">Profile Theme</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {THEMES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onThemeChange(id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                theme === id
                  ? "bg-amber-500/15 border-amber-400/60 shadow-md shadow-amber-500/10"
                  : "bg-muted/20 border-border/40 hover:border-amber-400/30"
              }`}
            >
              <p className="text-sm font-bold">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
