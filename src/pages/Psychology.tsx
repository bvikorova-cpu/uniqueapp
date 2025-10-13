import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Brain, Lock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Psychology = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('psychology-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'psychology_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.role === 'assistant') {
            setMessages(prev => {
              const exists = prev.find(m => m.id === newMsg.id);
              if (!exists) {
                return [...prev, {
                  id: newMsg.id,
                  role: newMsg.role,
                  content: newMsg.content,
                  created_at: newMsg.created_at
                }];
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const initSession = async () => {
    try {
      const { data: existingSession } = await supabase
        .from('psychology_sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (existingSession) {
        setSessionId(existingSession.id);
        await loadMessages(existingSession.id);
      } else {
        const { data: newSession, error } = await supabase
          .from('psychology_sessions')
          .insert({ session_token: sessionToken })
          .select('id')
          .single();

        if (error) throw error;
        setSessionId(newSession.id);
        
        const welcomeMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Hello 👋 I am here for you. This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?',
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMsg]);

        await supabase.from('psychology_messages').insert({
          session_id: newSession.id,
          role: 'assistant',
          content: welcomeMsg.content
        });
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Error",
        description: "Failed to initialize session.",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('psychology_messages')
        .select('*')
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/psychology-chat`;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content }))
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";
    let assistantMsgId: string | null = null;

    while (!streamDone) {
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
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          
          if (content) {
            assistantContent += content;
            
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.id === assistantMsgId) {
                return prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent } 
                    : m
                );
              } else {
                assistantMsgId = uuidv4();
                return [...prev, {
                  id: assistantMsgId,
                  role: 'assistant' as const,
                  content: assistantContent,
                  created_at: new Date().toISOString()
                }];
              }
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (sessionId && assistantContent) {
      await supabase.from('psychology_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantContent
      });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputText.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      await supabase.from('psychology_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMsg.content
      });

      await streamChat([...messages, userMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-6">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-gradient-secondary text-white">
            <Lock className="h-4 w-4 mr-1" />
            100% Anonymous & Safe
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Online Psychologist
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your concerns in an anonymous and safe environment. I am here to listen to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  About the Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Anonymity</p>
                      <p className="text-xs text-muted-foreground">
                        No registration or personal data required
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Empathy</p>
                      <p className="text-xs text-muted-foreground">
                        Non-judgmental and supportive space
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-sm">AI Assistant</p>
                      <p className="text-xs text-muted-foreground">
                        Available 24/7 for listening
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Important: I am an AI assistant. For serious problems, I recommend consulting with a professional psychologist.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-16rem)]">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-secondary text-white'}>
                          {msg.role === 'user' ? '👤' : '🧠'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg px-4 py-3 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-secondary text-white">🧠</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write what troubles you..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="min-h-[60px] max-h-[120px] resize-none"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputText.trim() || isLoading}
                      size="icon"
                      className="h-[60px] w-[60px] shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Psychology;
