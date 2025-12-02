import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GIFT_CATALOG = [
  { type: "virtual_rose", emoji: "🌹", label: "Virtual Rose", value: 5, category: "flowers" },
  { type: "coffee", emoji: "☕", label: "Coffee", value: 6, category: "drinks" },
  { type: "chocolate", emoji: "🍫", label: "Chocolate", value: 8, category: "sweets" },
  { type: "teddy_bear", emoji: "🧸", label: "Teddy Bear", value: 12, category: "toys" },
  { type: "heart_balloon", emoji: "🎈", label: "Heart Balloon", value: 10, category: "romantic" },
  { type: "champagne", emoji: "🍾", label: "Champagne", value: 15, category: "drinks" },
  { type: "bouquet", emoji: "💐", label: "Flower Bouquet", value: 20, category: "flowers" },
  { type: "cake", emoji: "🎂", label: "Birthday Cake", value: 18, category: "sweets" },
  { type: "diamond_ring", emoji: "💍", label: "Diamond Ring", value: 50, category: "luxury" },
  { type: "crown", emoji: "👑", label: "Royal Crown", value: 75, category: "luxury" },
  { type: "sports_car", emoji: "🏎️", label: "Sports Car", value: 100, category: "luxury" },
  { type: "yacht", emoji: "🛥️", label: "Luxury Yacht", value: 150, category: "luxury" },
  { type: "castle", emoji: "🏰", label: "Dream Castle", value: 200, category: "luxury" },
  { type: "rocket", emoji: "🚀", label: "Space Rocket", value: 250, category: "special" },
  { type: "rainbow", emoji: "🌈", label: "Rainbow", value: 30, category: "special" },
  { type: "star", emoji: "⭐", label: "Shining Star", value: 25, category: "special" },
  { type: "fireworks", emoji: "🎆", label: "Fireworks", value: 35, category: "special" },
  { type: "magic_wand", emoji: "🪄", label: "Magic Wand", value: 40, category: "special" },
  { type: "unicorn", emoji: "🦄", label: "Unicorn", value: 60, category: "mythical" },
  { type: "dragon", emoji: "🐉", label: "Dragon", value: 80, category: "mythical" },
  { type: "phoenix", emoji: "🔥", label: "Phoenix", value: 120, category: "mythical" },
  { type: "treasure", emoji: "💎", label: "Treasure Chest", value: 90, category: "luxury" },
  { type: "heart", emoji: "❤️", label: "Heart", value: 3, category: "romantic" },
  { type: "kiss", emoji: "💋", label: "Kiss", value: 4, category: "romantic" },
];

export const CREDIT_PACKAGES = [
  { credits: 20, price: 5, label: "Starter Pack" },
  { credits: 50, price: 10, label: "Popular Pack", popular: true },
  { credits: 120, price: 20, label: "Value Pack" },
  { credits: 300, price: 40, label: "Premium Pack", bestValue: true },
];

export const useSecretSanta = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user credits
  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ["secret-santa-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("secret_santa_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Get received gifts
  const { data: receivedGifts = [], isLoading: giftsLoading } = useQuery({
    queryKey: ["secret-santa-received"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("secret_santa_gifts")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get sent gifts
  const { data: sentGifts = [], isLoading: sentLoading } = useQuery({
    queryKey: ["secret-santa-sent"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("secret_santa_gifts")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get active stories (non-expired)
  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["secret-santa-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_santa_stories")
        .select("*, secret_santa_gifts(*)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["secret-santa-leaderboard"],
    queryFn: async () => {
      // Get all gifts and aggregate by sender
      const { data: gifts, error } = await supabase
        .from("secret_santa_gifts")
        .select("sender_id, gift_value");

      if (error) throw error;

      // Aggregate by sender
      const senderTotals: Record<string, number> = {};
      gifts?.forEach(gift => {
        senderTotals[gift.sender_id] = (senderTotals[gift.sender_id] || 0) + gift.gift_value;
      });

      // Get profiles for top senders
      const topSenders = Object.entries(senderTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", topSenders.map(([id]) => id));

      return topSenders.map(([id, total], index) => {
        const profile = (profiles || []).find((p: any) => p.id === id) as any;
        return {
          rank: index + 1,
          userId: id,
          username: profile?.full_name || "Anonymous",
          avatarUrl: profile?.avatar_url,
          totalGiftsValue: total,
        };
      });
    },
  });

  // Send gift mutation
  const sendGift = useMutation({
    mutationFn: async ({
      recipientId,
      giftType,
      message,
      isAnonymous = true,
    }: {
      recipientId: string;
      giftType: string;
      message?: string;
      isAnonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const gift = GIFT_CATALOG.find(g => g.type === giftType);
      if (!gift) throw new Error("Invalid gift type");

      // Check credits
      const currentCredits = credits?.credits_remaining || 0;
      if (currentCredits < gift.value) {
        throw new Error("Not enough credits");
      }

      // Deduct credits
      const { error: creditError } = await supabase
        .from("secret_santa_credits")
        .update({ credits_remaining: currentCredits - gift.value })
        .eq("user_id", user.id);

      if (creditError) throw creditError;

      // Send gift
      const { error: giftError } = await supabase.from("secret_santa_gifts").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        gift_type: giftType,
        gift_emoji: gift.emoji,
        gift_value: gift.value,
        message,
        is_anonymous: isAnonymous,
      });

      if (giftError) throw giftError;
    },
    onSuccess: () => {
      toast({ title: "Gift sent successfully! 🎁" });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-sent"] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  // Share to stories mutation
  const shareToStory = useMutation({
    mutationFn: async (giftId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("secret_santa_stories").insert({
        gift_id: giftId,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Shared to Gift Stories! ✨" });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-stories"] });
    },
    onError: () => {
      toast({ title: "Failed to share", variant: "destructive" });
    },
  });

  return {
    credits: credits?.credits_remaining || 0,
    creditsLoading,
    receivedGifts,
    giftsLoading,
    sentGifts,
    sentLoading,
    stories,
    storiesLoading,
    leaderboard,
    leaderboardLoading,
    sendGift: sendGift.mutate,
    shareToStory: shareToStory.mutate,
    isSending: sendGift.isPending,
  };
};
