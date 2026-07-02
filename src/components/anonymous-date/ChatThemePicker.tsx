import { Palette, Check } from "lucide-react";
import type { ChatTheme } from "@/hooks/useMatchMeta";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const THEMES: Array<{ id: ChatTheme; label: string; gradient: string }> = [
  { id: "midnight", label: "Midnight", gradient: "from-slate-900 via-violet-900 to-primary" },
  { id: "rose", label: "Rose", gradient: "from-pink-600 via-rose-500 to-orange-400" },
  { id: "ocean", label: "Ocean", gradient: "from-cyan-600 via-blue-500 to-indigo-600" },
  { id: "sunset", label: "Sunset", gradient: "from-amber-500 via-orange-500 to-red-500" },
];

interface Props {
  current: ChatTheme;
  onChange: (theme: ChatTheme) => void;
}

export const ChatThemePicker = ({ current, onChange }: Props) => (
  <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40">
    <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
      <Palette className="h-3.5 w-3.5" /> Chat theme
    </p>
    <div className="grid grid-cols-4 gap-1.5">
      {THEMES.map(t => {
        const active = current === t.id;
        return (
    <>
      <FloatingHowItWorks title={"Chat Theme Picker - How it works"} steps={[{ title: 'Open', desc: 'Access the Chat Theme Picker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Chat Theme Picker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative h-12 rounded-xl bg-gradient-to-br ${t.gradient} border-2 transition-all ${
              active ? "border-white shadow-[0_0_18px_hsl(var(--primary)/0.6)] scale-105" : "border-transparent hover:scale-105"
            }`}
          >
            {active && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow-lg" />
              </span>
            )}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-muted-foreground">
              {t.label}
            </span>
          </button>
    </>
  );
      })}
    </div>
    <div className="h-3" />
  </div>
);

export const themeGradient = (theme: ChatTheme): string => {
  const map: Record<ChatTheme, string> = {
    midnight: "from-slate-900 via-violet-900 to-primary",
    rose: "from-pink-600 via-rose-500 to-orange-400",
    ocean: "from-cyan-600 via-blue-500 to-indigo-600",
    sunset: "from-amber-500 via-orange-500 to-red-500",
  };
  return map[theme] ?? map.midnight;
};
