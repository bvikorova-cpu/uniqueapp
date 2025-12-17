import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, Coins, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CREDIT_PACKAGES = [
  { id: "10", credits: 10, price: 5, label: "10 Credits" },
  { id: "30", credits: 30, price: 12, label: "30 Credits" },
  { id: "100", credits: 100, price: 35, label: "100 Credits", popular: true },
];

export const LiveChatWithAI = () => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["current-user-chat"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });
  const { credits, isLoading: creditsLoading } = useAstrologyCredits();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! I'm your AI mystic advisor. Ask me anything about astrology, tarot, numerology, or spiritual guidance. 🔮"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error("Please log in to purchase credits");
      return;
    }

    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-astrology-checkout', {
        body: { packageId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        setShowShop(false);
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsPurchasing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast.error("Please log in to use the chat");
      return;
    }

    if (!credits || credits.credits_remaining < CREDIT_COSTS.mystic_chat) {
      toast.error(`Insufficient credits. You need ${CREDIT_COSTS.mystic_chat} credit per message.`);
      setShowShop(true);
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('astrology-chat', {
        body: { 
          messages: [...messages, userMessage],
          deductCredit: true
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh credits after successful message
      queryClient.invalidateQueries({ queryKey: ["astrology-credits"] });
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || "Failed to get response");
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          <h3 className="text-xl font-semibold">Live Chat with AI Mystic</h3>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              <Coins className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                {creditsLoading ? "..." : credits?.credits_remaining || 0}
              </span>
            </div>
            <Dialog open={showShop} onOpenChange={setShowShop}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  Buy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy Credits</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <Button
                      key={pkg.id}
                      variant={pkg.popular ? "default" : "outline"}
                      className="w-full justify-between h-auto py-3"
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isPurchasing}
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        {pkg.label}
                        {pkg.popular && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                      </span>
                      <span>€{pkg.price}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Chat with your personal AI mystic advisor. <span className="text-purple-500 font-medium">{CREDIT_COSTS.mystic_chat} credit per message</span> 💬
      </p>

      {!user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please log in to use the AI Mystic chat.
          </p>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your question..."
          disabled={isLoading || !user}
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim() || !user}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};
