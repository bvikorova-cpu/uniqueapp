import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Database, Loader2, Brain, RefreshCw, Sparkles, Clock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ConversationMemory {
  id: string;
  character_name: string;
  summary: string | null;
  memory_context: any;
  created_at: string;
  message_count: number;
}

export const CompanionMemory = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => { loadConversations(); }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("character_conversations")
        .select("id, summary, memory_context, created_at, ai_characters(name)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (data) {
        const withCounts = await Promise.all(data.map(async (conv: any) => {
          const { count } = await supabase
            .from("character_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conv.id);
          return {
            id: conv.id,
            character_name: conv.ai_characters?.name || "Unknown",
            summary: conv.summary,
            memory_context: conv.memory_context,
            created_at: conv.created_at,
            message_count: count || 0,
          };
        }));
        setConversations(withCounts);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const analyzeMemory = async (conversationId: string) => {
    setAnalyzing(conversationId);
    try {
      const { data, error } = await supabase.functions.invoke("companion-ai", {
        body: { action: "memory-analyze", conversationId },
      });
      if (error) throw error;
      toast({ title: "Memory Updated", description: "Companion memory has been analyzed and updated" });
      loadConversations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to analyze memory", variant: "destructive" });
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Companion Memory"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Companion Memory
          </h1>
          <p className="text-muted-foreground mt-2">AI analyzes your conversations so companions remember your preferences</p>
          <Badge variant="outline" className="mt-2">5 Credits per memory analysis</Badge>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
      ) : conversations.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No conversations yet. Start chatting with a companion first!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, i) => (
            <motion.div key={conv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/80 backdrop-blur-xl hover:border-primary/40 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold">{conv.character_name}</h3>
                        <Badge variant="outline" className="text-[10px]">{conv.message_count} msgs</Badge>
                      </div>

                      {conv.summary ? (
                        <div className="bg-primary/10 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Brain className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">Memory Summary</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{conv.summary}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mb-2">No memory analyzed yet</p>
                      )}

                      {conv.memory_context && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(conv.memory_context as Record<string, any>).slice(0, 4).map(([key, val]) => (
                            <Badge key={key} variant="secondary" className="text-[10px]">{key}: {String(val).slice(0, 20)}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => analyzeMemory(conv.id)}
                      disabled={analyzing === conv.id}
                    >
                      {analyzing === conv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4 mr-1" /> Analyze</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
