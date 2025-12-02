import { useSecretSanta } from "@/hooks/useSecretSanta";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Share2, Inbox, Gift } from "lucide-react";

export const SecretSantaInbox = () => {
  const { receivedGifts, giftsLoading, shareToStory } = useSecretSanta();

  if (giftsLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (receivedGifts.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
          <Inbox className="h-10 w-10 text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No gifts yet</h3>
        <p className="text-white/60">
          When someone sends you a gift, it will appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Gift className="h-5 w-5 text-amber-400" />
        Your Received Gifts ({receivedGifts.length})
      </h3>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {receivedGifts.map((gift) => (
            <div
              key={gift.id}
              className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Gift emoji */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {gift.gift_emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-200 font-medium">
                      {gift.is_anonymous ? "Secret Santa" : "Someone special"}
                    </span>
                    <span className="text-white/40 text-xs">
                      {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-white/60 text-sm">
                    Sent you a <span className="text-amber-300">{gift.gift_type.replace(/_/g, " ")}</span>
                  </p>

                  {gift.message && (
                    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/80 text-sm italic">"{gift.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-400 text-sm">
                      💎 {gift.gift_value} value
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareToStory(gift.id)}
                      className="text-white/60 hover:text-amber-300 hover:bg-amber-500/10"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share to Story
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
