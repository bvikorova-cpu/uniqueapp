import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CHAT_WALLPAPERS,
  CHAT_WALLPAPER_MAP,
  DEFAULT_CHAT_WALLPAPER,
  type ChatWallpaper,
} from "@/data/chatWallpapers";

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

/** Full wallpaper catalog (60+ CSS templates incl. kids). */
export const BUILTIN_WALLPAPERS = CHAT_WALLPAPERS;

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

/** Resolve the active wallpaper from the catalog (undefined for AI custom ones). */
export const resolveWallpaper = (state: ChatThemeState): ChatWallpaper | undefined =>
  CHAT_WALLPAPER_MAP[state.wallpaperId];

export const resolveWallpaperColors = (state: ChatThemeState): string[] => {
  const custom = state.customThemes.find((t) => t.id === state.wallpaperId);
  if (custom?.wallpaper?.length) return custom.wallpaper;
  const wp = resolveWallpaper(state) || DEFAULT_CHAT_WALLPAPER;
  return [wp.accent, wp.accent, wp.accent];
};

export const chatBackgroundStyle = (state: ChatThemeState) => {
  const theme = resolveTheme(state);
  const custom = state.customThemes.find((t) => t.id === state.wallpaperId);
  if (custom?.wallpaper?.length) {
    const wp = custom.wallpaper;
    return {
      backgroundImage: `linear-gradient(135deg, ${wp[0]}66 0%, ${wp[1]}55 50%, ${wp[2]}66 100%)`,
      borderColor: `${theme.colors[2]}55`,
    } as React.CSSProperties;
  }
  const wallpaper = resolveWallpaper(state) || DEFAULT_CHAT_WALLPAPER;
  return {
    backgroundImage: wallpaper.background,
    backgroundColor: wallpaper.base,
    backgroundSize: wallpaper.size,
    backgroundPosition: wallpaper.position,
    borderColor: `${wallpaper.accent}55`,
  } as React.CSSProperties;
};

/** Preview style for a single catalog wallpaper (used in the picker grid). */
export const wallpaperPreviewStyle = (wp: ChatWallpaper) =>
  ({
    backgroundImage: wp.background,
    backgroundColor: wp.base,
    backgroundSize: wp.size,
    backgroundPosition: wp.position,
  }) as React.CSSProperties;

const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

/** Own (outgoing) message bubble painted with the active theme colors. */
export const outgoingBubbleStyle = (state: ChatThemeState) => {
  const t = resolveTheme(state);
  return {
    backgroundImage: `linear-gradient(135deg, ${t.colors[1]} 0%, ${t.colors[2]} 100%)`,
    color: isLight(t.colors[2]) ? "#111827" : "#ffffff",
    borderColor: `${t.colors[2]}66`,
  } as React.CSSProperties;
};

/** Incoming message bubble: subtle tint of the theme base color. */
export const incomingBubbleStyle = (state: ChatThemeState) => {
  const t = resolveTheme(state);
  return {
    backgroundColor: t.colors[0],
    color: isLight(t.colors[0]) ? "#111827" : "#ffffff",
    borderColor: `${t.colors[1]}99`,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.28)",
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

/**
 * Conversation-wide theme: the background/theme of whoever in the chat
 * changed it most recently is shown to every participant.
 */
export const useSharedChatTheme = (
  userId?: string,
  peerIds?: (string | null | undefined)[],
) => {
  const own = useChatTheme(userId);
  const [shared, setShared] = useState<ChatThemeState | null>(null);
  const [version, setVersion] = useState(0);
  const peersKey = (peerIds ?? []).filter(Boolean).sort().join(",");

  useEffect(() => {
    const onUpdate = () => setVersion((v) => v + 1);
    window.addEventListener("chat-theme-updated", onUpdate);
    return () => window.removeEventListener("chat-theme-updated", onUpdate);
  }, []);

  useEffect(() => {
    if (!userId || !peersKey) {
      setShared(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any).rpc("get_shared_chat_theme", {
        _peer_ids: peersKey.split(","),
      });
      if (cancelled || error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setShared(null);
        return;
      }
      setShared({
        themeId: row.theme_id || DEFAULTS.themeId,
        wallpaperId: row.wallpaper_id || DEFAULTS.wallpaperId,
        ownedThemes: [],
        customThemes: (row.custom_themes as unknown as CustomChatTheme[]) || [],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, peersKey, version]);

  return { ...own, state: shared ?? own.state, ownState: own.state };
};

/**
 * Platform-wide chat background: resolves the signed-in user's saved
 * wallpaper and returns a ready style object for any chat container.
 * Pass the other participants' ids to share the most recent choice.
 */
export const useChatBackground = (peerIds?: (string | null | undefined)[]) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { state, loading } = useChatTheme(userId);
  return { style: chatBackgroundStyle(state), state, loading };
};
