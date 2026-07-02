import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Loader2, Sparkles, Clock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CompanionChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [character, setCharacter] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLimit, setMessagesLimit] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
    loadMessages();
    loadMessageLimits();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("character_conversations")
        .select("*, ai_characters(*)")
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      if (!data) { navigate("/companions"); return; }
      setCharacter(data.ai_characters);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to load conversation", variant: "destructive" });
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("character_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) { console.error("Error:", error); }
  };

  const loadMessageLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_message_limits").select("*").eq("user_id", user.id).maybeSingle();
      setMessagesLimit(data);
    } catch (error) { console.error("Error:", error); }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const messageText = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("character-chat", {
        body: { conversationId, message: messageText, characterId: character.id },
      });

      if (error) {
        if (error.message?.includes("Daily message limit")) {
          toast({ title: "Daily Limit Reached", description: "Upgrade to premium for unlimited messages", variant: "destructive" });
        } else if (error.message?.includes("Premium character")) {
          toast({ title: "Premium Required", description: "This character requires premium access", variant: "destructive" });
        } else throw error;
        return;
      }
      await loadMessages();
      await loadMessageLimits();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading conversation...</span>
        </div>
      </div>
    );
  }

  const remainingMessages = messagesLimit && !messagesLimit.is_premium ? 20 - messagesLimit.messages_used_today : null;

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <FloatingHowItWorks
        title={'Companion Chat'}
        intro={'Chat with an AI character — each reply spends AI credits.'}
        steps={[
          { title: 'Say hi', desc: 'Type a message and press Send. The companion replies in-character.' },
        { title: 'Credits per reply', desc: 'See the credit badge above the input; each response costs 3–5 credits.' },
        { title: 'Customize the vibe', desc: 'Adjust tone, memory, and voice in the companion settings.' },
        { title: 'Buy more credits', desc: 'Open the Credit Store when you run low.' }
        ]}
      />
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/companions")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {remainingMessages !== null && (
              <Badge variant="outline" className="animate-fade-in">
                {remainingMessages} messages left today
              </Badge>
            )}
          </div>

          <Card className="h-[calc(100vh-180px)] sm:h-[600px] flex flex-col bg-card/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b py-3 bg-card/90">
              <div className="flex items-center gap-3">
                <Avatar className="ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {character.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{character.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-muted-foreground capitalize">{character.personality_type} • Online</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> AI
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/50" />
                  <p className="font-medium">Start a conversation with {character.name}</p>
                  <p className="text-xs mt-1">Say hello to get started!</p>
                </div>
              )}
              {messages.map((message, i) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    {message.role !== "user" && (
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">{character.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${message.role === "user" ? "justify-end" : ""}`}>
                        <Clock className="h-2.5 w-2.5 opacity-50" />
                        <span className="text-[10px] opacity-50">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{character.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-3 bg-card/90">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={`Message ${character.name}...`}
                  disabled={loading}
                  className="rounded-full"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="rounded-full flex-shrink-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanionChat;
