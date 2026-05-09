import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Tracks the current user's bazaar favorites and exposes toggle/check helpers.
 */
export const useBazaarFavorites = (userId: string | null) => {
  const { toast } = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("bazaar_favorites")
      .select("item_id")
      .eq("user_id", userId);
    setLoading(false);
    if (!error && data) setIds(new Set(data.map((r) => r.item_id as string)));
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const isFavorite = (itemId: string) => ids.has(itemId);

  const toggle = async (itemId: string) => {
    if (!userId) {
      toast({ title: "Login required", description: "Sign in to save favorites", variant: "destructive" });
      return;
    }
    const next = new Set(ids);
    if (next.has(itemId)) {
      next.delete(itemId);
      setIds(next);
      const { error } = await supabase
        .from("bazaar_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("item_id", itemId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); refresh(); }
    } else {
      next.add(itemId);
      setIds(next);
      const { error } = await supabase
        .from("bazaar_favorites")
        .insert({ user_id: userId, item_id: itemId });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); refresh(); }
      else toast({ title: "Saved", description: "Added to favorites" });
    }
  };

  return { ids, isFavorite, toggle, refresh, loading };
};
