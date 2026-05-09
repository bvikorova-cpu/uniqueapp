import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SavedSearch {
  id: string;
  name: string;
  params: Record<string, any>;
  created_at: string;
}

export function useCouponSavedSearches(userId: string | null) {
  const { toast } = useToast();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) { setSearches([]); return; }
    const { data } = await supabase.from("coupon_saved_searches" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setSearches(((data as any) || []) as any);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (name: string, params: Record<string, any>) => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.from("coupon_saved_searches" as any).insert({ user_id: userId, name, params });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Search saved", description: name });
    refresh();
  }, [userId, toast, refresh]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("coupon_saved_searches" as any).delete().eq("id", id);
    setSearches(prev => prev.filter(s => s.id !== id));
  }, []);

  return { searches, save, remove, refresh };
}
