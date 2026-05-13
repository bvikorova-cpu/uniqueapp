import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorTier {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  price: number;
  benefits: string[] | null;
  is_active: boolean;
  stripe_price_id: string | null;
  created_at: string;
}

export function useCreatorTiers(creatorId?: string) {
  const { user } = useAuth();
  const targetId = creatorId ?? user?.id;
  const [tiers, setTiers] = useState<CreatorTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("creator_subscription_tiers")
      .select("*")
      .eq("creator_id", targetId)
      .order("price", { ascending: true });
    setTiers((data as CreatorTier[]) ?? []);
    setLoading(false);
  }, [targetId]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const createTier = async (input: {
    name: string;
    description?: string;
    price: number;
    benefits?: string[];
  }) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("creator_subscription_tiers")
      .insert({
        creator_id: user.id,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        benefits: input.benefits ?? [],
        is_active: true,
      });
    if (!error) await fetchTiers();
    return error;
  };

  const toggleTier = async (id: string, active: boolean) => {
    await (supabase as any)
      .from("creator_subscription_tiers")
      .update({ is_active: active })
      .eq("id", id);
    await fetchTiers();
  };

  const subscribe = async (tierId: string) => {
    const { data, error } = await supabase.functions.invoke("subscribe-to-creator", {
      body: { tierId },
    });
    if (error) throw error;
    if (data?.url) window.location.href = data.url as string;
  };

  return { tiers, loading, createTier, toggleTier, subscribe, refetch: fetchTiers };
}
