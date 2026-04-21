import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Brain, Lock, Heart, Sparkles, Crown, CreditCard,
  SmilePlus, Wind, Zap, Phone, MessageCircle, TrendingUp,
  Moon, Target, Volume2, FileText
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePsychologySubscription } from "@/hooks/usePsychologySubscription";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PsychologyHero } from "@/components/psychologist/PsychologyHero";
import { MoodTracker } from "@/components/psychologist/MoodTracker";
import { BreathingMeditation } from "@/components/psychologist/BreathingMeditation";
import { AIEmotionAnalysis } from "@/components/psychologist/AIEmotionAnalysis";
import { CrisisResources } from "@/components/psychologist/CrisisResources";
import { MoodCharts } from "@/components/psychologist/MoodCharts";
import { AIDreamJournal } from "@/components/psychologist/AIDreamJournal";
import { GuidedCBT } from "@/components/psychologist/GuidedCBT";
import { AmbientSounds } from "@/components/psychologist/AmbientSounds";
import { WeeklyWellnessReport } from "@/components/psychologist/WeeklyWellnessReport";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ActiveView = 'main' | 'chat' | 'mood' | 'breathing' | 'emotion' | 'crisis' | 'charts' | 'dreams' | 'cbt' | 'sounds' | 'report';

const TOOLS = [
  { id: "chat" as const, icon: MessageCircle, title: "AI Chat Session", desc: "Talk to your AI psychologist in a safe, anonymous space", color: "from-purple-500 to-pink-500", badge: "Core" },
  { id: "mood" as const, icon: SmilePlus, title: "Mood Tracker & Journal", desc: "Log daily moods, track patterns, and journal your feelings", color: "from-yellow-500 to-orange-500", badge: "Free" },
  { id: "charts" as const, icon: TrendingUp, title: "Mood Trends & Charts", desc: "Visualize emotional patterns with interactive charts over time", color: "from-indigo-500 to-blue-500", badge: "Free" },
  { id: "breathing" as const, icon: Wind, title: "Breathing & Meditation", desc: "Guided breathing exercises and meditation timer", color: "from-blue-500 to-cyan-500", badge: "Free" },
  { id: "sounds" as const, icon: Volume2, title: "Ambient Sound Mixer", desc: "Nature sounds and white noise for relaxation and focus", color: "from-teal-500 to-green-500", badge: "Free" },
  { id: "dreams" as const, icon: Moon, title: "AI Dream Journal", desc: "Log dreams and unlock AI psychological interpretations", color: "from-violet-500 to-purple-500", badge: "5 Credits" },
  { id: "emotion" as const, icon: Zap, title: "AI Emotion Analysis", desc: "Analyze text for emotional patterns and psychological insights", color: "from-emerald-500 to-green-500", badge: "5 Credits" },
  { id: "cbt" as const, icon: Target, title: "Guided CBT Exercises", desc: "Interactive cognitive behavioral therapy tools for thought management", color: "from-amber-500 to-yellow-500", badge: "Free" },
  { id: "report" as const, icon: FileText, title: "Weekly Wellness Report", desc: "AI-generated weekly summary of your emotional health", color: "from-rose-500 to-pink-500", badge: "10 Credits" },
  { id: "crisis" as const, icon: Phone, title: "Crisis Resources", desc: "Emergency hotlines and professional referral directory", color: "from-red-500 to-rose-500", badge: "Free" },
];

