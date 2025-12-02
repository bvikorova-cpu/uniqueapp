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

const MYSTERY_BOX_TIERS = [
  { 
    id: "bronze", 
    name: "Bronze Box", 
    emoji: "🎁", 
    cost: 15, 
    minValue: 5, 
    maxValue: 20,
    color: "from-amber-600 to-orange-700",
    description: "Contains gifts worth 5-20 credits"
  },
  { 
    id: "silver", 
    name: "Silver Box", 
    emoji: "🎀", 
    cost: 35, 
    minValue: 15, 
    maxValue: 50,
    color: "from-gray-400 to-gray-600",
    description: "Contains gifts worth 15-50 credits"
  },
  { 
    id: "gold", 
    name: "Gold Box", 
    emoji: "✨", 
    cost: 75, 
    minValue: 40, 
    maxValue: 100,
    color: "from-yellow-400 to-amber-500",
    description: "Contains gifts worth 40-100 credits"
  },
  { 
    id: "diamond", 
    name: "Diamond Box", 
    emoji: "💎", 
    cost: 150, 
    minValue: 80, 
    maxValue: 300,
    color: "from-cyan-400 to-blue-600",
    description: "Contains gifts worth 80-300 credits"
  },
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
