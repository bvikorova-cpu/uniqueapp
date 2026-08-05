import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomChatTheme {
  id: string;
  name: string;
  colors: string[];
  wallpaper?: string[];
  description?: string;
}

export const BUILTIN_THEMES = [
  { id: "midnight", name: "Midnight Ocean", colors: ["#0a1628", "#1a365d", "#2b6cb0"], price: 0 },
  { id: "sunset", name: "Sunset Glow", colors: ["#1a0a2e", "#7c3aed", "#f97316"], price: 0 },
  { id: "forest", name: "Enchanted Forest", colors: ["#0a1f0a", "#166534", "#22c55e"], price: 0 },
  { id: "neon", name: "Neon Cyberpunk", colors: ["#0f0f23", "#6366f1", "#ec4899"], price: 3 },
  { id: "aurora", name: "Aurora Borealis", colors: ["#041029", "#06b6d4", "#a855f7"], price: 3 },
  { id: "lava", name: "Volcanic Fire", colors: ["#1a0000", "#dc2626", "#f59e0b"], price: 5 },
  { id: "galaxy", name: "Deep Galaxy", colors: ["#0a0020", "#4c1d95", "#06b6d4"], price: 5 },
  { id: "ice", name: "Arctic Ice", colors: ["#e0f2fe", "#7dd3fc", "#0284c7"], price: 5 },
];

export const BUILTIN_WALLPAPERS = [
  { id: "abstract", name: "Abstract Waves", colors: ["#22d3ee", "#3b82f6", "#a855f7"], price: 0 },
  { id: "stars", name: "Starfield", colors: ["#312e81", "#4c1d95", "#1e3a8a"], price: 2 },
  { id: "bubbles", name: "Chat Bubbles", colors: ["#ec4899", "#f43f5e", "#f97316"], price: 2 },
  { id: "matrix", name: "Digital Rain", colors: ["#064e3b", "#065f46", "#0f766e"], price: 3 },
];

export interface ChatThemeState {
  themeId: string;
  wallpaperId: string;
  ownedThemes: string[];
  customThemes: CustomChatTheme[];
}

const DEFAULTS: ChatThemeState = {
  themeId: "midnight",
  wallpaperId: "abstract",
  ownedThemes: [],
  customThemes: [],
};

export const resolveTheme = (state: ChatThemeState) =>
  state.customThemes.find((t) => t.id === state.themeId) ||
  BUILTIN_THEMES.find((t) => t.id === state.themeId) ||
  BUILTIN_THEMES[0];

export const resolveWallpaperColors = (state: ChatThemeState): string[] => {
  const custom = state.customThemes.find((t) => t.id === state.wallpaperId);
  if (custom?.wallpaper?.length) return custom.wallpaper;
  return (BUILTIN_WALLPAPERS.find((w) => w.id === state.wallpaperId) || BUILTIN_WALLPAPERS[0]).colors;
};

export const chatBackgroundStyle = (state: ChatThemeState) => {
  const wp = resolveWallpaperColors(state);
  const theme = resolveTheme(state);
  return {
    backgroundImage: `linear-gradient(135deg, ${wp[0]}22 0%, ${wp[1]}18 50%, ${wp[2]}22 100%)`,
    borderColor: `${theme.colors[2]}33`,
  } as React.CSSProperties;
};

export const useChatTheme = (userId?: string) => {
  const [state, setState] = useState<ChatThemeState>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener("chat-theme-updated", onUpdate);
    return () => window.removeEventListener("chat-theme-updated", onUpdate);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messenger_chat_themes")
        .select("theme_id, wallpaper_id, owned_themes, custom_themes")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setState({
          themeId: data.theme_id || DEFAULTS.themeId,
          wallpaperId: data.wallpaper_id || DEFAULTS.wallpaperId,
          ownedThemes: (data.owned_themes as string[]) || [],
          customThemes: (data.custom_themes as unknown as CustomChatTheme[]) || [],
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  const save = useCallback(
    async (patch: Partial<ChatThemeState>) => {
      if (!userId) return;
      const next = { ...state, ...patch };
      setState(next);
      const { error } = await supabase.from("messenger_chat_themes").upsert(
        {
          user_id: userId,
          theme_id: next.themeId,
          wallpaper_id: next.wallpaperId,
          owned_themes: next.ownedThemes,
          custom_themes: next.customThemes as unknown as any,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
      window.dispatchEvent(new CustomEvent("chat-theme-updated"));
    },
    [state, userId],
  );

  return { state, setState, save, loading };
};
