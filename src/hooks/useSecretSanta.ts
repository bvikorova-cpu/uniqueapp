import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GIFT_CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "messages", label: "Messages", emoji: "💌" },
  { id: "emotions", label: "Emotions", emoji: "🤗" },
  { id: "flowers", label: "Flowers", emoji: "🌹" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "sweets", label: "Sweets", emoji: "🍬" },
  { id: "drinks", label: "Drinks", emoji: "🍷" },
  { id: "awards", label: "Awards", emoji: "🏆" },
  { id: "luxury", label: "Luxury", emoji: "💎" },
  { id: "special", label: "Special", emoji: "🌟" },
  { id: "mythical", label: "Mythical", emoji: "🦄" },
  { id: "vip", label: "VIP", emoji: "👑" },
];

export const GIFT_CATALOG = [
  // Messages category (5-20 credits)
  { type: "compliment", emoji: "💬", label: "Compliment", value: 5, category: "messages", description: "Send a kind word" },
  { type: "thank_you", emoji: "🙏", label: "Thank You", value: 8, category: "messages", description: "Express gratitude" },
  { type: "encouragement", emoji: "💪", label: "Encouragement", value: 10, category: "messages", description: "Motivational boost" },
  { type: "apology", emoji: "😔", label: "Apology Card", value: 15, category: "messages", description: "Say sorry" },
  { type: "love_letter", emoji: "💌", label: "Love Letter", value: 25, category: "messages", description: "AI-written love note" },
  { type: "poem", emoji: "📜", label: "Custom Poem", value: 30, category: "messages", description: "AI-generated poem" },
  
  // Emotions category (5-20 credits)
  { type: "virtual_hug", emoji: "🤗", label: "Virtual Hug", value: 5, category: "emotions", description: "Warm embrace" },
  { type: "high_five", emoji: "✋", label: "High Five", value: 5, category: "emotions", description: "Celebrate together" },
  { type: "fist_bump", emoji: "🤜", label: "Fist Bump", value: 6, category: "emotions", description: "Casual greeting" },
  { type: "virtual_kiss", emoji: "😘", label: "Virtual Kiss", value: 8, category: "emotions", description: "Sweet kiss" },
  { type: "thumbs_up", emoji: "👍", label: "Thumbs Up", value: 4, category: "emotions", description: "Approval" },
  { type: "applause", emoji: "👏", label: "Standing Ovation", value: 12, category: "emotions", description: "Round of applause" },
  { type: "wave", emoji: "👋", label: "Friendly Wave", value: 3, category: "emotions", description: "Say hello" },
  { type: "wink", emoji: "😉", label: "Playful Wink", value: 6, category: "emotions", description: "Cheeky gesture" },
  
  // Flowers category (5-30 credits)
  { type: "virtual_rose", emoji: "🌹", label: "Red Rose", value: 8, category: "flowers", description: "Classic beauty" },
  { type: "white_rose", emoji: "🤍", label: "White Rose", value: 8, category: "flowers", description: "Pure elegance" },
  { type: "tulip", emoji: "🌷", label: "Tulip", value: 7, category: "flowers", description: "Spring bloom" },
  { type: "sunflower", emoji: "🌻", label: "Sunflower", value: 10, category: "flowers", description: "Bright happiness" },
  { type: "bouquet", emoji: "💐", label: "Flower Bouquet", value: 20, category: "flowers", description: "Mixed arrangement" },
  { type: "orchid", emoji: "🪻", label: "Orchid", value: 25, category: "flowers", description: "Exotic beauty" },
  { type: "cherry_blossom", emoji: "🌸", label: "Cherry Blossom", value: 15, category: "flowers", description: "Delicate petals" },
  { type: "hibiscus", emoji: "🌺", label: "Hibiscus", value: 12, category: "flowers", description: "Tropical flower" },
  
  // Romantic category (3-50 credits)
  { type: "heart", emoji: "❤️", label: "Heart", value: 3, category: "romantic", description: "Simple love" },
  { type: "kiss", emoji: "💋", label: "Kiss Mark", value: 5, category: "romantic", description: "Loving kiss" },
  { type: "heart_balloon", emoji: "🎈", label: "Heart Balloon", value: 10, category: "romantic", description: "Floating love" },
  { type: "love_birds", emoji: "🕊️", label: "Love Doves", value: 18, category: "romantic", description: "Pair of doves" },
  { type: "cupid", emoji: "💘", label: "Cupid's Arrow", value: 25, category: "romantic", description: "Strike of love" },
  { type: "engagement_ring", emoji: "💍", label: "Promise Ring", value: 50, category: "romantic", description: "Symbol of commitment" },
  { type: "love_potion", emoji: "🧪", label: "Love Potion", value: 35, category: "romantic", description: "Magical elixir" },
  
  // Sweets category (5-25 credits)
  { type: "chocolate", emoji: "🍫", label: "Chocolate Bar", value: 8, category: "sweets", description: "Sweet treat" },
  { type: "cake", emoji: "🎂", label: "Birthday Cake", value: 18, category: "sweets", description: "Celebration cake" },
  { type: "cupcake", emoji: "🧁", label: "Cupcake", value: 10, category: "sweets", description: "Mini delight" },
  { type: "ice_cream", emoji: "🍦", label: "Ice Cream", value: 8, category: "sweets", description: "Cool refreshment" },
  { type: "donut", emoji: "🍩", label: "Donut", value: 7, category: "sweets", description: "Glazed goodness" },
  { type: "cookie", emoji: "🍪", label: "Cookie", value: 5, category: "sweets", description: "Sweet bite" },
  { type: "lollipop", emoji: "🍭", label: "Lollipop", value: 6, category: "sweets", description: "Colorful candy" },
  { type: "candy_box", emoji: "🍬", label: "Candy Box", value: 15, category: "sweets", description: "Assorted sweets" },
  
  // Drinks category (6-20 credits)
  { type: "coffee", emoji: "☕", label: "Coffee", value: 6, category: "drinks", description: "Morning boost" },
  { type: "tea", emoji: "🍵", label: "Green Tea", value: 6, category: "drinks", description: "Calming brew" },
  { type: "champagne", emoji: "🍾", label: "Champagne", value: 15, category: "drinks", description: "Celebration bubbles" },
  { type: "wine", emoji: "🍷", label: "Red Wine", value: 12, category: "drinks", description: "Fine vintage" },
  { type: "cocktail", emoji: "🍸", label: "Cocktail", value: 10, category: "drinks", description: "Mixed drink" },
  { type: "beer", emoji: "🍺", label: "Beer", value: 8, category: "drinks", description: "Cheers!" },
  { type: "smoothie", emoji: "🥤", label: "Smoothie", value: 8, category: "drinks", description: "Healthy blend" },
  
  // Awards category (15-60 credits)
  { type: "trophy", emoji: "🏆", label: "Trophy", value: 25, category: "awards", description: "Winner award" },
  { type: "medal", emoji: "🥇", label: "Gold Medal", value: 20, category: "awards", description: "First place" },
  { type: "silver_medal", emoji: "🥈", label: "Silver Medal", value: 15, category: "awards", description: "Second place" },
  { type: "bronze_medal", emoji: "🥉", label: "Bronze Medal", value: 12, category: "awards", description: "Third place" },
  { type: "ribbon", emoji: "🎀", label: "Award Ribbon", value: 18, category: "awards", description: "Recognition" },
  { type: "certificate", emoji: "📜", label: "Certificate", value: 30, category: "awards", description: "Achievement unlocked" },
  { type: "best_friend", emoji: "🤝", label: "Best Friend Award", value: 40, category: "awards", description: "Friendship badge" },
  { type: "mvp", emoji: "⭐", label: "MVP Award", value: 50, category: "awards", description: "Most valuable person" },
  { type: "legend", emoji: "🌟", label: "Legend Status", value: 60, category: "awards", description: "Legendary achievement" },
  
  // Luxury category (50-300 credits)
  { type: "diamond", emoji: "💎", label: "Diamond", value: 50, category: "luxury", description: "Precious gem" },
  { type: "gold_bar", emoji: "🥇", label: "Gold Bar", value: 75, category: "luxury", description: "Pure gold" },
  { type: "sports_car", emoji: "🏎️", label: "Sports Car", value: 100, category: "luxury", description: "Speed machine" },
  { type: "yacht", emoji: "🛥️", label: "Luxury Yacht", value: 150, category: "luxury", description: "Sea elegance" },
  { type: "mansion", emoji: "🏛️", label: "Mansion", value: 200, category: "luxury", description: "Dream home" },
  { type: "castle", emoji: "🏰", label: "Dream Castle", value: 250, category: "luxury", description: "Royal residence" },
  { type: "private_jet", emoji: "✈️", label: "Private Jet", value: 300, category: "luxury", description: "Sky luxury" },
  { type: "treasure_chest", emoji: "🧳", label: "Treasure Chest", value: 120, category: "luxury", description: "Hidden riches" },
  
  // Special category (15-80 credits)
  { type: "star", emoji: "⭐", label: "Shining Star", value: 15, category: "special", description: "Bright light" },
  { type: "rainbow", emoji: "🌈", label: "Rainbow", value: 25, category: "special", description: "Colorful arc" },
  { type: "fireworks", emoji: "🎆", label: "Fireworks", value: 30, category: "special", description: "Night celebration" },
  { type: "magic_wand", emoji: "🪄", label: "Magic Wand", value: 35, category: "special", description: "Make a wish" },
  { type: "crystal_ball", emoji: "🔮", label: "Crystal Ball", value: 40, category: "special", description: "See the future" },
  { type: "shooting_star", emoji: "🌠", label: "Shooting Star", value: 45, category: "special", description: "Wish upon a star" },
  { type: "rocket", emoji: "🚀", label: "Space Rocket", value: 80, category: "special", description: "To the moon" },
  { type: "aurora", emoji: "🌌", label: "Aurora Borealis", value: 60, category: "special", description: "Northern lights" },
  
  // Mythical category (40-150 credits)
  { type: "unicorn", emoji: "🦄", label: "Unicorn", value: 60, category: "mythical", description: "Magical creature" },
  { type: "dragon", emoji: "🐉", label: "Dragon", value: 80, category: "mythical", description: "Fire breather" },
  { type: "phoenix", emoji: "🔥", label: "Phoenix", value: 120, category: "mythical", description: "Rise from ashes" },
  { type: "mermaid", emoji: "🧜‍♀️", label: "Mermaid", value: 70, category: "mythical", description: "Ocean beauty" },
  { type: "fairy", emoji: "🧚", label: "Fairy", value: 50, category: "mythical", description: "Magical sprite" },
  { type: "genie", emoji: "🧞", label: "Genie", value: 100, category: "mythical", description: "Three wishes" },
  { type: "pegasus", emoji: "🦢", label: "Pegasus", value: 90, category: "mythical", description: "Winged horse" },
  { type: "kraken", emoji: "🦑", label: "Kraken", value: 150, category: "mythical", description: "Sea monster" },
  
  // VIP category (50-200 credits)
  { type: "crown", emoji: "👑", label: "Royal Crown", value: 75, category: "vip", description: "24h profile crown" },
  { type: "super_like", emoji: "💫", label: "Super Like", value: 15, category: "vip", description: "Extra visibility" },
  { type: "priority_message", emoji: "📌", label: "Priority Message", value: 20, category: "vip", description: "Top of inbox" },
  { type: "spotlight", emoji: "🔦", label: "Spotlight", value: 50, category: "vip", description: "Featured profile" },
  { type: "vip_badge", emoji: "🏅", label: "VIP Badge", value: 100, category: "vip", description: "Elite status" },
  { type: "angel_wings", emoji: "😇", label: "Angel Wings", value: 80, category: "vip", description: "Heavenly glow" },
  { type: "king_status", emoji: "🤴", label: "King Status", value: 150, category: "vip", description: "Rule the platform" },
  { type: "queen_status", emoji: "👸", label: "Queen Status", value: 150, category: "vip", description: "Reign supreme" },
  { type: "diamond_tier", emoji: "💠", label: "Diamond Tier", value: 200, category: "vip", description: "Ultimate prestige" },
];

export const CREDIT_PACKAGES = [
  { credits: 30, price: 5, label: "Starter Pack" },
  { credits: 80, price: 12, label: "Popular Pack", popular: true },
  { credits: 200, price: 25, label: "Value Pack" },
  { credits: 500, price: 50, label: "Premium Pack", bestValue: true },
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
      const { data: giftData, error: giftError } = await supabase.from("secret_santa_gifts").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        gift_type: giftType,
        gift_emoji: gift.emoji,
        gift_value: gift.value,
        message,
        is_anonymous: isAnonymous,
      }).select().single();

      if (giftError) throw giftError;

      // Get sender profile for notification
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Create notification for recipient
      const senderName = isAnonymous ? "Secret Santa" : (senderProfile?.full_name || "Someone");
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "secret_santa_gift",
        title: `${gift.emoji} New Gift Received!`,
        message: `${senderName} sent you a ${gift.label}!`,
        related_id: giftData.id,
        actor_id: isAnonymous ? null : user.id,
      });
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
