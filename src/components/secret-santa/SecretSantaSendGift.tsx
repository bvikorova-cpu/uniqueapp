import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSecretSanta, GIFT_CATALOG, GIFT_CATEGORIES } from "@/hooks/useSecretSanta";
import { Search, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GiftConfetti } from "./GiftConfetti";
import { SendingAnimation } from "./GiftAnimation";
import { AIMessageGenerator } from "./AIMessageGenerator";
import { useSocialGiftsProgress } from "@/hooks/useSocialGiftsProgress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SecretSantaSendGift = () => {
  const { sendGift, isSending, credits } = useSecretSanta();
  const { addXP } = useSocialGiftsProgress();
  const queryClient = useQueryClient();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSendingAnimation, setShowSendingAnimation] = useState(false);

  // Search users
  const { data: users = [] } = useQuery({
    queryKey: ["search-users", searchQuery],
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

  const filteredGifts = activeCategory === "all" 
    ? GIFT_CATALOG 
    : GIFT_CATALOG.filter(g => g.category === activeCategory);

  const selectedGiftData = GIFT_CATALOG.find(g => g.type === selectedGift);
  const selectedUserData = users.find(u => u.id === selectedRecipient);

  const handleSend = async () => {
    if (!selectedGift || !selectedRecipient) return;
    
    setShowSendingAnimation(true);
    
    try {
      await sendGift({
        recipientId: selectedRecipient,
        giftType: selectedGift,
        message: message || undefined,
        isAnonymous,
      });

      // Add XP for sending gift
      addXP({ xp: 25, type: "gift_sent" });

      // Show confetti after sending animation
      setTimeout(() => {
        setShowSendingAnimation(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }, 1500);

      // Reset form
      setSelectedGift(null);
      setSelectedRecipient(null);
      setMessage("");
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
    } catch (error) {
      setShowSendingAnimation(false);
    }
  };

  const canAfford = selectedGiftData ? credits >= selectedGiftData.value : true;

  return (
    <div className="space-y-6">
      {/* Confetti effect */}
      <GiftConfetti trigger={showConfetti} type="send" />
      
      {/* Sending animation overlay */}
      {showSendingAnimation && <SendingAnimation />}

      {/* Search recipient */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-500" />
          Find Recipient
        </h3>
        
        <div className="relative">
          <Input
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-amber-200 text-gray-800 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-2">
            Search any user on the platform by their name
          </p>
        </div>

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
                    ? "bg-amber-100 border border-amber-400"
                    : "bg-gray-50 hover:bg-amber-50"
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-800 font-medium">{user.username}</span>
              </div>
            ))}
          </div>
        )}

        {selectedUserData && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-amber-100 border border-amber-400">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUserData.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                {selectedUserData.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-800 font-medium">Sending to: {selectedUserData.username}</span>
          </div>
        )}
      </div>

      {/* Gift catalog */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Choose a Gift
        </h3>

        {/* Category filters */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-2">
            {GIFT_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full flex items-center gap-1 ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-gray-600 hover:text-gray-800 hover:bg-amber-100"
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Gift grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mt-4">
          {filteredGifts.map((gift) => {
            const affordable = credits >= gift.value;
            const isSelected = selectedGift === gift.type;
            return (
              <div
                key={gift.type}
                onClick={() => affordable && setSelectedGift(gift.type)}
                title={gift.description}
                className={`relative p-2 sm:p-3 rounded-xl text-center cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-200 to-yellow-200 border-2 border-amber-400 scale-105 shadow-md"
                    : affordable
                    ? "bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 hover:shadow-sm hover:scale-102"
                    : "bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed"
                }`}
              >
                {(gift as any).image ? (
                  <img 
                    src={(gift as any).image} 
                    alt={gift.label} 
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl block">{gift.emoji}</span>
                )}
                <p className="text-gray-700 text-[10px] sm:text-xs mt-1 truncate font-medium">{gift.label}</p>
                <p className={`text-[10px] sm:text-xs mt-0.5 font-semibold ${affordable ? "text-amber-600" : "text-red-500"}`}>
                  💎 {gift.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected gift details */}
        {selectedGiftData && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300">
            <div className="flex items-center gap-3">
              {(selectedGiftData as any).image ? (
                <img 
                  src={(selectedGiftData as any).image} 
                  alt={selectedGiftData.label} 
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-4xl">{selectedGiftData.emoji}</span>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{selectedGiftData.label}</h4>
                <p className="text-gray-600 text-sm">{selectedGiftData.description}</p>
              </div>
              <div className="text-right">
                <span className="text-amber-600 font-bold text-lg">💎 {selectedGiftData.value}</span>
                <p className="text-gray-500 text-xs">credits</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message section with AI Generator */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a Message (Optional)</h3>
        
        {/* AI Message Generator */}
        <div className="mb-4">
          <AIMessageGenerator 
            onSelectMessage={(msg) => setMessage(msg)}
            giftType={selectedGiftData?.label}
          />
        </div>
        
        <Textarea
          placeholder="Write a heartfelt message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-white border-amber-200 text-gray-800 placeholder:text-gray-400 min-h-[100px]"
          maxLength={500}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-gray-600">
              Send anonymously
            </Label>
          </div>
          
          <span className="text-gray-400 text-sm">{message.length}/500</span>
        </div>
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={!selectedGift || !selectedRecipient || isSending || !canAfford}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-2xl text-lg shadow-lg shadow-amber-500/30 disabled:opacity-50"
      >
        {isSending ? (
          "Sending..."
        ) : !canAfford ? (
          "Not enough credits"
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Send Gift {selectedGiftData && `(💎 ${selectedGiftData.value})`}
          </>
        )}
      </Button>
    </div>
  );
};