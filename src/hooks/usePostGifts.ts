import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostGifts = (postId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ["post-gifts", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_gifts")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const sendGift = useMutation({
    mutationFn: async ({
      postId,
      giftType,
      message,
    }: {
      postId: string;
      giftType: string;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const giftValue = GIFT_VALUES[giftType as keyof typeof GIFT_VALUES] || 0;

      const { error } = await supabase.from("post_gifts").insert({
        post_id: postId,
        sender_id: user.id,
        gift_type: giftType,
        gift_value: giftValue,
        message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Gift sent!" });
      queryClient.invalidateQueries({ queryKey: ["post-gifts"] });
    },
    onError: () => {
      toast({ title: "Failed to send gift", variant: "destructive" });
    },
  });

  const totalValue = gifts.reduce((sum, gift) => sum + (gift.gift_value || 0), 0);

  return {
    gifts,
    isLoading,
    sendGift: sendGift.mutate,
    totalValue,
  };
};

export const GIFT_TYPES = [
  { type: "heart", emoji: "❤️", label: "Heart", value: 10 },
  { type: "star", emoji: "⭐", label: "Star", value: 25 },
  { type: "fire", emoji: "🔥", label: "Fire", value: 50 },
  { type: "trophy", emoji: "🏆", label: "Trophy", value: 100 },
  { type: "crown", emoji: "👑", label: "Crown", value: 250 },
  { type: "diamond", emoji: "💎", label: "Diamond", value: 500 },
];

const GIFT_VALUES: Record<string, number> = {
  heart: 10,
  star: 25,
  fire: 50,
  trophy: 100,
  crown: 250,
  diamond: 500,
};
