import { LucideIcon } from "lucide-react";
import { useRef, useEffect } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [active]);

  return (
    <div className="relative mb-8">
      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <div className="inline-flex gap-2 py-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.value === active;
            return (
              <button
                key={tab.value}
                ref={isActive ? activeRef : undefined}
                onClick={() => onChange(tab.value)}
                className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-xs sm:text-sm font-medium ${
                  isActive
                    ? "bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 text-zinc-950 shadow-[0_0_30px_-5px_hsl(45_85%_55%/.6),inset_0_1px_0_hsl(45_100%_85%)] border border-amber-200/50"
                    : "bg-zinc-950/60 text-amber-100/60 border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-200 hover:bg-zinc-900/80 backdrop-blur"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "" : "text-amber-400/70 group-hover:text-amber-300"}`} />
                <span className="tracking-wide">{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_hsl(45_95%_55%)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
