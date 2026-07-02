import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Sparkles, Bot, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CloneDating() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const startDatingSession = async () => {
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to use Clone Dating", variant: "destructive" });
        return;
      }

      const { data: userClones } = await supabase
        .from('personality_clones')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!userClones || userClones.length === 0) {
        toast({ title: "No Active Clone", description: "You need an active clone to use Clone Dating", variant: "destructive" });
        return;
      }

      // Use Stripe checkout for dating session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { productKey: "clone_dating" },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to start dating session", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Clone Dating - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Dating section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Dating.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20 bg-gradient-to-br from-pink-950/10 to-purple-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-400" />
            Clone-to-Clone Speed Dating
          </CardTitle>
          <CardDescription>
            Let your AI clone meet and chat with other clones to build connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Bot className="h-16 w-16 text-primary" />
              </motion.div>
              <Heart className="h-12 w-12 text-pink-400 mt-2" />
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                <Bot className="h-16 w-16 text-accent" />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: MessageCircle, title: "Auto Conversations", desc: "Clones chat automatically", color: "text-primary" },
                { icon: Sparkles, title: "Compatibility Score", desc: "AI-generated match rating", color: "text-pink-400" },
                { icon: Heart, title: "New Connections", desc: "Expand your network", color: "text-accent" },
              ].map((item, i) => (
                <Card key={i} className="bg-background/50 border-border/50">
                  <CardContent className="pt-6 text-center">
                    <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                    <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={startDatingSession} disabled={isSearching} size="lg" className="w-full max-w-md">
              {isSearching ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding a match...</>
              ) : (
                <><Heart className="mr-2 h-5 w-5" /> Start Dating Session (€4.99)</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Your clone will have a 10-minute speed dating session with another compatible clone
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle>How Clone Dating Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Your AI clone is matched with another compatible clone",
            "They have an automatic conversation for 10 minutes",
            "AI analyzes compatibility and generates a match score",
            "Review the conversation and decide if you want to connect",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</Badge>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
