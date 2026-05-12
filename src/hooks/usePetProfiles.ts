import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PetProfile {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed?: string | null;
  age_years?: number | null;
  gender?: string | null;
  photo_url?: string | null;
  personality?: string | null;
  is_indoor?: boolean | null;
  is_active?: boolean | null;
}

const ACTIVE_KEY = "pet_active_profile_id";

export function usePetProfiles() {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(localStorage.getItem(ACTIVE_KEY));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("pet_profiles").select("*").order("created_at");
    const list = (data as PetProfile[]) || [];
    setPets(list);
    // Prefer DB-active pet over localStorage so selection syncs across devices
    const dbActive = list.find((p) => p.is_active);
    if (dbActive) {
      setActiveId(dbActive.id);
      localStorage.setItem(ACTIVE_KEY, dbActive.id);
    } else if (!list.find((p) => p.id === activeId) && list[0]) {
      setActiveId(list[0].id);
      localStorage.setItem(ACTIVE_KEY, list[0].id);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const setActive = useCallback(async (id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
    setActiveId(id);
    setPets((prev) => prev.map((p) => ({ ...p, is_active: p.id === id })));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Clear previous active, then set new (unique partial index enforces single active)
    await supabase.from("pet_profiles").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    if (id) await supabase.from("pet_profiles").update({ is_active: true }).eq("id", id);
  }, []);

  const active = pets.find((p) => p.id === activeId) || pets[0] || null;

  return { pets, active, activeId: active?.id ?? null, loading, reload: load, setActive };
}
