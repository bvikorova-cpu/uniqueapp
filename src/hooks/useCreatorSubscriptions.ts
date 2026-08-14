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

/** creator_subscription_tiers.creator_id points at creator_profiles.id, not auth user id. */
async function resolveCreatorProfileId(userId: string, create = false): Promise<string | null> {
  const { data } = await (supabase as any)
    .from("creator_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.id) return data.id as string;
  if (!create) return null;

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("display_name, username")
    .eq("id", userId)
    .maybeSingle();

  const { data: created } = await (supabase as any)
    .from("creator_profiles")
    .insert({ user_id: userId, display_name: profile?.display_name || profile?.username || "Creator" })
    .select("id")
    .maybeSingle();
  return (created?.id as string) ?? null;
}

export function useCreatorTiers(creatorId?: string) {
  const { user } = useAuth();
  const targetUserId = creatorId ?? user?.id;
  const [tiers, setTiers] = useState<CreatorTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    const profileId = await resolveCreatorProfileId(targetUserId);
    if (!profileId) {
      setTiers([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from("creator_subscription_tiers")
      .select("*")
      .eq("creator_id", profileId)
      .order("price", { ascending: true });
    setTiers((data as CreatorTier[]) ?? []);
    setLoading(false);
  }, [targetUserId]);

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
    const profileId = await resolveCreatorProfileId(user.id, true);
    if (!profileId) return { message: "Could not create your creator profile." } as any;
    const { error } = await (supabase as any)
      .from("creator_subscription_tiers")
      .insert({
        creator_id: profileId,
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
      body: { tierId } });
    if (error) throw error;
    if (data?.url) window.location.href = data.url as string;
  };

  return { tiers, loading, createTier, toggleTier, subscribe, refetch: fetchTiers };
}
