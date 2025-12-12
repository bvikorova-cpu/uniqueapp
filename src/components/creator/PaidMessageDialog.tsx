import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2 } from "lucide-react";

interface PaidMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

export function PaidMessageDialog({ open, onOpenChange, creatorId, creatorName }: PaidMessageDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pricePerMessage, setPricePerMessage] = useState(5);

  useEffect(() => {
    if (open) {
      loadMessageSettings();
    }
  }, [open, creatorId]);

  const loadMessageSettings = async () => {
    try {
      const { data } = await supabase
        .from("creator_message_settings")
        .select("*")
        .eq("creator_id", creatorId)
        .maybeSingle();

      if (data) {
        setPricePerMessage(data.price_per_message || 5);
      }
    } catch (error) {
      console.error("Error loading message settings:", error);
    }
  };

  const handleSendPaidMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to send a paid message",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-paid-message-checkout", {
        body: {
          creatorId,
          message: message.trim(),
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
        setMessage("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send Paid Message to {creatorName}
          </DialogTitle>
          <DialogDescription>
            Send a direct message for €{pricePerMessage}. The creator will respond personally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/1000 characters
          </p>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <span className="font-medium">Message Price</span>
            <span className="text-xl font-bold text-primary">€{pricePerMessage}</span>
          </div>

          <Button onClick={handleSendPaidMessage} disabled={loading || !message.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Paid Message (€{pricePerMessage})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
