import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send, Heart, Sparkles, CreditCard, Crown, ArrowLeft,
  BookHeart, MessageSquarePlus, HeartHandshake, Target, MessageCircle,
  TrendingUp, Music, Sunrise, Gamepad2, Moon, Camera,
  Flower2, Stars, Scale, Map, Leaf,
  User, Brain, Drama, Mic, FileText, Clock, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBestFriendSubscription } from "@/hooks/useBestFriendSubscription";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { BestFriendHero } from "@/components/best-friend/BestFriendHero";
import { MoodJournalView } from "@/components/best-friend/MoodJournalView";
import { ConversationStartersView } from "@/components/best-friend/ConversationStartersView";
import { EncouragementCardsView } from "@/components/best-friend/EncouragementCardsView";
import { LifeCoachView } from "@/components/best-friend/LifeCoachView";
import { FriendshipAnalyticsView } from "@/components/best-friend/FriendshipAnalyticsView";
import { MoodPlaylistView } from "@/components/best-friend/MoodPlaylistView";
import { DailyAffirmationsView } from "@/components/best-friend/DailyAffirmationsView";
import { FriendshipGamesView } from "@/components/best-friend/FriendshipGamesView";
import { DreamCompanionView } from "@/components/best-friend/DreamCompanionView";
import { MemoryScrapbookView } from "@/components/best-friend/MemoryScrapbookView";
import { GratitudeGardenView } from "@/components/best-friend/GratitudeGardenView";
import { FriendshipHoroscopeView } from "@/components/best-friend/FriendshipHoroscopeView";
import { ConflictResolverView } from "@/components/best-friend/ConflictResolverView";
import { BucketListView } from "@/components/best-friend/BucketListView";
import { SelfCarePlannerView } from "@/components/best-friend/SelfCarePlannerView";
import { PersonaSettingsView } from "@/components/best-friend/PersonaSettingsView";
import { MemoryVaultView } from "@/components/best-friend/MemoryVaultView";
import { RoleplayScenariosView } from "@/components/best-friend/RoleplayScenariosView";
import { VoiceJournalView } from "@/components/best-friend/VoiceJournalView";
import { PhotoShareView } from "@/components/best-friend/PhotoShareView";
import { YearReportView } from "@/components/best-friend/YearReportView";
import { MemoryTimelineView } from "@/components/best-friend/MemoryTimelineView";

import { CrisisResourcesView } from "@/components/best-friend/CrisisResourcesView";
import { FriendshipHUD } from "@/components/best-friend/FriendshipHUD";
import ReactMarkdown from "react-markdown";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CHAT_URL = `https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/best-friend-chat`;

type Message = { role: "user" | "assistant"; content: string };

