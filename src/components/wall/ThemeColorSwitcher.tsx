import { useState, useEffect, useCallback } from "react";
import { Paintbrush, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const STORAGE_KEY = "app-color-theme";
const DEFAULT_THEME = "Purple & Pink";

const applyThemeVars = (theme: ColorTheme) => {
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--ring", theme.ring);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-ring", theme.ring);

  const isDark = root.classList.contains("dark");
  if (isDark) {
    const parts = theme.primary.split(" ");
    if (parts.length === 3) {
      const lightness = parseFloat(parts[2]);
      root.style.setProperty(
        "--primary",
        `${parts[0]} ${parts[1]} ${Math.min(lightness + 7, 80)}%`
      );
    }
  }
};

export function ThemeColorSwitcher() {
  const [savedTheme, setSavedTheme] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
  );
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  // Apply persisted theme on first mount
  useEffect(() => {
    const t = themes.find((t) => t.name === savedTheme);
    if (t) applyThemeVars(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewOnly = useCallback((theme: ColorTheme) => {
    applyThemeVars(theme);
    setPreviewTheme(theme.name);
  }, []);

  const savePreview = () => {
    if (!previewTheme) return;
    localStorage.setItem(STORAGE_KEY, previewTheme);
    setSavedTheme(previewTheme);
    setPreviewTheme(null);
    toast.success(`Theme "${previewTheme}" saved`);
  };

  const cancelPreview = () => {
    const t = themes.find((t) => t.name === savedTheme);
    if (t) applyThemeVars(t);
    setPreviewTheme(null);
  };

  const activeName = previewTheme ?? savedTheme;
  const activeTheme = themes.find((t) => t.name === activeName);
  const isPreviewing = previewTheme !== null && previewTheme !== savedTheme;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <Paintbrush className="h-3.5 w-3.5" />
        Theme Colors
        {isPreviewing && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-primary normal-case tracking-normal animate-pulse">
            <Eye className="h-3 w-3" /> Live preview
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 w-full">
        {themes.map((theme) => {
          const isActive = activeName === theme.name;
          const isSaved = savedTheme === theme.name;
          return (
            <button
              key={theme.name}
              onClick={() => previewOnly(theme)}
              className={cn(
                "relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-0",
                isActive
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:bg-muted/50"
              )}
              title={theme.name}
            >
              {isSaved && !isActive && (
                <Check className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-emerald-500" />
              )}
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
          );
        })}
      </div>

      {activeTheme && (
        <div
          className={cn(
            "rounded-xl border p-2 transition-colors",
            isPreviewing
              ? "border-primary/60 bg-primary/5"
              : "border-border/50 bg-muted/30"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div
                className="h-6 w-6 rounded-full ring-2 ring-background shadow"
                style={{ background: activeTheme.preview[0] }}
              />
              <div
                className="h-6 w-6 rounded-full -ml-2 ring-2 ring-background shadow"
                style={{ background: activeTheme.preview[1] }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{activeTheme.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {isPreviewing ? "Preview — not saved" : "Current theme"}
              </p>
            </div>
          </div>

          {/* Live preview chips */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary text-primary-foreground">
              Primary
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent text-accent-foreground">
              Accent
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-primary text-primary">
              Outline
            </span>
          </div>

          {isPreviewing && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={savePreview}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 flex-1 text-xs"
                onClick={cancelPreview}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
