import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GamePlayMeta {
  id: string;
  title?: string;
  category?: string;
}

/**
 * Games Hub DB hook: favorites + play tracking.
 * Silent no-op for anonymous users — UI stays usable, only persistence is skipped.
 */
export function useGamesHub() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const [favRes, playRes] = await Promise.all([
        supabase.from("games_favorites").select("game_id").eq("user_id", uid),
        supabase
          .from("games_plays")
          .select("game_id, played_at")
          .eq("user_id", uid)
          .order("played_at", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;
      setFavorites(new Set((favRes.data ?? []).map((r: any) => r.game_id)));
      const seen = new Set<string>();
      const recentList: string[] = [];
      for (const row of playRes.data ?? []) {
        if (!seen.has((row as any).game_id)) {
          seen.add((row as any).game_id);
          recentList.push((row as any).game_id);
        }
      }
      setRecent(recentList);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback(
    async (game: GamePlayMeta) => {
      if (!userId) {
        toast({ title: "Sign in required", description: "Log in to save favorites." });
        return;
      }
      const has = favorites.has(game.id);
      const next = new Set(favorites);
      if (has) next.delete(game.id);
      else next.add(game.id);
      setFavorites(next);
      if (has) {
        const { error } = await supabase
          .from("games_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("game_id", game.id);
        if (error) {
          setFavorites(favorites);
          toast({ title: "Could not remove favorite", variant: "destructive" });
        }
      } else {
        const { error } = await supabase
          .from("games_favorites")
          .insert({ user_id: userId, game_id: game.id });
        if (error) {
          setFavorites(favorites);
          toast({ title: "Could not save favorite", variant: "destructive" });
        }
      }
    },
    [userId, favorites, toast]
  );

  const trackPlay = useCallback(
    async (game: GamePlayMeta) => {
      setRecent((prev) => [game.id, ...prev.filter((g) => g !== game.id)].slice(0, 20));
      if (!userId) return;
      await supabase.from("games_plays").insert({
        user_id: userId,
        game_id: game.id,
        game_title: game.title ?? null,
        game_category: game.category ?? null,
      });
    },
    [userId]
  );

  return { userId, favorites, recent, isFavorite, toggleFavorite, trackPlay, loading };
}
