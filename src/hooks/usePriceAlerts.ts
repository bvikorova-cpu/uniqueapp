import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePriceAlerts = (productId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: alerts = [] } = useQuery({
    queryKey: ["price-alerts", productId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = supabase.from("product_price_alerts" as any).select("*").eq("user_id", user.id);
      if (productId) q = q.eq("product_id", productId);
      const { data } = await q.order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const createAlert = useMutation({
    mutationFn: async ({ productId, targetCents }: { productId: string; targetCents: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("product_price_alerts" as any).insert({
        user_id: user.id,
        product_id: productId,
        target_price_cents: targetCents,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts"] });
      toast({ title: "Price alert set" });
    },
  });

  const removeAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_price_alerts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["price-alerts"] }),
  });

  return { alerts, createAlert: createAlert.mutate, removeAlert: removeAlert.mutate };
};
