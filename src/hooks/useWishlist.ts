import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useWishlist = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("product_wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const add = useMutation({
    mutationFn: async ({ productId, note }: { productId: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("product_wishlists").insert({
        user_id: user.id,
        product_id: productId,
        note,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "Added to wishlist" });
    },
  });

  const remove = useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("product_wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "Removed from wishlist" });
    },
  });

  const has = (productId: string) => items.some((i: any) => i.product_id === productId);

  return { items, isLoading, add: add.mutate, remove: remove.mutate, has };
};
