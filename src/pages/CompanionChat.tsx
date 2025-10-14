import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("character_conversations")
        .select("*, ai_characters(*)")
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      if (!data) {
        navigate("/companions");
        return;
      }

      setCharacter(data.ai_characters);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
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
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadMessageLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_message_limits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setMessagesLimit(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("character-chat", {
        body: {
          conversationId,
          message: messageText,
          characterId: character.id,
        },
      });

      if (error) {
        if (error.message?.includes("Daily message limit")) {
          toast({
            title: "Daily Limit Reached",
            description: "Upgrade to premium for unlimited messages",
            variant: "destructive",
          });
        } else if (error.message?.includes("Premium character")) {
          toast({
            title: "Premium Required",
            description: "This character requires premium access",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Reload messages
      await loadMessages();
      await loadMessageLimits();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const remainingMessages = messagesLimit && !messagesLimit.is_premium
    ? 20 - messagesLimit.messages_used_today
    : null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/companions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {remainingMessages !== null && (
            <Badge variant="outline">
              {remainingMessages} messages left today
            </Badge>
          )}
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{character.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{character.name}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {character.personality_type}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation with {character.name}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
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
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanionChat;
