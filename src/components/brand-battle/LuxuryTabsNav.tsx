import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface LuxuryTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  tabs: LuxuryTabItem[];
  active: string;
  onChange: (value: string) => void;
}

export const LuxuryTabsNav = ({ tabs, active, onChange }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Luxury Tabs Nav - How it works"} steps={[{ title: 'Open', desc: 'Access the Luxury Tabs Nav section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Luxury Tabs Nav.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      {/* Gold header bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500/40" />
        <span
          className="text-[11px] uppercase tracking-[0.3em] font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          ✦ Explore Sections ✦
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/40 to-amber-500/40" />
      </div>

      {/* Grid of luxury cards — visible side by side */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`group relative rounded-xl p-px transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_25px_-5px_hsl(45_85%_55%/.7)]"
                  : "bg-gradient-to-br from-amber-500/30 via-amber-600/15 to-transparent hover:from-amber-400/60 hover:via-amber-500/30"
              }`}
            >
              <div
                className={`rounded-[11px] px-3 py-3 sm:px-4 sm:py-4 flex flex-col items-center justify-center gap-1.5 transition-all min-h-[72px] ${
                  isActive
                    ? "bg-gradient-to-b from-zinc-900 to-zinc-950"
                    : "bg-card/80 backdrop-blur-xl group-hover:bg-zinc-900/80"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${
                    isActive
                      ? "text-amber-300 scale-110"
                      : "text-amber-500/70 group-hover:text-amber-400 group-hover:scale-105"
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] uppercase tracking-[0.1em] font-bold text-center leading-tight ${
                    isActive
                      ? "text-amber-200"
                      : "text-foreground/70 group-hover:text-amber-100"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
};
