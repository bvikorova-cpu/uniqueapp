import { useState, useEffect } from "react";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorTheme {
  name: string;
  primary: string;
  accent: string;
  ring: string;
  preview: [string, string]; // [primary hex, accent hex] for display
}

const themes: ColorTheme[] = [
  {
    name: "Purple & Pink",
    primary: "270 91% 58%",
    accent: "330 100% 60%",
    ring: "270 91% 58%",
    preview: ["#7c3aed", "#ff3399"],
  },
  {
    name: "Ocean",
    primary: "200 95% 48%",
    accent: "175 85% 45%",
    ring: "200 95% 48%",
    preview: ["#0891b2", "#14b8a6"],
  },
  {
    name: "Sunset",
    primary: "25 95% 55%",
    accent: "350 90% 55%",
    ring: "25 95% 55%",
    preview: ["#ea580c", "#e11d48"],
  },
  {
    name: "Forest",
    primary: "152 76% 36%",
    accent: "85 70% 45%",
    ring: "152 76% 36%",
    preview: ["#059669", "#65a30d"],
  },
  {
    name: "Midnight",
    primary: "230 80% 55%",
    accent: "260 75% 60%",
    ring: "230 80% 55%",
    preview: ["#3b5fe3", "#8b5cf6"],
  },
  {
    name: "Golden",
    primary: "42 100% 50%",
    accent: "25 100% 52%",
    ring: "42 100% 50%",
    preview: ["#eab308", "#ea580c"],
  },
  {
    name: "Cherry",
    primary: "350 85% 50%",
    accent: "330 80% 55%",
    ring: "350 85% 50%",
    preview: ["#dc2626", "#db2777"],
  },
  {
    name: "Arctic",
    primary: "210 100% 55%",
    accent: "195 95% 50%",
    ring: "210 100% 55%",
    preview: ["#2563eb", "#06b6d4"],
  },
  {
    name: "Neon",
    primary: "145 85% 50%",
    accent: "280 90% 60%",
    ring: "145 85% 50%",
    preview: ["#22c55e", "#a855f7"],
  },
  {
    name: "Lavender",
    primary: "280 60% 65%",
    accent: "320 70% 60%",
    ring: "280 60% 65%",
    preview: ["#a78bfa", "#e879a8"],
  },
  {
    name: "Emerald Gold",
    primary: "152 70% 40%",
    accent: "42 95% 55%",
    ring: "152 70% 40%",
    preview: ["#10b981", "#f59e0b"],
  },
  {
    name: "Rose Noir",
    primary: "340 75% 50%",
    accent: "260 30% 25%",
    ring: "340 75% 50%",
    preview: ["#e11d6b", "#3b2a55"],
  },
  {
    name: "Tropical",
    primary: "175 75% 42%",
    accent: "30 95% 55%",
    ring: "175 75% 42%",
    preview: ["#14b8a6", "#fb923c"],
  },
  {
    name: "Galaxy",
    primary: "260 80% 55%",
    accent: "190 90% 50%",
    ring: "260 80% 55%",
    preview: ["#7c3aed", "#06b6d4"],
  },
  {
    name: "Bubblegum",
    primary: "320 90% 65%",
    accent: "200 95% 65%",
    ring: "320 90% 65%",
    preview: ["#f472b6", "#38bdf8"],
  },
  {
    name: "Volcano",
    primary: "15 90% 50%",
    accent: "0 80% 35%",
    ring: "15 90% 50%",
    preview: ["#ea580c", "#991b1b"],
  },
  {
    name: "Mint Cream",
    primary: "160 70% 45%",
    accent: "180 60% 60%",
    ring: "160 70% 45%",
    preview: ["#22c79c", "#5eead4"],
  },
  {
    name: "Royal",
    primary: "245 75% 55%",
    accent: "42 95% 55%",
    ring: "245 75% 55%",
    preview: ["#4f46e5", "#f59e0b"],
  },
  {
    name: "Coral Reef",
    primary: "5 85% 60%",
    accent: "190 80% 50%",
    ring: "5 85% 60%",
    preview: ["#f87171", "#06b6d4"],
  },
  {
    name: "Mocha",
    primary: "25 45% 40%",
    accent: "35 65% 60%",
    ring: "25 45% 40%",
    preview: ["#92603a", "#d4a373"],
  },
  {
    name: "Aurora",
    primary: "165 80% 45%",
    accent: "290 75% 60%",
    ring: "165 80% 45%",
    preview: ["#14b890", "#c084fc"],
  },
  {
    name: "Fire Ice",
    primary: "10 90% 55%",
    accent: "210 95% 55%",
    ring: "10 90% 55%",
    preview: ["#f43f3f", "#3b82f6"],
  },
  {
    name: "Pastel Dream",
    primary: "260 70% 75%",
    accent: "180 60% 75%",
    ring: "260 70% 75%",
    preview: ["#c4b5fd", "#99f6e4"],
  },
  {
    name: "Mono Slate",
    primary: "215 25% 35%",
    accent: "215 15% 60%",
    ring: "215 25% 35%",
    preview: ["#475569", "#94a3b8"],
  },
];

export function ThemeColorSwitcher() {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("app-color-theme") || "Purple & Pink";
  });

  useEffect(() => {
    const saved = localStorage.getItem("app-color-theme");
    if (saved) {
      const theme = themes.find((t) => t.name === saved);
      if (theme) applyTheme(theme);
    }
  }, []);

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--ring", theme.ring);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--sidebar-primary", theme.primary);
    root.style.setProperty("--sidebar-ring", theme.ring);

    // Also adjust dark mode primary lightness
    const isDark = root.classList.contains("dark");
    if (isDark) {
      // Bump lightness slightly for dark mode
      const parts = theme.primary.split(" ");
      if (parts.length === 3) {
        const lightness = parseFloat(parts[2]);
        root.style.setProperty("--primary", `${parts[0]} ${parts[1]} ${Math.min(lightness + 7, 80)}%`);
      }
    }

    localStorage.setItem("app-color-theme", theme.name);
    setActiveTheme(theme.name);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <Paintbrush className="h-3.5 w-3.5" />
        Theme Colors
      </div>
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => applyTheme(theme)}
            className={cn(
              "relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-0",
              activeTheme === theme.name
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-muted/50"
            )}
            title={theme.name}
          >
            <div className="flex gap-0.5">
              <div
                className="h-4 w-4 rounded-full shadow-sm border border-border/30"
                style={{ background: theme.preview[0] }}
              />
              <div
                className="h-4 w-4 rounded-full shadow-sm border border-border/30"
                style={{ background: theme.preview[1] }}
              />
            </div>
            <span className="text-[8px] text-muted-foreground leading-tight text-center truncate w-full">
              {theme.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
