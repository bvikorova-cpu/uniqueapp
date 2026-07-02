import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, Coins, ShoppingCart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message { role: "user" | "assistant"; content: string; }

const CREDIT_PACKAGES = [
  { id: "10", credits: 10, price: 5, label: "10 Credits" },
  { id: "25", credits: 25, price: 12.5, label: "25 Credits", popular: true },
  { id: "50", credits: 50, price: 25, label: "50 Credits" },
  { id: "100", credits: 100, price: 50, label: "100 Credits" },
];

export const LiveChatWithAI = () => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["current-user-chat"],
    queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); return user; },
  });
  const { credits, isLoading: creditsLoading } = useAstrologyCredits();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome! I'm your AI mystic advisor. Ask me anything about astrology, tarot, numerology, or spiritual guidance. 🔮" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handlePurchase = async (packageId: string) => {
    if (!user) { toast.error("Please log in"); return; }
    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { creditType: 'astrology', credits: Number(packageId) } });
      if (error) throw error;
      if (data?.url) { window.open(data.url, '_blank'); setShowShop(false); }
    } catch (error: any) { toast.error(error.message || "Failed to create checkout"); }
    finally { setIsPurchasing(false); }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!user) { toast.error("Please log in"); return; }
    if (!credits || credits.credits_remaining < CREDIT_COSTS.mystic_chat) { toast.error("Insufficient credits"); setShowShop(true); return; }
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]); setInput(""); setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('astrology-chat', { body: { messages: [...messages, userMessage], deductCredit: true } });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      queryClient.invalidateQueries({ queryKey: ["astrology-credits"] });
    } catch (error: any) { toast.error(error.message || "Failed to get response"); setMessages(prev => prev.slice(0, -1)); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Live Chat With AI'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Live Chat With AI panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-black text-foreground">AI Mystic Chat</h3>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">{creditsLoading ? "..." : credits?.credits_remaining || 0}</span>
            </div>
            <Dialog open={showShop} onOpenChange={setShowShop}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 border-border/30 h-7 text-xs">
                  <ShoppingCart className="h-3 w-3" /> Buy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-black">Buy Credits</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <Button key={pkg.id} variant={pkg.popular ? "default" : "outline"} className="w-full justify-between h-auto py-3"
                      onClick={() => handlePurchase(pkg.id)} disabled={isPurchasing}>
                      <span className="flex items-center gap-2"><Coins className="h-4 w-4" />{pkg.label}
                        {pkg.popular && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">Best Value</span>}
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

      <p className="text-xs text-muted-foreground">
        Chat with your AI mystic advisor • <span className="text-primary font-bold">{CREDIT_COSTS.mystic_chat} credit/msg</span>
      </p>

      {!user && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <p className="text-xs text-foreground">Please log in to use the AI Mystic chat.</p>
        </div>
      )}

      <ScrollArea className="h-[350px] pr-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-muted/50 border border-border/30"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask your question..." disabled={isLoading || !user} className="bg-muted/30 border-border/30" />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim() || !user}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
    </>
  );
};
