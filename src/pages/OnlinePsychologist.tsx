import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Heart, Lock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OnlinePsychologist = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize anonymous session via secure edge function
  useEffect(() => {
    const initSession = async () => {
      let token = localStorage.getItem("psychology_session_token");
      let isNew = false;

      if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem("psychology_session_token", token);
        isNew = true;
      }

      const { data, error } = await supabase.functions.invoke("psychology-session", {
        body: { action: "init", session_token: token },
      });

      if (error || !data?.id) {
        console.error("Error initializing session:", error);
        toast({
          title: "Error",
          description: "Failed to create session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSessionId(data.id);
      setSessionToken(token);

      if (!isNew) {
        await loadMessages(token);
      }
    };

    initSession();
  }, []);

  // Load existing messages via secure edge function (token-validated)
  const loadMessages = async (token: string) => {
    const { data, error } = await supabase.functions.invoke("psychology-session", {
      body: { action: "messages", session_token: token },
    });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    const loadedMessages = (data?.messages ?? []).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    setMessages(loadedMessages);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime removed for security: psychology_messages no longer published.
  // Assistant streaming below already updates the UI in real time as tokens arrive.

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message via secure edge function
    if (sessionToken) {
      await supabase.functions.invoke("psychology-session", {
        body: {
          action: "insert-message",
          session_token: sessionToken,
          role: "user",
          content: userMessage.content,
        },
      });
    }

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/psychology-chat`;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Error communicating with server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant response via secure edge function
      if (assistantContent && sessionToken) {
        await supabase.functions.invoke("psychology-session", {
          body: {
            action: "insert-message",
            session_token: sessionToken,
            role: "assistant",
            content: assistantContent,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    localStorage.removeItem("psychology_session_token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-primary/10 text-primary">
            <Lock className="h-3 w-3 mr-1" />
            Anonymous and Confidential
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Online Psychologist
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your concerns in an anonymous and safe space. I am here to listen to you.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Anonymous</h3>
              <p className="text-sm text-muted-foreground">
                No registration or personal information required
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Empathy</h3>
              <p className="text-sm text-muted-foreground">
                Non-judgmental and supportive approach
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Available 24/7 for immediate support
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation with Psychologist
              </div>
              <Button variant="outline" size="sm" onClick={handleNewSession}>
                New Session
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-20">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Hello 👋 I'm here for you.</p>
                  <p className="text-sm">
                    This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        🧠
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary">
                        👤
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      🧠
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Write what troubles you..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading || !sessionId}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !sessionId}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Important: This is an AI assistant. In case of serious problems, we recommend consulting a professional psychologist.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlinePsychologist;