const Psychology = () => {
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscription, refresh: refreshSubscription, createCheckout, manageSubscription, purchaseMessages } = usePsychologySubscription();

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: 'Hello 👋 I am here for you. This space is anonymous and safe. You can write anything that troubles you. How are you feeling today?' }]);
    setLoadingHistory(false);
  }, []);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to continue"); setIsLoading(false); return; }
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/psychology-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      });
      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          if (data.requiresSubscription) { setShowSubscriptionDialog(true); setMessages(prev => prev.slice(0, -1)); setIsLoading(false); return; }
        }
        throw new Error("Failed to start stream");
      }
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "", assistantMessage = "";
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
              setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: "assistant", content: assistantMessage }; return n; });
            }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error communicating with psychologist");
      setMessages(prev => prev.slice(0, -1));
    } finally { setIsLoading(false); refreshSubscription(); }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMessage = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSubscribe = async () => {
    try { await createCheckout(); toast.success("Opening checkout..."); }
    catch { toast.error("Failed to create checkout"); }
  };

  const messagesLeft = !subscription.subscribed ? Math.max(0, subscription.freeMessagesLimit - subscription.freeMessagesUsed) : null;

  // Render sub-views
  const viewMap: Record<string, JSX.Element> = {
    mood: <MoodTracker onBack={() => setActiveView('main')} />,
    breathing: <BreathingMeditation onBack={() => setActiveView('main')} />,
    emotion: <AIEmotionAnalysis onBack={() => setActiveView('main')} />,
    crisis: <CrisisResources onBack={() => setActiveView('main')} />,
    charts: <MoodCharts onBack={() => setActiveView('main')} />,
    dreams: <AIDreamJournal onBack={() => setActiveView('main')} />,
    cbt: <GuidedCBT onBack={() => setActiveView('main')} />,
    sounds: <AmbientSounds onBack={() => setActiveView('main')} />,
    report: <WeeklyWellnessReport onBack={() => setActiveView('main')} />,
  };

  if (activeView !== 'main' && activeView !== 'chat' && viewMap[activeView]) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">{viewMap[activeView]}</div>
      </div>
    );
  }

  if (activeView === 'chat') {
    if (loadingHistory || subscription.loading) {
      return (
        <div className="min-h-screen bg-background pt-20 pb-8 flex items-center justify-center">
          <div className="text-center"><Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" /><p className="text-muted-foreground">Loading...</p></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => setActiveView('main')} className="gap-2 mb-4">← Back to Dashboard</Button>

          {subscription.subscribed ? (
            <div className="mb-4 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm">Premium Active • {subscription.monthlyMessagesUsed}/{subscription.monthlyMessagesLimit} messages
                  {subscription.bonusMessages > 0 && ` (+${subscription.bonusMessages} bonus)`}</span>
                <Button variant="ghost" size="sm" onClick={manageSubscription} className="ml-2">Manage</Button>
              </div>
              <div><Button variant="outline" size="sm" onClick={() => purchaseMessages()} className="gap-2"><CreditCard className="w-4 h-4" /> +100 messages for €2</Button></div>
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-start gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm">{messagesLeft} free {messagesLeft === 1 ? 'message' : 'messages'} remaining</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubscribe} size="sm" className="gap-2"><Crown className="w-4 h-4" /> €15/month</Button>
                <Button variant="outline" size="sm" onClick={() => purchaseMessages()} className="gap-2"><CreditCard className="w-4 h-4" /> +100 for €2</Button>
              </div>
            </div>
          )}

          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-foreground">🧠</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">AI Psychologist <Badge variant="secondary" className="text-[10px]">Online</Badge></CardTitle>
                  <p className="text-sm text-muted-foreground">Available 24/7 for listening</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-3 border-b bg-destructive/5">
                <p className="text-xs text-muted-foreground">⚠️ I am an AI assistant. For serious problems, consult a professional psychologist.</p>
              </div>
              <div className="h-[500px] overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20">🧠</AvatarFallback></Avatar>
                      )}
                      <div className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        <div className="prose prose-sm max-w-none"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20">🧠</AvatarFallback></Avatar>
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
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress}
                    placeholder="Write what troubles you..." className="min-h-[60px] resize-none" disabled={isLoading} />
                  <Button onClick={handleSend} disabled={!inputText.trim() || isLoading} size="icon" className="h-[60px] w-[60px]">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-primary" /> Subscribe to Continue</DialogTitle>
              <DialogDescription>You've used all free messages. Subscribe for €15/month for 1000 conversations.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3"><Heart className="w-5 h-5 text-destructive mt-0.5" /><div><p className="font-medium">1000 Messages/Month</p><p className="text-sm text-muted-foreground">Reset every billing period</p></div></div>
              <div className="flex items-start gap-3"><Lock className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-medium">100% Anonymous</p><p className="text-sm text-muted-foreground">Private and secure</p></div></div>
              <div className="flex items-start gap-3"><CreditCard className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-medium">€15/month + €2/100 extra</p><p className="text-sm text-muted-foreground">Cancel anytime</p></div></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)} className="flex-1">Maybe Later</Button>
              <Button onClick={handleSubscribe} className="flex-1"><Crown className="w-4 h-4 mr-2" /> Subscribe Now</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-background">
      <PsychologyHero />

      <HeroRewardedAd sectionKey="page_psychology" />

      <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50 mb-8">
            <h2 className="text-xl font-black mb-3">What is AI Psychologist?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AI Psychologist is your personal mental wellness companion powered by advanced AI technology.
              This intelligent platform provides empathetic support, mood tracking, breathing exercises, dream analysis,
              CBT tools, ambient sounds, and emotional analysis in a completely safe and anonymous environment. Available 24/7.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Lock, label: "100% Anonymous" },
                { icon: Heart, label: "Empathetic Support" },
                { icon: Brain, label: "AI-Powered" },
                { icon: Sparkles, label: "24/7 Available" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 text-sm">
                  <f.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{f.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
              ⚠️ <strong>Important:</strong> This is an AI assistant. For serious mental health concerns, please consult a professional psychologist.
            </p>
          </Card>
        </motion.div>

        <h3 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
          Wellness Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                className="p-5 bg-card/60 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-all h-full"
                onClick={() => setActiveView(tool.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center shrink-0`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{tool.title}</h4>
                      <Badge variant="outline" className="text-[10px] shrink-0">{tool.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50 mt-8">
            <h3 className="text-xl font-black mb-4">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-sm font-bold mb-1">Free Trial</p>
                <p className="text-2xl font-black text-primary">5</p>
                <p className="text-xs text-muted-foreground">Free chat messages</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-xl text-center ring-2 ring-primary">
                <p className="text-sm font-bold mb-1">Premium Chat</p>
                <p className="text-2xl font-black text-primary">€15</p>
                <p className="text-xs text-muted-foreground">1000 messages/month</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-sm font-bold mb-1">AI Credits</p>
                <p className="text-2xl font-black text-primary">5-10</p>
                <p className="text-xs text-muted-foreground">Per AI analysis/report</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Psychology;
