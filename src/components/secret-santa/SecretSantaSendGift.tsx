import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSecretSanta, GIFT_CATALOG } from "@/hooks/useSecretSanta";
import { Search, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const SecretSantaSendGift = () => {
  const { sendGift, isSending, credits } = useSecretSanta();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const categories = ["all", "romantic", "flowers", "drinks", "sweets", "luxury", "special", "mythical"];
  
  const filteredGifts = activeCategory === "all" 
    ? GIFT_CATALOG 
    : GIFT_CATALOG.filter(g => g.category === activeCategory);

  const selectedGiftData = GIFT_CATALOG.find(g => g.type === selectedGift);
  const selectedUserData = users.find(u => u.id === selectedRecipient);

  const handleSend = () => {
    if (!selectedGift || !selectedRecipient) return;
    
    sendGift({
      recipientId: selectedRecipient,
      giftType: selectedGift,
      message: message || undefined,
      isAnonymous,
    });

    // Reset form
    setSelectedGift(null);
    setSelectedRecipient(null);
    setMessage("");
    setSearchQuery("");
  };

  const canAfford = selectedGiftData ? credits >= selectedGiftData.value : true;

  return (
    <div className="space-y-6">
      {/* Search recipient */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-400" />
          Find Recipient
        </h3>
        
        <div className="relative">
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
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
                    ? "bg-amber-500/20 border border-amber-500/40"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{user.username}</span>
              </div>
            ))}
          </div>
        )}

        {selectedUserData && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUserData.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                {selectedUserData.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-white font-medium">Sending to: {selectedUserData.username}</span>
          </div>
        )}
      </div>

      {/* Gift catalog */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Choose a Gift
        </h3>

        {/* Category filters */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={`capitalize rounded-full ${
                  activeCategory === cat
                    ? "bg-amber-500/30 text-amber-200 border border-amber-500/40"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Gift grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mt-4">
          {filteredGifts.map((gift) => {
            const affordable = credits >= gift.value;
            return (
              <div
                key={gift.type}
                onClick={() => affordable && setSelectedGift(gift.type)}
                className={`relative p-3 sm:p-4 rounded-xl text-center cursor-pointer transition-all ${
                  selectedGift === gift.type
                    ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-2 border-amber-400 scale-105"
                    : affordable
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                    : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-2xl sm:text-3xl block">{gift.emoji}</span>
                <p className="text-white/80 text-xs mt-1 truncate">{gift.label}</p>
                <p className={`text-xs mt-0.5 ${affordable ? "text-amber-400" : "text-red-400"}`}>
                  💎 {gift.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message and options */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add a Message (Optional)</h3>
        
        <Textarea
          placeholder="Write a heartfelt message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
          maxLength={500}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-white/70">
              Send anonymously
            </Label>
          </div>
          
          <span className="text-white/40 text-sm">{message.length}/500</span>
        </div>
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={!selectedGift || !selectedRecipient || isSending || !canAfford}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-6 rounded-2xl text-lg shadow-lg shadow-amber-500/30 disabled:opacity-50"
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
