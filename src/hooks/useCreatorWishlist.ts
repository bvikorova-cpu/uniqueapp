import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorWishlistItem {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  price_eur: number;
  is_funded: boolean;
  funded_by: string | null;
  created_at: string;
}

/** creator_wishlist_items.creator_id points at creator_profiles.id. */
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

export const useCreatorWishlist = (creatorUserId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["creator-wishlist", creatorUserId],
    enabled: !!creatorUserId,
    queryFn: async () => {
      const profileId = await resolveCreatorProfileId(creatorUserId!);
      if (!profileId) return [];
      const { data, error } = await (supabase as any)
        .from("creator_wishlist_items")
        .select("*")
        .eq("creator_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CreatorWishlistItem[];
    } });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["creator-wishlist", creatorUserId] });

  const addItem = useMutation({
    mutationFn: async (input: { title: string; price_eur: number; description?: string; image_url?: string; link_url?: string }) => {
      const profileId = await resolveCreatorProfileId(creatorUserId!, true);
      if (!profileId) throw new Error("Could not resolve creator profile");
      const { error } = await (supabase as any)
        .from("creator_wishlist_items")
        .insert({ creator_id: profileId, ...input });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Added to your wishlist" });
      invalidate();
    },
    onError: (e: any) => toast({ title: "Could not add item", description: e.message, variant: "destructive" }) });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await (supabase as any)
        .from("creator_wishlist_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Removed from wishlist" });
      invalidate();
    },
    onError: (e: any) => toast({ title: "Could not remove item", description: e.message, variant: "destructive" }) });

  /** Fan funds an item — redirects to Stripe Checkout (85/15 split). */
  const fundItem = async (itemId: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const { data, error } = await (supabase as any).functions.invoke("wishlist-checkout", {
        body: { itemId } });
      if (error) throw new Error(error.message || "Checkout failed");
      if (data?.error) throw new Error(data.error);
      if (data?.alreadyFunded) {
        toast({ title: "Already funded", description: "This item was already funded." });
        invalidate();
        return { ok: true };
      }
      if (data?.url) {
        window.location.href = data.url as string;
        return { ok: true };
      }
      return { ok: false, message: "No checkout URL returned" };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Checkout failed" };
    }
  };

  const isOwn = !!user && user.id === creatorUserId;
  const totalEur = items.reduce((s: number, i: CreatorWishlistItem) => s + Number(i.price_eur || 0), 0);

  return { items, isLoading, isOwn, totalEur, addItem: addItem.mutate, removeItem: removeItem.mutate, fundItem, refetch: invalidate };
};
