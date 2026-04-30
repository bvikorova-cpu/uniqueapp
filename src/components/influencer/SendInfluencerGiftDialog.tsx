import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Gift } from "lucide-react";

interface Gift {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
}

interface SendInfluencerGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerId: string;
  influencerName: string;
}

export const SendInfluencerGiftDialog = ({
  open,
  onOpenChange,
  influencerId,
  influencerName,
}: SendInfluencerGiftDialogProps) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadGifts();
    }
  }, [open]);

  const loadGifts = async () => {
    try {
      const { data, error } = await supabase
        .from("influencer_gifts")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) {
      console.error("Error loading gifts:", error);
      toast.error("Failed to load gifts");
    }
  };

  const handleSendGift = async () => {
    if (!selectedGift) {
      toast.error("Please select a gift");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke("send-influencer-gift", {
        body: {
          influencerId,
          giftId: selectedGift,
          message: message.trim(),
        },
      });

      if (error) throw error;

      if (data.url) {
        { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
      }
    } catch (error: any) {
      console.error("Error sending gift:", error);
      toast.error(error.message || "Failed to send gift");
      setLoading(false);
    }
  };

  const selectedGiftData = gifts.find((g) => g.id === selectedGift);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Send Gift to {influencerName}
          </DialogTitle>
          <DialogDescription>
            Choose a gift and add a personal message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Select a Gift</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedGift(gift.id)}
                  className={`p-4 border rounded-lg text-center transition-all hover:scale-105 ${
                    selectedGift === gift.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-4xl mb-2">{gift.icon}</div>
                  <p className="font-medium text-sm">{gift.name}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    €{gift.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedGiftData && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Selected Gift:</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedGiftData.icon}</span>
                <div>
                  <p className="font-medium">{selectedGiftData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedGiftData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a personal message..."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendGift}
              disabled={!selectedGift || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedGiftData
                ? `Send Gift (€${selectedGiftData.price.toFixed(2)})`
                : "Select a Gift"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
