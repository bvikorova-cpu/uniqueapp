import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Search, MessageCircle, Star, Crown } from "lucide-react";
import { CloneChatDialog } from "./CloneChatDialog";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Clone {
  id: string;
  clone_name: string;
  subscription_tier: string;
  total_conversations: number;
  personality_data: any;
}

export function CloneMarketplace() {
  const { toast } = useToast();
  const [clones, setClones] = useState<Clone[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClone, setSelectedClone] = useState<Clone | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => { fetchPublicClones(); }, []);

  const fetchPublicClones = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('public_clones')
        .select('id, clone_name, subscription_tier, total_conversations, personality_summary, tone')
        .order('total_conversations', { ascending: false })
        .limit(20);
      if (error) throw error;
      setClones((data || []).map((c: any) => ({
        id: c.id,
        clone_name: c.clone_name,
        subscription_tier: c.subscription_tier,
        total_conversations: c.total_conversations,
        personality_data: { personality: c.personality_summary, tone: c.tone },
      })));
    } catch (error) {
      console.error('Error fetching clones:', error);
    }
  };

  const handleStartChat = async (clone: Clone) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to chat with AI clones", variant: "destructive" });
      return;
    }
    setSelectedClone(clone);
    setChatOpen(true);
  };

  const filteredClones = clones.filter(clone =>
    clone.clone_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <FloatingHowItWorks title={"Clone Marketplace - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Marketplace section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Marketplace.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle>Explore AI Clones</CardTitle>
          <CardDescription>Chat with personality clones from around the world (20 AI responses/day limit)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-background/50" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClones.map((clone, i) => (
          <motion.div key={clone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{clone.clone_name}</CardTitle>
                  </div>
                  {clone.subscription_tier === 'celebrity' && (
                    <Badge variant="default"><Crown className="h-3 w-3 mr-1" /> Celebrity</Badge>
                  )}
                </div>
                <CardDescription>{clone.total_conversations} conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {typeof clone.personality_data === 'object' && clone.personality_data !== null
                    ? (clone.personality_data as any).personality || "A unique AI personality"
                    : "A unique AI personality"}
                </p>
                <Button className="w-full" variant="outline" onClick={() => handleStartChat(clone)}>
                  <MessageCircle className="h-4 w-4 mr-2" /> Start Chat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClones.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No clones found matching your search</p>
          </CardContent>
        </Card>
      )}

      <CloneChatDialog open={chatOpen} onOpenChange={setChatOpen} clone={selectedClone} />
    </div>
    </>
  );
}
