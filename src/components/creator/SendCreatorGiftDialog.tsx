import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Loader2, Heart } from "lucide-react";

const giftEmojis: Record<string, string> = { "Heart": "❤️",
  "Double Heart": "💕",
  "Golden Heart": "💛",
  "Star": "⭐",
  "Shooting Star": "🌠",
  "Crown": "👑",
  "Galaxy": "🌌",
  "Diamond": "💎",
  "Trophy": "🏆",
  "Fireworks": "🎆",
  "Unicorn": "🦄",
  "Rainbow": "🌈",
  "Rose": "🌹",
  "Bouquet": "💐",
  "Cake": "🎂",
  "Champagne": "🍾" };

interface GiftOption {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  description: string | null;
  category: string;
}

interface SendCreatorGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

export function SendCreatorGiftDialog({ open,
  onOpenChange,
  creatorId,
  creatorName }: SendCreatorGiftDialogProps) {
  const [gifts, setGifts] = useState<GiftOption[]>([]);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadGifts();
    }
  }, [open]);

  const loadGifts = async () => {
    setLoadingGifts(true);
    try {
      const { data, error } = await supabase
        .from("virtual_gifts")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) { console.error("Error loading gifts:", error);
      toast({
        title: "Error",
        description: "Failed to load gifts. Please try again.",
        variant: "destructive" });
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleSendGift = async () => { if (!selectedGift) {
      toast({
        title: "Select a gift",
        description: "Please choose a gift to send",
        variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({
          title: "Login Required",
          description: "Please sign in to send gifts",
          variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-gift-payment", { body: {
          creatorId,
          giftId: selectedGift,
          message: message.trim() } });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
        setSelectedGift(null);
        setMessage("");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) { console.error("Gift send error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send gift. Please try again.",
        variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedGiftData = gifts.find((g) => g.id === selectedGift);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-primary" />
            Send Gift to {creatorName}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation by sending a virtual gift. Creators receive 90% of the gift value.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loadingGifts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gifts available at the moment.</p>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-base font-semibold mb-4 block">Choose a gift:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift.id)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedGift === gift.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-4xl mb-2">{giftEmojis[gift.name] || "🎁"}</div>
                      <div className="font-semibold">{gift.name}</div>
                      {gift.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">{gift.description}</div>
                      )}
                      <div className="text-lg font-bold text-primary mt-2">€{gift.price.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedGiftData && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Selected Gift:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{giftEmojis[selectedGiftData.name] || "🎁"}</span>
                    <div>
                      <p className="font-medium">{selectedGiftData.name}</p>
                      <p className="text-lg font-bold text-primary">€{selectedGiftData.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Add a personal message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder={`Write a message for ${creatorName}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
              </div>

              <Button
                onClick={handleSendGift}
                disabled={!selectedGift || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    Send Gift {selectedGiftData && `(€${selectedGiftData.price.toFixed(2)})`}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
