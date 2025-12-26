import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Brain, Lock, Heart, Sparkles, Crown, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePsychologySubscription } from "@/hooks/usePsychologySubscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Psychology = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscription, refresh: refreshSubscription, createCheckout, manageSubscription, purchaseMessages } = usePsychologySubscription();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessages([{
          role: 'assistant',
          content: 'Hello 👋 I am here for you. This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?'
        }]);
        setLoadingHistory(false);
        return;
      }

      // Note: psychology_messages table may need to be created with user_id column
      // For now, use welcome message as default
      setMessages([{
        role: 'assistant',
        content: 'Hello 👋 I am here for you. This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?'
      }]);
    } catch (error) {
      console.error('Error loading history:', error);
      setMessages([{
        role: 'assistant',
        content: 'Hello 👋 I am here for you. This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?'
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to continue");
        setIsLoading(false);
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/psychology-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: userMessage }]
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          if (data.requiresSubscription) {
            setShowSubscriptionDialog(true);
            setMessages(prev => prev.slice(0, -1));
            setIsLoading(false);
            return;
          }
        }
        throw new Error("Failed to start stream");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error communicating with psychologist");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      refreshSubscription();
    }
  };

  const handleSubscribe = async () => {
    try {
      await createCheckout();
      toast.success("Opening checkout...");
    } catch (error) {
      toast.error("Failed to create checkout");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory || subscription.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const messagesLeft = !subscription.subscribed ? Math.max(0, subscription.freeMessagesLimit - subscription.freeMessagesUsed) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Psychologist
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your AI psychologist who is always here for you
          </p>
          
          {/* Detailed Description */}
          <div className="bg-card/50 rounded-lg p-6 mt-6 space-y-3 border border-border/50 text-left max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-3">What is AI Psychologist?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI Psychologist is your personal AI companion powered by advanced AI technology. 
              This intelligent chatbot is designed to provide empathetic support and listen to your concerns
              in a safe, anonymous environment.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">✨ Key Features:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Empathetic and supportive conversations</li>
                  <li>100% anonymous and confidential</li>
                  <li>Available 24/7 whenever you need to talk</li>
                  <li>Provides thoughtful advice without judgment</li>
                  <li>Helps you understand your emotions</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">💰 Pricing:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Free Trial:</strong> 5 messages to try it out</li>
                  <li>• <strong>Premium:</strong> €15/month for 1000 messages</li>
                  <li>• <strong>Extra:</strong> +100 messages for €2</li>
                  <li>• Cancel anytime through customer portal</li>
                </ul>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border/50">
              ⚠️ <strong>Important:</strong> I am an AI assistant. For serious problems, I recommend consulting with a professional psychologist.
            </p>
          </div>
          
          {subscription.subscribed && (
            <div className="mt-4 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success rounded-lg">
                <Crown className="w-4 h-4 text-success" />
                <span className="text-sm text-success">
                  Premium Active • {subscription.monthlyMessagesUsed}/{subscription.monthlyMessagesLimit} messages
                  {subscription.bonusMessages > 0 && ` (+${subscription.bonusMessages} bonus)`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={manageSubscription}
                  className="ml-2"
                >
                  Manage
                </Button>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => purchaseMessages()}
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  +100 messages for €2
                </Button>
              </div>
            </div>
          )}
          {!subscription.subscribed && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning rounded-lg">
                <Sparkles className="w-4 h-4 text-warning" />
                <span className="text-sm text-warning">
                  {messagesLeft} free {messagesLeft === 1 ? 'message' : 'messages'} remaining
                </span>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button onClick={handleSubscribe} className="gap-2">
                  <Crown className="w-4 h-4" />
                  Subscribe for €15/month
                </Button>
                <Button
                  variant="outline"
                  onClick={() => purchaseMessages()}
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  +100 messages for €2
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Card */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarFallback className="bg-gradient-primary text-white">
                  🧠
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Assistant
                  <Sparkles className="w-4 h-4 text-primary" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">Available 24/7 for listening</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-4 border-b bg-warning/5">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-warning">⚠️</span>
                Important: I am an AI assistant. For serious problems, I recommend consulting with a professional psychologist.
              </p>
            </div>
            
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-secondary text-white">
                          🧠
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-secondary text-white">
                        🧠
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write what troubles you..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Subscribe to Continue
              </DialogTitle>
              <DialogDescription>
                You've used all your free messages. Subscribe for just €15/month to enjoy 1000 conversations with your AI psychologist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">1000 Messages/Month</p>
                  <p className="text-sm text-muted-foreground">Reset every billing period</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">100% Anonymous</p>
                  <p className="text-sm text-muted-foreground">Your conversations are private and secure</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">€15/month + €2/100 extra</p>
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSubscriptionDialog(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleSubscribe}
                className="flex-1"
              >
                <Crown className="w-4 h-4 mr-2" />
                Subscribe Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                100% Anonymous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No personal data required, completely confidential
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                Empathetic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Understands your feelings and always supports you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-success" />
                AI Powered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Available 24/7 whenever you need to talk
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Psychology;
