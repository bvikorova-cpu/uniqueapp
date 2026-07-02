import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSecretSanta, GIFT_CATALOG } from "@/hooks/useSecretSanta";
import { GiftConfetti } from "./GiftConfetti";
import { Gift, Sparkles, Search, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MYSTERY_BOX_TIERS = [
  // Basic tier (15-50)
  { id: "bronze", name: "Bronze Box", emoji: "🎁", cost: 15, minValue: 5, maxValue: 20, color: "from-amber-600 to-orange-700", description: "Gifts worth 5-20 credits" },
  { id: "copper", name: "Copper Box", emoji: "🧡", cost: 20, minValue: 8, maxValue: 25, color: "from-orange-500 to-amber-600", description: "Gifts worth 8-25 credits" },
  { id: "silver", name: "Silver Box", emoji: "🎀", cost: 35, minValue: 15, maxValue: 50, color: "from-gray-400 to-gray-600", description: "Gifts worth 15-50 credits" },
  { id: "steel", name: "Steel Box", emoji: "🔩", cost: 45, minValue: 20, maxValue: 60, color: "from-slate-400 to-slate-600", description: "Gifts worth 20-60 credits" },
  { id: "gold", name: "Gold Box", emoji: "✨", cost: 75, minValue: 40, maxValue: 100, color: "from-yellow-400 to-amber-500", description: "Gifts worth 40-100 credits" },
  
  // Premium tier (80-200)
  { id: "platinum", name: "Platinum Box", emoji: "🌟", cost: 100, minValue: 50, maxValue: 150, color: "from-gray-300 to-gray-500", description: "Gifts worth 50-150 credits" },
  { id: "emerald", name: "Emerald Box", emoji: "💚", cost: 120, minValue: 60, maxValue: 180, color: "from-emerald-400 to-green-600", description: "Gifts worth 60-180 credits" },
  { id: "sapphire", name: "Sapphire Box", emoji: "💙", cost: 140, minValue: 70, maxValue: 200, color: "from-blue-400 to-indigo-600", description: "Gifts worth 70-200 credits" },
  { id: "diamond", name: "Diamond Box", emoji: "💎", cost: 150, minValue: 80, maxValue: 300, color: "from-cyan-400 to-blue-600", description: "Gifts worth 80-300 credits" },
  { id: "ruby", name: "Ruby Box", emoji: "❤️", cost: 175, minValue: 90, maxValue: 250, color: "from-red-500 to-rose-700", description: "Gifts worth 90-250 credits" },
  
  // Elite tier (200-400)
  { id: "amethyst", name: "Amethyst Box", emoji: "💜", cost: 200, minValue: 100, maxValue: 300, color: "from-purple-500 to-violet-700", description: "Gifts worth 100-300 credits" },
  { id: "obsidian", name: "Obsidian Box", emoji: "🖤", cost: 225, minValue: 120, maxValue: 350, color: "from-gray-800 to-black", description: "Gifts worth 120-350 credits" },
  { id: "opal", name: "Opal Box", emoji: "🤍", cost: 250, minValue: 130, maxValue: 400, color: "from-pink-300 via-blue-300 to-green-300", description: "Gifts worth 130-400 credits" },
  { id: "crystal", name: "Crystal Box", emoji: "🔮", cost: 275, minValue: 150, maxValue: 450, color: "from-violet-400 to-purple-600", description: "Gifts worth 150-450 credits" },
  { id: "titanium", name: "Titanium Box", emoji: "⚙️", cost: 300, minValue: 160, maxValue: 500, color: "from-zinc-400 to-zinc-700", description: "Gifts worth 160-500 credits" },
  
  // Legendary tier (350-600)
  { id: "phoenix", name: "Phoenix Box", emoji: "🔥", cost: 350, minValue: 200, maxValue: 550, color: "from-orange-500 to-red-600", description: "Gifts worth 200-550 credits" },
  { id: "dragon", name: "Dragon Box", emoji: "🐉", cost: 400, minValue: 220, maxValue: 600, color: "from-green-600 to-emerald-800", description: "Gifts worth 220-600 credits" },
  { id: "unicorn", name: "Unicorn Box", emoji: "🦄", cost: 450, minValue: 250, maxValue: 650, color: "from-pink-400 via-purple-400 to-blue-400", description: "Gifts worth 250-650 credits" },
  { id: "cosmic", name: "Cosmic Box", emoji: "🌌", cost: 500, minValue: 280, maxValue: 700, color: "from-indigo-600 to-purple-900", description: "Gifts worth 280-700 credits" },
  { id: "aurora", name: "Aurora Box", emoji: "🌈", cost: 550, minValue: 300, maxValue: 750, color: "from-green-400 via-blue-500 to-purple-600", description: "Gifts worth 300-750 credits" },
  
  // Mythical tier (600-900)
  { id: "celestial", name: "Celestial Box", emoji: "⭐", cost: 600, minValue: 350, maxValue: 800, color: "from-yellow-300 to-orange-400", description: "Gifts worth 350-800 credits" },
  { id: "supernova", name: "Supernova Box", emoji: "💥", cost: 650, minValue: 380, maxValue: 850, color: "from-red-500 via-orange-400 to-yellow-300", description: "Gifts worth 380-850 credits" },
  { id: "nebula", name: "Nebula Box", emoji: "🌀", cost: 700, minValue: 400, maxValue: 900, color: "from-purple-600 via-pink-500 to-red-500", description: "Gifts worth 400-900 credits" },
  { id: "galaxy", name: "Galaxy Box", emoji: "🌠", cost: 750, minValue: 450, maxValue: 950, color: "from-blue-900 via-purple-800 to-pink-700", description: "Gifts worth 450-950 credits" },
  { id: "infinity", name: "Infinity Box", emoji: "♾️", cost: 800, minValue: 500, maxValue: 1000, color: "from-violet-600 to-fuchsia-600", description: "Gifts worth 500-1000 credits" },
  
  // Divine tier (900-1500)
  { id: "divine", name: "Divine Box", emoji: "👼", cost: 900, minValue: 550, maxValue: 1200, color: "from-amber-200 to-yellow-400", description: "Gifts worth 550-1200 credits" },
  { id: "eternal", name: "Eternal Box", emoji: "🕊️", cost: 1000, minValue: 600, maxValue: 1500, color: "from-sky-300 to-blue-500", description: "Gifts worth 600-1500 credits" },
  { id: "godlike", name: "Godlike Box", emoji: "⚡", cost: 1200, minValue: 700, maxValue: 1800, color: "from-yellow-400 via-amber-500 to-orange-600", description: "Gifts worth 700-1800 credits" },
  { id: "supreme", name: "Supreme Box", emoji: "👑", cost: 1500, minValue: 800, maxValue: 2000, color: "from-amber-400 via-yellow-300 to-amber-500", description: "Gifts worth 800-2000 credits" },
  { id: "omnipotent", name: "Omnipotent Box", emoji: "🔱", cost: 2000, minValue: 1000, maxValue: 2500, color: "from-purple-700 via-indigo-600 to-blue-700", description: "Gifts worth 1000-2500 credits" },
];

export const MysteryBox = () => {
  const { credits } = useSecretSanta();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedGift, setRevealedGift] = useState<{ emoji: string; label: string; value: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Search users
  const { data: users = [] } = useQuery({
    queryKey: ["search-users-mystery", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return (data || []).map((u: any) => ({ id: u.id, username: u.full_name || "User", avatar_url: u.avatar_url }));
    },
    enabled: searchQuery.length >= 2,
  });

  const selectedUserData = users.find(u => u.id === selectedRecipient);
  const selectedTierData = MYSTERY_BOX_TIERS.find(t => t.id === selectedTier);

  // Send mystery box mutation
  const sendMysteryBox = useMutation({
    mutationFn: async () => {
      if (!selectedTier || !selectedRecipient || !selectedTierData) {
        throw new Error("Please select a box and recipient");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (credits < selectedTierData.cost) {
        throw new Error("Not enough credits");
      }

      // Get random gift within the tier's value range
      const eligibleGifts = GIFT_CATALOG.filter(
        g => g.value >= selectedTierData.minValue && g.value <= selectedTierData.maxValue
      );
      
      if (eligibleGifts.length === 0) {
        throw new Error("No eligible gifts found");
      }

      const randomGift = eligibleGifts[Math.floor(Math.random() * eligibleGifts.length)];

      // Deduct credits
      const { error: creditError } = await supabase
        .from("secret_santa_credits")
        .update({ credits_remaining: credits - selectedTierData.cost })
        .eq("user_id", user.id);

      if (creditError) throw creditError;

      // Record mystery box
      const { error: boxError } = await supabase
        .from("social_gifts_mystery_boxes")
        .insert({
          user_id: user.id,
          recipient_id: selectedRecipient,
          box_tier: selectedTier,
          cost: selectedTierData.cost,
          revealed_gift_type: randomGift.type,
          revealed_gift_value: randomGift.value,
          message: message || null,
          is_anonymous: isAnonymous,
        });

      if (boxError) throw boxError;

      // Send the actual gift
      const { error: giftError } = await supabase
        .from("secret_santa_gifts")
        .insert({
          sender_id: user.id,
          recipient_id: selectedRecipient,
          gift_type: randomGift.type,
          gift_emoji: randomGift.emoji,
          gift_value: randomGift.value,
          message: `🎲 Mystery Box ${selectedTierData.name}! ${message || ""}`.trim(),
          is_anonymous: isAnonymous,
          animation_type: "mystery",
        });

      if (giftError) throw giftError;

      return randomGift;
    },
    onSuccess: (gift) => {
      setRevealedGift({ emoji: gift.emoji, label: gift.label, value: gift.value });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-sent"] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSend = () => {
    sendMysteryBox.mutate();
  };

  const closeReveal = () => {
    setRevealedGift(null);
    setSelectedTier(null);
    setSelectedRecipient(null);
    setMessage("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <GiftConfetti trigger={showConfetti} type="mystery" />

      {/* Mystery box reveal modal */}
      <AnimatePresence>
        {revealedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReveal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-center p-8"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[120px] drop-shadow-2xl"
              >
                {revealedGift.emoji}
              </motion.div>
              <h2 className="text-white text-3xl font-bold mt-4">{revealedGift.label}</h2>
              <p className="text-amber-400 text-xl mt-2">Worth 💎 {revealedGift.value} credits!</p>
              <p className="text-white/60 mt-6">Tap to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-2xl p-6 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-4xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mystery Box</h2>
        <p className="text-gray-500">
          Send a random gift! The recipient won't know what it is until they open it!
        </p>
      </div>

      {/* Search recipient */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-500" />
          Choose Recipient
        </h3>
        
        <Input
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white border-purple-200 text-gray-800 placeholder:text-gray-400"
        />

        {users.length > 0 && (
          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedRecipient(user.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedRecipient === user.id
                    ? "bg-purple-100 border border-purple-400"
                    : "bg-gray-50 hover:bg-purple-50"
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-800 font-medium">{user.username}</span>
              </div>
            ))}
          </div>
        )}

        {selectedUserData && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-purple-100 border border-purple-400">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUserData.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                {selectedUserData.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-800 font-medium">Sending to: {selectedUserData.username}</span>
          </div>
        )}
      </div>

      {/* Box tiers */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" />
          Choose Mystery Box
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {MYSTERY_BOX_TIERS.map((tier) => {
            const canAfford = credits >= tier.cost;
            const isSelected = selectedTier === tier.id;

            return (
              <motion.div
                key={tier.id}
                whileHover={{ scale: canAfford ? 1.02 : 1 }}
                onClick={() => canAfford && setSelectedTier(tier.id)}
                className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${tier.color} border-2 border-white shadow-lg`
                    : canAfford
                    ? "bg-gray-50 border-2 border-gray-200 hover:border-purple-300"
                    : "bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-center">
                  <span className="text-4xl block mb-2">{tier.emoji}</span>
                  <p className={`font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
                    {tier.name}
                  </p>
                  <p className={`text-xs mt-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                    {tier.description}
                  </p>
                  <p className={`text-lg font-bold mt-2 ${isSelected ? "text-white" : canAfford ? "text-purple-600" : "text-red-500"}`}>
                    💎 {tier.cost}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a Message (Optional)</h3>
        
        <Textarea
          placeholder="Add a note to your mystery box..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-white border-purple-200 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
          maxLength={200}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Switch
              id="anonymous-mystery"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous-mystery" className="text-gray-600">
              Send anonymously
            </Label>
          </div>
        </div>
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={!selectedTier || !selectedRecipient || sendMysteryBox.isPending || (selectedTierData && credits < selectedTierData.cost)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-2xl text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50"
      >
        {sendMysteryBox.isPending ? (
          "Opening box..."
        ) : selectedTierData && credits < selectedTierData.cost ? (
          "Not enough credits"
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Send Mystery Box {selectedTierData && `(💎 ${selectedTierData.cost})`}
          </>
        )}
      </Button>
    </div>
  );
};
