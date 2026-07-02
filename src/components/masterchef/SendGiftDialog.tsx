import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface GiftOption {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string | null;
}

interface SendGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chefId: string;
  chefName: string;
  competitionId?: string;
}

export function SendGiftDialog({
  open,
  onOpenChange,
  chefId,
  chefName,
  competitionId,
}: SendGiftDialogProps) {
  const [gifts, setGifts] = useState<GiftOption[]>([]);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadGifts();
    }
  }, [open]);

  const loadGifts = async () => {
    const { data, error } = await supabase
      .from("masterchef_gifts")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error("Error loading gifts:", error);
      toast({
        title: "Error",
        description: "Failed to load gifts. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setGifts(data || []);
  };

  const handleSendGift = async () => {
    if (!selectedGift) {
      toast({
        title: "Select a gift",
        description: "Please choose a gift to send",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please sign in to send gifts",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-masterchef-gift", {
        body: {
          chefId,
          giftId: selectedGift,
          competitionId,
          message: message.trim(),
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
        toast({
          title: "Payment Started",
          description: "Complete the payment to send your gift",
        });
      }
    } catch (error) {
      console.error("Gift send error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send gift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Send Gift Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-primary" />
            Send Gift to {chefName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Choose a gift:</h3>
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
                  <div className="text-4xl mb-2">{gift.icon}</div>
                  <div className="font-semibold">{gift.name}</div>
                  <div className="text-sm text-muted-foreground">{gift.description}</div>
                  <div className="text-lg font-bold text-primary mt-2">€{gift.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Add a message (optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a supportive message..."
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendGift}
              disabled={!selectedGift || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Send Gift
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
