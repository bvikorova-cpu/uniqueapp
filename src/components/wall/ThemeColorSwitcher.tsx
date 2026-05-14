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
