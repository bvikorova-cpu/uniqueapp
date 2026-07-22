import { useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePostGifts, GIFT_TYPES } from "@/hooks/usePostGifts";

interface GiftDialogProps {
  postId: string;
}

export const GiftDialog = ({ postId }: GiftDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { sendGift, totalValue } = usePostGifts(postId);

  const handleSend = () => {
    if (!selectedGift) return;

    sendGift(
      { postId, giftType: selectedGift, message },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedGift(null);
          setMessage("");
        } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Gift className="w-4 h-4 mr-2" />
          Send Gift
          {totalValue > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">({totalValue} coins)</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a Gift</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {GIFT_TYPES.map((gift) => (
              <button
                key={gift.type}
                onClick={() => setSelectedGift(gift.type)}
                className={`p-4 border rounded-lg hover:bg-accent transition-colors flex flex-col items-center gap-2 ${
                  selectedGift === gift.type ? "border-primary bg-accent" : ""
                }`}
              >
                <span className="text-4xl">{gift.emoji}</span>
                <span className="text-xs font-medium">{gift.label}</span>
                <span className="text-xs text-muted-foreground">{gift.value} coins</span>
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!selectedGift}>
              Send Gift
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
