import { useState, useEffect } from "react";
import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Video, Loader2 } from "lucide-react";

interface PaidMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

export function PaidMessageDialog({ open,
  onOpenChange,
  creatorId,
  creatorName }: PaidMessageDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"message" | "shoutout">("message");
  const [pricePerMessage, setPricePerMessage] = useState(5);
  const [shoutoutPrice, setShoutoutPrice] = useState(20);
  const [messageEnabled, setMessageEnabled] = useState(true);
  const [shoutoutEnabled, setShoutoutEnabled] = useState(true);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("creator_message_settings")
        .select("price_per_message, shoutout_price, is_enabled, shoutout_enabled")
        .eq("creator_id", creatorId)
        .maybeSingle();
      if (data) {
        setPricePerMessage(Number(data.price_per_message ?? 5));
        setShoutoutPrice(Number(data.shoutout_price ?? 20));
        setMessageEnabled(data.is_enabled !== false);
        setShoutoutEnabled(data.shoutout_enabled !== false);
      }
    })();
  }, [open, creatorId]);

  const currentPrice = tab === "shoutout" ? shoutoutPrice : pricePerMessage;
  const currentEnabled = tab === "shoutout" ? shoutoutEnabled : messageEnabled;

  const handleSend = async () => { const trimmed = message.trim();
    if (trimmed.length < 3) {
      toast({
        title: "Message too short",
        description: "Please write at least 3 characters.",
        variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({
          title: "Sign in required",
          description: "Please sign in to continue",
          variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke(
        "create-paid-message-checkout",
        { body: { creatorId, message: trimmed, requestType: tab } }
      );
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
        setMessage("");
      }
    } catch (error: any) { toast({
        title: "Error",
        description: error?.message ?? "Failed to start checkout",
        variant: "destructive" });
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
            Contact {creatorName}
          </DialogTitle>
          <DialogDescription>
            Send a paid message or request a personal video shoutout. The
            creator responds directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "message" | "shoutout")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="message" disabled={!messageEnabled}>
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </TabsTrigger>
            <TabsTrigger value="shoutout" disabled={!shoutoutEnabled}>
              <Video className="h-4 w-4 mr-1" /> Shoutout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Write a direct message. The creator will reply personally.
            </p>
          </TabsContent>
          <TabsContent value="shoutout" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Describe what the personal video should include (occasion, name,
              message).
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <Textarea
            placeholder={
              tab === "shoutout"
                ? "e.g. 'Say happy birthday to my friend Anna, she's your biggest fan!'"
                : "Write your message here..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/2000
          </p>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <span className="font-medium">
              {tab === "shoutout" ? "Shoutout Price" : "Message Price"}
            </span>
            <span className="text-xl font-bold text-primary">€{currentPrice}</span>
          </div>

          {!currentEnabled && (
            <p className="text-xs text-destructive">
              This option is currently disabled by the creator.
            </p>
          )}

          <Button
            onClick={handleSend}
            disabled={loading || !currentEnabled || !message.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                {tab === "shoutout" ? (
                  <Video className="mr-2 h-4 w-4" />
                ) : (
                  <MessageCircle className="mr-2 h-4 w-4" />
                )}
                Pay €{currentPrice} & Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
