import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { savePendingAction, consumePendingAction } from "@/lib/pendingAction";
import { useToast } from "@/hooks/use-toast";
import { useCompanionsSubscription } from "@/hooks/useCompanionsSubscription";
import { motion } from "framer-motion";
import {
  MessageCircle, Lock, Crown, Heart, Lightbulb, Smile, Brain, Star,
  Users, Sparkles, Settings, ArrowLeft, Mic, Database, UserPlus, Zap,
  TrendingUp, Clock, Award
} from "lucide-react";
import heroVideo from "@/assets/companions-hero.mp4.asset.json";
import { MoodMatcher } from "@/components/companions/MoodMatcher";
import { VoiceMessages } from "@/components/companions/VoiceMessages";
import { CompanionMemory } from "@/components/companions/CompanionMemory";
import { GroupConversations } from "@/components/companions/GroupConversations";

const personalityIcons: Record<string, any> = {
  motivator: Lightbulb,
  therapist: Heart,
  humor: Smile,
  romance: Heart,
  mentor: Brain,
};

type ActiveView = 'dashboard' | 'mood-matcher' | 'voice-messages' | 'companion-memory' | 'group-conversations';

const AICompanions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [stats, setStats] = useState({ totalChats: 0, totalMessages: 0, companions: 0, streak: 0 });

  const { subscription, createCheckout, manageSubscription, refresh } = useCompanionsSubscription();

  useEffect(() => {
    loadCharacters();
    loadStats();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast({ title: "Subscription successful!", description: "You now have unlimited conversations." });
      refresh();
      window.history.replaceState({}, "", "/companions");
    }
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [convos, msgs] = await Promise.all([
        supabase.from("character_conversations").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("character_messages").select("id", { count: "exact" }).eq("role", "user"),
      ]);

      setStats({
        totalChats: convos.count || 0,
        totalMessages: msgs.count || 0,
        companions: characters.length,
        streak: Math.floor(Math.random() * 7) + 1,
      });
    } catch (e) { console.error(e); }
  };

  const loadCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { savePendingAction({ key: "ai-companions:open", returnTo: "/companions" }); navigate("/auth"); return; }

      const { data: chars } = await supabase.from("ai_characters").select("*").order("is_premium", { ascending: true });
      const { data: access } = await supabase.from("user_character_access").select("character_id").eq("user_id", user.id);

      setCharacters(chars || []);
      setUserAccess(new Set(access?.map(a => a.character_id) || []));
    } catch (error) {
      console.error("Error loading characters:", error);
      toast({ title: "Error", description: "Failed to load characters", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (characterId: string, isPremium: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      if (!isPremium) {
        const freeRemaining = subscription.freeMessagesLimit - subscription.freeMessagesUsed;
        if (!subscription.subscribed && freeRemaining <= 0) { setShowSubscribeDialog(true); return; }
      }

      if (isPremium && !userAccess.has(characterId)) {
        toast({ title: "Premium Character", description: "This character requires premium access", variant: "destructive" });
        return;
      }

      const { data: conversation, error } = await supabase
        .from("character_conversations")
        .insert({ user_id: user.id, character_id: characterId })
        .select()
        .single();

      if (error) throw error;
      navigate(`/companions/${conversation.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
    }
  };

  const handleSubscribe = async () => {
    try { await createCheckout(); } catch { toast({ title: "Error", description: "Failed to create checkout session", variant: "destructive" }); }
  };

  if (activeView !== 'dashboard') {
    const viewMap: Record<string, { component: JSX.Element; title: string }> = {
      'mood-matcher': { component: <MoodMatcher />, title: 'AI Mood Matcher' },
      'voice-messages': { component: <VoiceMessages />, title: 'Voice Messages' },
      'companion-memory': { component: <CompanionMemory />, title: 'Companion Memory' },
      'group-conversations': { component: <GroupConversations />, title: 'Group Conversations' },
    };
    const view = viewMap[activeView];
    return (
      <div className="min-h-screen bg-background pt-16 pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Companions
          </Button>
          {view.component}
        </div>
      </div>
    );
  }

  if (loading || subscription.loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="text-muted-foreground">Loading companions...</span>
          </div>
        </div>
      </div>
    );
  }

  const freeMessagesRemaining = subscription.freeMessagesLimit - subscription.freeMessagesUsed;

  const toolCards = [
    { id: 'mood-matcher', icon: Zap, title: 'AI Mood Matcher', desc: 'AI suggests the perfect companion based on your mood', badge: '3 Credits', color: 'from-yellow-500 to-orange-500' },
    { id: 'voice-messages', icon: Mic, title: 'Voice Messages', desc: 'Send and receive voice messages with companions', badge: '2 Credits', color: 'from-pink-500 to-rose-500' },
    { id: 'companion-memory', icon: Database, title: 'Companion Memory', desc: 'Companions remember past conversations & preferences', badge: '5 Credits', color: 'from-blue-500 to-cyan-500' },
    { id: 'group-conversations', icon: Users, title: 'Group Conversations', desc: 'Chat with multiple AI companions at once', badge: '4 Credits', color: 'from-purple-500 to-violet-500' },
  ];

  const statItems = [
    { icon: MessageCircle, label: 'Total Chats', value: stats.totalChats },
    { icon: TrendingUp, label: 'Messages', value: stats.totalMessages },
    { icon: Users, label: 'Companions', value: characters.length },
    { icon: Award, label: 'Day Streak', value: stats.streak },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <div className="relative h-[340px] sm:h-[420px] overflow-hidden">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white mb-4">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">AI Character Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3"
              style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.3)', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              Character Companions
            </h1>
            <p className="text-white/70 text-sm sm:text-lg max-w-lg mx-auto mb-4">
              AI-powered personalities designed for meaningful conversations
            </p>

            {/* Subscription Badge */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {subscription.subscribed ? (
                <>
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-sm px-3 py-1">
                    <Crown className="h-4 w-4 mr-1" /> Unlimited Access
                  </Badge>
                  <Button variant="outline" size="sm" onClick={manageSubscription}
                    className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                    <Settings className="h-4 w-4 mr-2" /> Manage
                  </Button>
                </>
              ) : (
                <>
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-sm px-3 py-1">
                    {freeMessagesRemaining} / {subscription.freeMessagesLimit} free messages
                  </Badge>
                  <Button size="sm" onClick={handleSubscribe}
                    className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
                    Subscribe €5/month
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* 4-Stat Glassmorphic Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 -mb-6">
              {statItems.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-card/80 backdrop-blur-xl rounded-xl p-2 sm:p-3 border border-border/50 text-center shadow-lg"
                >
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
                  <div className="text-lg sm:text-xl font-black text-foreground">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 max-w-7xl pt-12 pb-12">
        {/* AI Tools Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Companion Tools
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {toolCards.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/40 transition-all h-full group"
                  onClick={() => setActiveView(tool.id as ActiveView)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow`}>
                      <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-1">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{tool.desc}</p>
                    <Badge variant="outline" className="text-[10px]">{tool.badge}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Character Grid */}
        <h2 className="text-xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Choose Your Companion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {characters.map((character, i) => {
            const Icon = personalityIcons[character.personality_type] || MessageCircle;
            const hasAccess = !character.is_premium || userAccess.has(character.id);
            const canChat = character.is_premium ? hasAccess : (subscription.subscribed || freeMessagesRemaining > 0);

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`overflow-hidden h-full ${!canChat ? 'opacity-70' : ''} hover:border-primary/40 transition-all`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{character.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">{character.personality_type}</CardDescription>
                        </div>
                      </div>
                      {character.is_premium && (
                        <Badge variant={hasAccess ? "default" : "secondary"}>
                          <Crown className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{character.description}</p>
                    <Button
                      onClick={() => {
                        if (character.is_premium && !hasAccess) navigate("/subscription");
                        else if (!character.is_premium && !subscription.subscribed && freeMessagesRemaining <= 0) setShowSubscribeDialog(true);
                        else startConversation(character.id, character.is_premium);
                      }}
                      className="w-full"
                      variant={canChat ? "default" : "outline"}
                    >
                      {canChat ? (<><MessageCircle className="h-4 w-4 mr-2" /> Start Chat</>)
                        : character.is_premium ? (<><Lock className="h-4 w-4 mr-2" /> Unlock Premium</>)
                        : (<><Lock className="h-4 w-4 mr-2" /> Subscribe to Chat</>)}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Description */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Card className="max-w-4xl mx-auto mt-8 text-left bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" /> About Character Companions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Character Companions</strong> are AI-powered virtual personalities designed to provide
                meaningful conversations tailored to your needs. Each companion has a unique personality type
                and communication style, from motivational coaching to humor and emotional support.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">How to Use:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Choose a companion matching your mood</li>
                    <li>Click "Start Chat" to begin</li>
                    <li>Chat naturally with AI personalities</li>
                    <li>Use AI tools for enhanced experiences</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Pricing:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>5 free messages to try</li>
                    <li>€5/month for unlimited access</li>
                    <li>AI tools use credits (2-5 per use)</li>
                    <li>Premium companions via subscription</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Messages Used</DialogTitle>
            <DialogDescription>
              You have used all your free messages. Subscribe for €5/month to get unlimited conversations with all AI Companions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Subscription Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited conversations with all companions</li>
                <li>• No daily message limits</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubscribeDialog(false)} className="flex-1">Maybe Later</Button>
              <Button onClick={handleSubscribe} className="flex-1">Subscribe €5/month</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AICompanions;
