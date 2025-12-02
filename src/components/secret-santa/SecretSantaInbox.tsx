import { useSecretSanta } from "@/hooks/useSecretSanta";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Share2, Inbox, Gift } from "lucide-react";

export const SecretSantaInbox = () => {
  const { receivedGifts, giftsLoading, shareToStory } = useSecretSanta();

  if (giftsLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-amber-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (receivedGifts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
          <Inbox className="h-10 w-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No gifts yet</h3>
        <p className="text-gray-500">
          When someone sends you a gift, it will appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Gift className="h-5 w-5 text-amber-500" />
        Your Received Gifts ({receivedGifts.length})
      </h3>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {receivedGifts.map((gift) => (
            <div
              key={gift.id}
              className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 transition-all group shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Gift emoji */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  {gift.gift_emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-600 font-medium">
                      {gift.is_anonymous ? "Secret Santa" : "Someone special"}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm">
                    Sent you a <span className="text-amber-600 font-medium">{gift.gift_type.replace(/_/g, " ")}</span>
                  </p>

                  {gift.message && (
                    <div className="mt-2 p-3 rounded-lg bg-white border border-amber-100">
                      <p className="text-gray-700 text-sm italic">"{gift.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-600 text-sm font-medium">
                      💎 {gift.gift_value} value
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareToStory(gift.id)}
                      className="text-gray-500 hover:text-amber-600 hover:bg-amber-100"
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
