import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserXp = (userId: string | null) => {
  const [xp, setXp] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) { setXp(0); setLoading(false); return; }
    const { data } = await supabase.from("user_xp").select("total_xp").eq("user_id", userId).maybeSingle();
    setXp(data?.total_xp ?? 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Realtime subscription so any award reflects instantly
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`user_xp:${userId}:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_xp", filter: `user_id=eq.${userId}` },
        (payload: any) => setXp((payload.new?.total_xp ?? 0)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  return { xp, loading, refresh };
};
