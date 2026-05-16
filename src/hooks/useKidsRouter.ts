import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function kidsCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("kids-router", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export type KidsChild = {
  id: string; parent_id: string; name: string; age: number; avatar: string; pet: string; preferences: any;
};

export function useKidsChildren() {
  const [children, setChildren] = useState<KidsChild[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem("kids_active_child"));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { children } = await kidsCall<{ children: KidsChild[] }>("children.list");
      setChildren(children);
      if (children.length > 0 && (!activeId || !children.find(c => c.id === activeId))) {
        setActiveId(children[0].id);
        localStorage.setItem("kids_active_child", children[0].id);
      }
    } catch (_) { /* not signed in */ }
    setLoading(false);
  }, [activeId]);

  useEffect(() => { refresh(); }, [refresh]);

  const setActive = (id: string) => {
    setActiveId(id);
    localStorage.setItem("kids_active_child", id);
  };

  return { children, activeId, activeChild: children.find(c => c.id === activeId) || null, setActive, refresh, loading };
}