const tools = [
  { id: "chat", icon: MessageCircle, title: "Best Friend Chat", description: "Talk to your AI best friend", badge: "Subscription", credits: 0, gradient: "from-purple-500/10 to-blue-500/5" },
  { id: "mood_journal", icon: BookHeart, title: "AI Mood Journal", description: "Track emotions & get insights", badge: "AI", credits: 3, gradient: "from-purple-500/10 to-indigo-500/5" },
  { id: "conversation_starters", icon: MessageSquarePlus, title: "Conversation Starters", description: "AI-generated icebreakers", badge: "AI", credits: 2, gradient: "from-indigo-500/10 to-purple-500/5" },
  { id: "encouragement_cards", icon: HeartHandshake, title: "Encouragement Cards", description: "Personalized motivational cards", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-rose-500/5" },
  { id: "life_coach", icon: Target, title: "Life Coach Mode", description: "Goal-setting & accountability", badge: "AI", credits: 4, gradient: "from-emerald-500/10 to-teal-500/5" },
  { id: "gratitude_garden", icon: Flower2, title: "Gratitude Garden", description: "Cultivate thankfulness visually", badge: "AI", credits: 3, gradient: "from-green-500/10 to-emerald-500/5" },
  { id: "friendship_horoscope", icon: Stars, title: "Friendship Horoscope", description: "Cosmic friendship readings", badge: "AI", credits: 2, gradient: "from-violet-500/10 to-purple-500/5" },
  { id: "conflict_resolver", icon: Scale, title: "Conflict Resolver", description: "Resolve disagreements with empathy", badge: "AI", credits: 4, gradient: "from-amber-500/10 to-orange-500/5" },
  { id: "bucket_list", icon: Map, title: "Bucket List Generator", description: "Create epic adventure lists", badge: "AI", credits: 3, gradient: "from-cyan-500/10 to-blue-500/5" },
  { id: "self_care_planner", icon: Leaf, title: "Self-Care Planner", description: "Personalized wellness routines", badge: "AI", credits: 3, gradient: "from-teal-500/10 to-cyan-500/5" },
  { id: "friendship_analytics", icon: TrendingUp, title: "Friendship Analytics", description: "Stats on your conversations & trends", badge: "AI", credits: 4, gradient: "from-blue-500/10 to-cyan-500/5" },
  { id: "mood_playlist", icon: Music, title: "AI Mood Playlist", description: "Music recommendations by mood", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-fuchsia-500/5" },
  { id: "daily_affirmations", icon: Sunrise, title: "Daily Affirmations", description: "Morning affirmations & reflections", badge: "AI", credits: 2, gradient: "from-yellow-500/10 to-orange-500/5" },
  { id: "friendship_games", icon: Gamepad2, title: "Friendship Mini-Games", description: "Quizzes & fun challenges", badge: "AI", credits: 3, gradient: "from-green-500/10 to-emerald-500/5" },
  { id: "dream_companion", icon: Moon, title: "Dream Companion", description: "Dream sharing & interpretation", badge: "AI", credits: 4, gradient: "from-indigo-500/10 to-violet-500/5" },
  { id: "memory_scrapbook", icon: Camera, title: "Memory Scrapbook", description: "Digital scrapbook of memories", badge: "AI", credits: 3, gradient: "from-rose-500/10 to-red-500/5" },
  { id: "persona", icon: User, title: "Customize Friend", description: "Name, gender, personality, language", badge: "Setup", credits: 0, gradient: "from-purple-500/10 to-pink-500/5" },
  
  { id: "voice_journal", icon: Mic, title: "Voice Journal", description: "Speak, AI analyzes", badge: "AI", credits: 3, gradient: "from-rose-500/10 to-pink-500/5" },
  { id: "photo_share", icon: Camera, title: "Share a Photo", description: "AI reacts to your photos", badge: "AI", credits: 2, gradient: "from-fuchsia-500/10 to-pink-500/5" },
  { id: "memory_vault", icon: Brain, title: "Memory Vault", description: "What AI remembers about you", badge: "AI", credits: 0, gradient: "from-violet-500/10 to-purple-500/5" },
  { id: "roleplay", icon: Drama, title: "Roleplay Scenarios", description: "Practice tough conversations", badge: "AI", credits: 0, gradient: "from-orange-500/10 to-red-500/5" },
  { id: "memory_timeline", icon: Clock, title: "Our Timeline", description: "Every shared moment", badge: "View", credits: 0, gradient: "from-cyan-500/10 to-blue-500/5" },
  { id: "year_report", icon: FileText, title: "Year in Review", description: "AI-generated summary", badge: "AI", credits: 5, gradient: "from-amber-500/10 to-orange-500/5" },
  { id: "crisis_help", icon: AlertTriangle, title: "Crisis Help", description: "Hotlines & safety resources", badge: "Free", credits: 0, gradient: "from-red-500/10 to-rose-500/5" },
];

const BestFriend = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscription, refresh: refreshSubscription, createCheckout, manageSubscription, purchaseMessages } = useBestFriendSubscription();

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessages([{ role: "assistant", content: "Hi! I'm here for you. How are you? 😊" }]);
        setLoadingHistory(false);
        return;
      }
      const { data } = await supabase.from('best_friend_conversations').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages(data.map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content })));
      } else {
        setMessages([{ role: "assistant", content: "Hi! I'm here for you. How are you? 😊" }]);
      }
    } catch { toast.error("Failed to load history"); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setIsLoading(false); return; }
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      });
      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          if (data.requiresSubscription) { setShowSubscriptionDialog(true); setMessages(p => p.slice(0, -1)); setIsLoading(false); return; }
        }
        throw new Error("Failed");
      }
      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", assistantMsg = "";
      setMessages(p => [...p, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim() || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) { assistantMsg += c; setMessages(p => { const n = [...p]; n[n.length - 1] = { role: "assistant", content: assistantMsg }; return n; }); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e: any) { toast.error("Error communicating"); setMessages(p => p.slice(0, -1)); }
    finally { setIsLoading(false); refreshSubscription(); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim(); setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    await streamChat(msg);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const messagesLeft = !subscription.subscribed ? Math.max(0, subscription.freeMessagesLimit - subscription.freeMessagesUsed) : null;

  const renderToolView = () => {
    switch (activeView) {
      case "mood_journal": return <MoodJournalView />;
      case "conversation_starters": return <ConversationStartersView />;
      case "encouragement_cards": return <EncouragementCardsView />;
      case "life_coach": return <LifeCoachView />;
      case "friendship_analytics": return <FriendshipAnalyticsView />;
      case "mood_playlist": return <MoodPlaylistView />;
      case "daily_affirmations": return <DailyAffirmationsView />;
      case "friendship_games": return <FriendshipGamesView />;
      case "dream_companion": return <DreamCompanionView />;
      case "memory_scrapbook": return <MemoryScrapbookView />;
      case "gratitude_garden": return <GratitudeGardenView />;
      case "friendship_horoscope": return <FriendshipHoroscopeView />;
      case "conflict_resolver": return <ConflictResolverView />;
      case "bucket_list": return <BucketListView />;
      case "self_care_planner": return <SelfCarePlannerView />;
      case "persona": return <PersonaSettingsView />;
      case "memory_vault": return <MemoryVaultView />;
      case "roleplay": return <RoleplayScenariosView />;
      case "voice_journal": return <VoiceJournalView />;
      
      case "photo_share": return <PhotoShareView />;
      case "year_report": return <YearReportView />;
      case "memory_timeline": return <MemoryTimelineView />;
      case "crisis_help": return <CrisisResourcesView />;
      case "chat": return renderChat();
      default: return null;
    }
  };

  const renderChat = () => (
    <div className="max-w-4xl mx-auto">
      {/* Subscription status */}
      <div className="mb-4 text-center">
        {subscription.subscribed ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">
              Premium Active • {subscription.monthlyMessagesUsed}/{subscription.monthlyMessagesLimit} msgs
              {subscription.bonusMessages > 0 && ` (+${subscription.bonusMessages} bonus)`}
            </span>
            <Button variant="ghost" size="sm" onClick={manageSubscription} className="ml-2 text-xs">Manage</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">{messagesLeft} free messages remaining</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createCheckout()} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Crown className="w-4 h-4 mr-1" /> Subscribe €9.99/mo
              </Button>
              <Button variant="outline" size="sm" onClick={() => purchaseMessages()}>
                <CreditCard className="w-4 h-4 mr-1" /> +100 msgs €4.99
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20 shadow-lg">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-purple-500/50">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                <Heart className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">Best Friend <Sparkles className="w-4 h-4 text-purple-400" /></CardTitle>
              <p className="text-sm text-muted-foreground">Online • Always here for you</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea ref={scrollRef} className="h-[500px] p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-card/80 backdrop-blur-xl border border-border/50"
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-border/50 p-4">
            <div className="flex gap-2">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Write something..." className="min-h-[60px] resize-none bg-card/50" disabled={isLoading} />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon"
                className="h-[60px] w-[60px] bg-gradient-to-r from-purple-600 to-blue-600">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loadingHistory || subscription.loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 flex items-center justify-center">
        <Heart className="w-12 h-12 text-purple-400 animate-pulse mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <FloatingHowItWorks
        title={'Best Friend'}
        intro={'Find platonic friends nearby based on hobbies and vibes — no dating pressure.'}
        steps={[
          { title: 'Set your interests', desc: "Pick hobbies, availability, and what you're looking for." },
        { title: 'Browse or get matched', desc: 'Swipe friend cards or accept smart suggestions.' },
        { title: 'Chat and plan hangouts', desc: 'Use group chat, event invites, and shared activity lists.' },
        { title: 'Build streaks', desc: 'Regular chats and meetups grow your friendship level.' }
        ]}
      />
      <div className="container mx-auto px-4">
        {activeView ? (
          <div>
            <Button variant="ghost" onClick={() => setActiveView(null)} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Best Friend Hub
            </Button>
            {renderToolView()}
          </div>
        ) : (
          <>
            <BestFriendHero />
            <div className="mb-6"><FriendshipHUD /></div>

            <HeroRewardedAd sectionKey="page_bestfriend" />

            {/* Engagement Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20 text-center p-4">
                  <Heart className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                  <div className="text-2xl font-black">{subscription.subscribed ? "Active" : "Free"}</div>
                  <p className="text-xs text-muted-foreground">Subscription Status</p>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20 text-center p-4">
                  <MessageCircle className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-black">{messages.length}</div>
                  <p className="text-xs text-muted-foreground">Messages Exchanged</p>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20 text-center p-4">
                  <Sparkles className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-black">16</div>
                  <p className="text-xs text-muted-foreground">AI Tools Available</p>
                </Card>
              </motion.div>
            </div>

            {/* Tool Grid */}
            <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Your AI Companion Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {tools.map((tool, i) => (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Card
                    className={`bg-gradient-to-br ${tool.gradient} bg-card/80 backdrop-blur-xl cursor-pointer hover:border-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.97] h-full`}
                    onClick={() => setActiveView(tool.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <tool.icon className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant="outline" className="text-[10px]">{tool.badge}</Badge>
                        {tool.credits > 0 && <Badge variant="secondary" className="text-[10px]">{tool.credits} CR</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20 mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 text-center">What is Best Friend AI?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Best Friend AI is your personal AI companion powered by advanced AI technology. This intelligent chatbot is designed to be your trusted friend who's always available to listen, support, and engage in meaningful conversations. Beyond chat, access specialized AI tools for mood tracking, life coaching, and personalized encouragement.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">✨ Key Features:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Empathetic and supportive conversations</li>
                      <li>AI Mood Journal with emotional pattern analysis</li>
                      <li>Personalized encouragement cards</li>
                      <li>Life coaching & goal-setting sessions</li>
                      <li>AI-generated conversation starters</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2">💰 Pricing:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Chat:</strong> €15/month for 1000 messages</li>
                      <li>• <strong>AI Tools:</strong> 2-4 credits per use</li>
                      <li>• <strong>Extra:</strong> +100 messages for €2</li>
                      <li>• Cancel anytime</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Subscription Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent className="bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" /> Subscribe to Continue
              </DialogTitle>
              <DialogDescription>
                You've used all free messages. Subscribe for €15/month to enjoy 1000 conversations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 mt-0.5" />
                <div><p className="font-medium">1000 Messages/Month</p><p className="text-sm text-muted-foreground">Reset every billing period</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                <div><p className="font-medium">Full Chat History</p><p className="text-sm text-muted-foreground">Conversations always saved</p></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)} className="flex-1">Maybe Later</Button>
              <Button onClick={() => createCheckout()} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                <Crown className="w-4 h-4 mr-2" /> Subscribe Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BestFriend;
