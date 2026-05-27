import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Send,
  ArrowLeft,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

const AIMentorChat = () => {
  const { area } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    if (!adminLoading) {
      checkUser();
    }
  }, [area, isAdmin, adminLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);

      if (!isAdmin) {
        const { data: subData } = await supabase.functions.invoke('mentor-router', {
          body: { action: 'premium.check', area: area as string },
        });
        if (!subData?.subscribed) {
          toast({
            title: "Subscription required",
            description: "You need an active subscription for this mentor area",
          });
          navigate('/ai-mentor/premium');
          return;
        }
      }

      await loadSession(user.id);
      await loadGoals(user.id);
      await loadCheckins(user.id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSession = async (userId: string) => {
    const { data } = await supabase
      .from('mentor_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('mentor_area', area as any)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSessionId(data.id);
      const msgs = data.messages as any;
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
  };

  const loadGoals = async (userId: string) => {
    const { data } = await supabase
      .from('mentor_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('mentor_area', area as any)
      .order('created_at', { ascending: false });
    setGoals(data || []);
  };

  const loadCheckins = async (userId: string) => {
    const { data } = await supabase
      .from('mentor_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('mentor_area', area as any)
      .order('created_at', { ascending: false })
      .limit(10);
    setCheckins(data || []);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading || !user) return;

    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor-chat', {
        body: { message: userMessage, mentorArea: area, sessionId },
      });

      if (error) throw error;
      const replyText = data?.message || data?.text || data?.result || data?.content || "I'm here to help.";
      setMessages(prev => [...prev, { role: "assistant", content: replyText }]);
      if (data?.sessionId) setSessionId(data.sessionId);
    } catch (error: any) {
      console.error('Error:', error);
      // Restore the user's message so they can retry
      setMessage(userMessage);
      setMessages(prev => prev.slice(0, -1));
      toast({
        title: "Failed to send",
        description: error?.message || "Could not reach the AI mentor. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!user) return;
    const goalTitle = window.prompt("What goal do you want to set?");
    if (!goalTitle?.trim()) return;
    try {
      const { error } = await supabase.from('mentor_goals').insert({
        user_id: user.id,
        mentor_area: area as any,
        title: goalTitle.trim(),
        progress: 0,
        status: 'active',
      });
      if (error) throw error;
      toast({ description: `Goal "${goalTitle.trim()}" added!` });
      await loadGoals(user.id);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not save goal", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "What should I focus on this week?",
    "Help me set a new goal",
    "I need motivation today",
    "Review my progress so far",
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-4">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/ai-mentor')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Mentors
          </Button>
          <Badge variant="outline" className="capitalize bg-primary/10 border-primary/20 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            {area} Coach
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col backdrop-blur-xl bg-card/80 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  AI Mentor Session
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Bot className="h-8 w-8 text-primary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Start a conversation with your AI mentor!</p>
                      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                        {suggestedPrompts.map((q, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            onClick={() => setMessage(q)}
                            className="text-left text-xs p-2.5 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                          >
                            <Sparkles className="w-3 h-3 text-primary inline mr-1.5" />
                            {q}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                          ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                          {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm
                          ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border border-border/50 rounded-tl-sm'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="min-h-[50px] max-h-[120px] resize-none rounded-xl"
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !message.trim()} size="icon" className="h-[50px] w-[50px] rounded-xl">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="checkins">Check-ins</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                <Card className="backdrop-blur-xl bg-card/80 border-border/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Your Goals
                      </CardTitle>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleAddGoal}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goals.length === 0 ? (
                      <div className="text-center py-6">
                        <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No goals set yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Ask your mentor to help set goals!</p>
                      </div>
                    ) : (
                      goals.slice(0, 5).map((goal) => (
                        <div key={goal.id} className="rounded-xl border border-border/30 p-3 bg-muted/10">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm">{goal.title}</p>
                            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
                              {goal.progress}%
                            </Badge>
                          </div>
                          <Progress value={goal.progress} className="h-1.5" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card className="backdrop-blur-xl bg-card/80 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Progress Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Track your metrics and see your growth over time</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkins">
                <Card className="backdrop-blur-xl bg-card/80 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" /> Daily Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {checkins.length === 0 ? (
                      <div className="text-center py-6">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No check-ins yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Complete daily check-ins with your mentor!</p>
                      </div>
                    ) : (
                      checkins.map((checkin) => (
                        <div key={checkin.id} className="rounded-xl border border-border/30 p-3 bg-muted/10">
                          <span className="text-xs text-muted-foreground">
                            {new Date(checkin.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-4 text-sm mt-1">
                            <div>
                              <span className="text-muted-foreground">Mood:</span>{" "}
                              <span className="font-medium">{checkin.mood_score}/10</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Energy:</span>{" "}
                              <span className="font-medium">{checkin.energy_level}/10</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIMentorChat;
