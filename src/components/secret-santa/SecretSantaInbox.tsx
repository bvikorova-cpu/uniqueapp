import { useState } from "react";
import { useSecretSanta, GIFT_CATALOG } from "@/hooks/useSecretSanta";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Share2, Inbox, Send, ArrowDownLeft, ArrowUpRight, Gamepad2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GiftConfetti } from "./GiftConfetti";
import { GiftAnimation } from "./GiftAnimation";
import { GiftReactions } from "./GiftReactions";
import { InteractiveGift } from "./InteractiveGift";
import { useSocialGiftsProgress } from "@/hooks/useSocialGiftsProgress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SecretSantaInbox = () => {
  const { receivedGifts, giftsLoading, sentGifts, sentLoading, shareToStory } = useSecretSanta();
  const { addXP } = useSocialGiftsProgress();
  const [activeView, setActiveView] = useState<"received" | "sent">("received");
  const [showConfetti, setShowConfetti] = useState(false);
  const [openingGift, setOpeningGift] = useState<any>(null);
  const [interactiveGift, setInteractiveGift] = useState<any>(null);
  const [revealedGifts, setRevealedGifts] = useState<Set<string>>(new Set());

  // Get profiles for sent gifts recipients
  const recipientIds = sentGifts.map(g => g.recipient_id);
  const { data: recipientProfiles = [] } = useQuery({
    queryKey: ["recipient-profiles", recipientIds],
    queryFn: async () => {
      if (recipientIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", recipientIds);
      return data || [];
    },
    enabled: recipientIds.length > 0,
  });

  const getRecipientProfile = (id: string) => {
    return recipientProfiles.find((p: any) => p.id === id);
  };

  const getGiftData = (giftType: string) => {
    return GIFT_CATALOG.find(g => g.type === giftType);
  };

  const getGiftLabel = (giftType: string) => {
    const gift = getGiftData(giftType);
    return gift?.label || giftType.replace(/_/g, " ");
  };

  const isLoading = activeView === "received" ? giftsLoading : sentLoading;
  const gifts = activeView === "received" ? receivedGifts : sentGifts;

  const handleOpenGift = (gift: any) => {
    // Check if gift should be interactive (random 30% chance for premium gifts)
    const giftData = getGiftData(gift.gift_type);
    const isPremium = giftData && giftData.value >= 20;
    const shouldBeInteractive = isPremium && Math.random() > 0.7;

    if (shouldBeInteractive && !revealedGifts.has(gift.id)) {
      setInteractiveGift(gift);
    } else {
      setOpeningGift(gift);
      setShowConfetti(true);
      
      // Add XP for receiving gift if not already revealed
      if (!revealedGifts.has(gift.id)) {
        addXP({ xp: 15, type: "gift_received" });
        setRevealedGifts(prev => new Set(prev).add(gift.id));
      }
      
      setTimeout(() => setShowConfetti(false), 100);
    }
  };

  const handleInteractiveComplete = (gift: any) => {
    setInteractiveGift(null);
    setRevealedGifts(prev => new Set(prev).add(gift.id));
    addXP({ xp: 20, type: "gift_received" }); // Extra XP for interactive
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  const gameTypes: ("puzzle" | "scratch" | "spin" | "shake")[] = ["puzzle", "scratch", "spin", "shake"];
  const getRandomGameType = () => gameTypes[Math.floor(Math.random() * gameTypes.length)];

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Secret Santa Inbox - How it works"} steps={[{ title: 'Open', desc: 'Access the Secret Santa Inbox section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Secret Santa Inbox.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-amber-100 rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-4">
      {/* Confetti effect */}
      <GiftConfetti trigger={showConfetti} type="receive" />

      {/* Gift opening animation */}
      {openingGift && (
        <div onClick={() => setOpeningGift(null)}>
          <GiftAnimation
            emoji={openingGift.gift_emoji}
            label={getGiftLabel(openingGift.gift_type)}
            onComplete={() => setOpeningGift(null)}
            type="open"
          />
        </div>
      )}

      {/* Interactive gift reveal */}
      {interactiveGift && (
        <InteractiveGift
          giftEmoji={interactiveGift.gift_emoji}
          giftLabel={getGiftLabel(interactiveGift.gift_type)}
          interactionType={getRandomGameType()}
          onComplete={() => handleInteractiveComplete(interactiveGift)}
        />
      )}

      {/* Toggle buttons */}
      <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-xl border border-amber-200 rounded-xl">
        <Button
          variant="ghost"
          onClick={() => setActiveView("received")}
          className={`flex-1 gap-2 rounded-lg ${
            activeView === "received"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500"
              : "text-gray-600 hover:bg-amber-50"
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" />
          Received ({receivedGifts.length})
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveView("sent")}
          className={`flex-1 gap-2 rounded-lg ${
            activeView === "sent"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500"
              : "text-gray-600 hover:bg-amber-50"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          Sent ({sentGifts.length})
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
        {gifts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
              {activeView === "received" ? (
                <Inbox className="h-10 w-10 text-amber-500" />
              ) : (
                <Send className="h-10 w-10 text-amber-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {activeView === "received" ? "No gifts received yet" : "No gifts sent yet"}
            </h3>
            <p className="text-gray-500">
              {activeView === "received"
                ? "When someone sends you a gift, it will appear here!"
                : "Start sending gifts to make someone's day!"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {gifts.map((gift) => {
                const recipientProfile = activeView === "sent" ? getRecipientProfile(gift.recipient_id) : null;
                const isRevealed = revealedGifts.has(gift.id);
                const giftData = getGiftData(gift.gift_type);
                const isPremium = giftData && giftData.value >= 20;
                
                return (
                  <div
                    key={gift.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 transition-all group shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Gift emoji - clickable for received gifts */}
                      <div 
                        onClick={() => activeView === "received" && handleOpenGift(gift)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 transition-transform shadow-sm ${
                          activeView === "received" 
                            ? "cursor-pointer hover:scale-110 hover:shadow-md" 
                            : "group-hover:scale-110"
                        }`}
                      >
                        {activeView === "received" && !isRevealed && isPremium ? (
                          <div className="relative">
                            <span className="opacity-50">🎁</span>
                            <Gamepad2 className="absolute -bottom-1 -right-1 h-4 w-4 text-purple-500" />
                          </div>
                        ) : (
                          gift.gift_emoji
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          {activeView === "received" ? (
                            <span className="text-amber-600 font-medium">
                              {gift.is_anonymous ? "Anonymous Sender" : "Someone special"}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={recipientProfile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-amber-200 text-amber-700 text-xs">
                                  {recipientProfile?.full_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-amber-600 font-medium text-sm">
                                To: {recipientProfile?.full_name || "User"}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-400 text-xs">
                            {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm">
                          {activeView === "received" ? "Sent you" : "You sent"} a{" "}
                          <span className="text-amber-600 font-medium">{getGiftLabel(gift.gift_type)}</span>
                        </p>

                        {gift.message && (
                          <div className="mt-2 p-3 rounded-lg bg-white border border-amber-100">
                            <p className="text-gray-700 text-sm italic">"{gift.message}"</p>
                          </div>
                        )}

                        {/* Reactions for received gifts */}
                        {activeView === "received" && (
                          <div className="mt-3">
                            <GiftReactions giftId={gift.id} />
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <span className="text-amber-600 text-sm font-medium">
                            💎 {gift.gift_value} credits
                          </span>
                          
                          {activeView === "received" && (
                            <div className="flex gap-2">
                              {!isRevealed && isPremium && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenGift(gift)}
                                  className="text-purple-500 hover:text-purple-600 hover:bg-purple-100"
                                >
                                  <Gamepad2 className="h-4 w-4 mr-1" />
                                  Open
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => shareToStory(gift.id)}
                                className="text-gray-500 hover:text-amber-600 hover:bg-amber-100"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Share to Story</span>
                                <span className="sm:hidden">Share</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};