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
}

const ACTIVE_KEY = "pet_active_profile_id";

export function usePetProfiles() {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(localStorage.getItem(ACTIVE_KEY));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("pet_profiles").select("*").order("created_at");
    setPets((data as PetProfile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setActive = (id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
    setActiveId(id);
  };

  const active = pets.find((p) => p.id === activeId) || pets[0] || null;

  return { pets, active, activeId: active?.id ?? null, loading, reload: load, setActive };
}
