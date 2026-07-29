import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrandVoice } from "@/components/creative-forge/ForgeBrandVoice";

const STORAGE_KEY = "forge-active-brand-voice-id";

/**
 * Keeps the Co-Writer / generation brand voice selection alive across sessions.
 * The chosen voice id is persisted in localStorage and re-hydrated from the DB.
 * Falls back to the user's default voice when nothing was explicitly selected.
 */
export function useActiveBrandVoice() {
  const [activeVoice, setActiveVoice] = useState<BrandVoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const storedId = localStorage.getItem(STORAGE_KEY);
        const { data, error } = await supabase
          .from("creative_forge_brand_voices")
          .select("*")
          .eq("user_id", user.id);
        if (error || !data) return;

        const voices = data as unknown as BrandVoice[];
        const restored =
          (storedId ? voices.find((v) => v.id === storedId) : undefined) ??
          voices.find((v) => v.is_default) ??
          null;

        if (!cancelled) {
          setActiveVoice(restored);
          if (restored) localStorage.setItem(STORAGE_KEY, restored.id);
          else localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const selectVoice = useCallback((voice: BrandVoice | null) => {
    setActiveVoice(voice);
    if (voice) localStorage.setItem(STORAGE_KEY, voice.id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearVoice = useCallback(() => selectVoice(null), [selectVoice]);

  return { activeVoice, selectVoice, clearVoice, loading };
}
