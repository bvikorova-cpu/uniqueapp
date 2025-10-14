import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  ArrowLeft,
  Target,
  TrendingUp,
  Calendar,
  Plus,
} from "lucide-react";

const AIMentorChat = () => {
  const { area } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, [area]);

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

      // Check subscription
      const { data: sub } = await supabase
        .from('mentor_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mentor_area', area as any)
        .eq('status', 'active')
        .maybeSingle();

      if (!sub) {
        toast({
          title: "Subscription required",
          description: "You need an active subscription for this mentor area",
        });
        navigate('/subscription');
        return;
      }

      // Load session and data
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
        body: {
          message: userMessage,
          mentorArea: area,
          sessionId,
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI mentor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/ai-mentor')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentors
          </Button>
          <Badge variant="outline" className="capitalize">
            {area} Coach
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader>
                <CardTitle>AI Mentor Session</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <p>Start a conversation with your AI mentor!</p>
                      <p className="text-sm mt-2">Ask questions, share your progress, or discuss challenges.</p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="checkins">Check-ins</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Your Goals
                      </CardTitle>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No goals set yet</p>
                    ) : (
                      goals.slice(0, 5).map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm">{goal.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {goal.progress}%
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Progress Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your metrics and see your growth over time
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkins">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Daily Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {checkins.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No check-ins yet</p>
                    ) : (
                      checkins.map((checkin) => (
                        <div key={checkin.id} className="border rounded-lg p-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(checkin.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentorChat;