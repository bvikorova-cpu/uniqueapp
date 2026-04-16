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

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [active]);

  const activeIndex = tabs.findIndex((t) => t.value === active);

  return (
    <div className="relative mb-8">
      {/* Broadcast-style header bar */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
          Channel · {String(activeIndex + 1).padStart(2, "0")}/{String(tabs.length).padStart(2, "0")}
        </span>
        <span className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-blue-400 font-bold">
          {tabs[activeIndex]?.label}
        </span>
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[hsl(220_55%_5%)] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[hsl(220_55%_5%)] to-transparent z-10" />

        <div
          ref={containerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-1"
        >
          <div className="inline-flex gap-1 min-w-max border-b border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.value === active;
              return (
                <button
                  key={tab.value}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onChange(tab.value)}
                  className={`group relative inline-flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all duration-300 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                  <span>{tab.label}</span>
                  {/* Active underline */}
                  {isActive && (
                    <>
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-blue-500 via-white to-blue-500" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full translate-y-1/2 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
