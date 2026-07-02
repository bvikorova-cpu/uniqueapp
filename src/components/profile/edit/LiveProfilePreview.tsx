import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Briefcase, Globe } from "lucide-react";
import { Skill } from "./SkillsEditor";
import { SocialLinks } from "./SocialLinksSection";
import { ProfileTheme } from "./PrivacyAndStyle";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  occupation: string;
  company: string;
  location: string;
  interests: string[];
  skills: Skill[];
  languages: string[];
  socialLinks: SocialLinks;
  accentColor: string;
  theme: ProfileTheme;
  verifiedCount: number;
  voiceIntroUrl: string | null;
}

const themeBg: Record<ProfileTheme, string> = {
  default: "bg-gradient-to-br from-card/80 to-card/40",
  cinematic: "bg-gradient-to-br from-zinc-950 to-black",
  minimal: "bg-card",
  neon: "bg-gradient-to-br from-fuchsia-950/60 via-violet-950/40 to-cyan-950/60",
  editorial: "bg-stone-50/5 border-stone-200/10",
};

export const LiveProfilePreview = (props: Props) => {
  const {
    fullName, headline, bio, avatarUrl, coverUrl, occupation, company, location,
    interests, skills, languages, socialLinks, accentColor, theme, verifiedCount, voiceIntroUrl,
  } = props;

  const accent = accentColor || "#f59e0b";

  return (
    <>
      <FloatingHowItWorks title={"Live Profile Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Profile Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Profile Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className={`rounded-2xl border border-border/50 overflow-hidden ${themeBg[theme]} backdrop-blur-xl shadow-2xl`}>
      {/* sticky preview chip */}
      <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between text-xs">
        <span className="font-bold text-muted-foreground uppercase tracking-wider">Live Preview</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${accent}25`, color: accent, border: `1px solid ${accent}50` }}>
          {theme}
        </span>
      </div>

      {/* cover */}
      <div
        className="h-28 relative"
        style={{
          backgroundImage: coverUrl
            ? `url(${coverUrl})`
            : `linear-gradient(135deg, ${accent}55, ${accent}11)`,
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      >
        <div className="absolute -bottom-10 left-4">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">{fullName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            {verifiedCount >= 2 && (
              <div
                className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-sky-500 flex items-center justify-center ring-2 ring-background"
                title={`${verifiedCount} verifications`}
              >
                <BadgeCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-12 pb-4 space-y-3">
        <div>
          <h3 className="text-lg font-black leading-tight">{fullName || "Your Name"}</h3>
          {headline && <p className="text-xs italic text-muted-foreground">"{headline}"</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
            {occupation && (<span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {occupation}{company && ` @ ${company}`}</span>)}
            {location && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>)}
          </div>
        </div>

        {voiceIntroUrl && (
          <audio controls src={voiceIntroUrl} className="w-full h-8" />
        )}

        {bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{bio}</p>}

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {interests.slice(0, 8).map((i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>{i}</span>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Top skills</p>
            {skills.slice(0, 3).map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="truncate">{s.name}</span>
                <span className="text-muted-foreground">{"★".repeat(s.level)}{"☆".repeat(5 - s.level)}</span>
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
            <Globe className="h-3 w-3" /> {languages.join(" · ")}
          </div>
        )}

        {Object.entries(socialLinks).filter(([, v]) => !!v).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
            {Object.entries(socialLinks).filter(([, v]) => !!v).slice(0, 6).map(([k]) => (
              <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-border/40 capitalize">{k}</span>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
