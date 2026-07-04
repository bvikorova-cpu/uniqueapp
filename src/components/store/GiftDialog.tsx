import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Gift, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface GiftDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemType: string;
  itemId: string;
  itemName: string;
  itemEmoji?: string;
  creditCost: number;
  userCredits: number;
  onSent?: () => void;
}

/** Gift an item to another user by email or username. Viral loop. */
export const GiftDialog = ({
  open, onOpenChange, itemType, itemId, itemName, itemEmoji, creditCost, userCredits, onSent,
}: GiftDialogProps) => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast({ title: "Recipient required", variant: "destructive" });
      return;
    }
    if (userCredits < creditCost) {
      toast({ title: "Not enough credits", description: `You need ${creditCost}.`, variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      // Find recipient by username or full_name
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .or(`username.eq.${recipient},full_name.eq.${recipient}`)
        .maybeSingle();

      if (!profile) {
        toast({ title: "User not found", description: "Check the username and try again.", variant: "destructive" });
        return;
      }

      const recipientId = (profile as any).id as string;

      const { error } = await supabase.from("premium_store_gifts").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        message: message.trim() || null,
        credits_spent: creditCost,
      });

      if (error) throw error;

      // Log purchase as gift (does not appear in leaderboard)
      await supabase.from("premium_store_purchases").insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        credits_spent: creditCost,
        is_gift: true,
        recipient_id: recipientId,
      });

      toast({
        title: "Gift sent! 🎁",
        description: `${recipient} will be notified about ${itemName}.`,
      });
      setRecipient("");
      setMessage("");
      onOpenChange(false);
      onSent?.();
    } catch (err) {
      console.error(err);
      toast({ title: "Could not send gift", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-rose-500" />
            Gift this item
          </DialogTitle>
          <DialogDescription>
            Send <strong>{itemEmoji} {itemName}</strong> to a friend. They'll receive a notification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="recipient">Recipient (username)</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="@johndoe"
            />
          </div>
          <div>
            <Label htmlFor="msg">Personal message (optional)</Label>
            <Textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enjoy this gift! 🎉"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-sm text-muted-foreground">Cost</span>
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="h-4 w-4 text-primary" /> {creditCost}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={sending}>Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-500/90 hover:to-pink-500/90 text-white"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Gift className="h-4 w-4 mr-1" /> Send gift</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    );
};
