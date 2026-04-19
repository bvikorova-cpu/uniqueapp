import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChatTheme = "midnight" | "rose" | "ocean" | "sunset";
export type Mood = "mysterious" | "playful" | "deep" | "flirty";

export interface MatchMeta {
  id: string;
  match_id: string;
  user_id: string;
  mood: Mood | null;
  theme: ChatTheme;
  streak_count: number;
  last_message_date: string | null;
}

export function useMatchMeta(matchId: string | null, currentUserId: string | null) {
  const [meta, setMeta] = useState<MatchMeta[]>([]);

  const fetchAll = useCallback(async () => {
    if (!matchId) return;
    const { data } = await supabase.from("anonymous_dating_match_meta").select("*").eq("match_id", matchId);
    setMeta((data as MatchMeta[]) ?? []);
  }, [matchId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ensure my row exists
  useEffect(() => {
    if (!matchId || !currentUserId) return;
    const mine = meta.find(m => m.user_id === currentUserId);
    if (!mine && meta.length >= 0) {
      supabase.from("anonymous_dating_match_meta")
        .insert({ match_id: matchId, user_id: currentUserId, theme: "midnight", streak_count: 0 })
        .select().single().then(({ data }) => {
          if (data) setMeta(prev => [...prev, data as MatchMeta]);
        });
    }
  }, [matchId, currentUserId, meta]);

  // realtime
  useEffect(() => {
    if (!matchId) return;
    const ch = supabase.channel(`match-meta:${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_dating_match_meta", filter: `match_id=eq.${matchId}` },
        () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [matchId, fetchAll]);

  const myMeta = meta.find(m => m.user_id === currentUserId) ?? null;
  const partnerMeta = meta.find(m => m.user_id !== currentUserId) ?? null;

  const setMood = async (mood: Mood) => {
    if (!matchId || !currentUserId) return;
    await supabase.from("anonymous_dating_match_meta")
      .update({ mood }).eq("match_id", matchId).eq("user_id", currentUserId);
  };

  const setTheme = async (theme: ChatTheme) => {
    if (!matchId || !currentUserId) return;
    await supabase.from("anonymous_dating_match_meta")
      .update({ theme }).eq("match_id", matchId).eq("user_id", currentUserId);
  };

  const bumpStreak = useCallback(async () => {
    if (!matchId || !currentUserId || !myMeta) return;
    const today = new Date().toISOString().slice(0, 10);
    if (myMeta.last_message_date === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = myMeta.last_message_date === yesterday ? myMeta.streak_count + 1 : 1;
    await supabase.from("anonymous_dating_match_meta")
      .update({ streak_count: newStreak, last_message_date: today })
      .eq("match_id", matchId).eq("user_id", currentUserId);
  }, [matchId, currentUserId, myMeta]);

  return { myMeta, partnerMeta, setMood, setTheme, bumpStreak };
}
