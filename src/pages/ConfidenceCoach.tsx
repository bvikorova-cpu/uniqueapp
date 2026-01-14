import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, RefreshCw, Heart, Star, Target, Zap, Trophy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: Date;
}

const affirmations = [
  "I am capable of achieving great things today.",
  "My confidence grows stronger with every challenge I overcome.",
  "I embrace my uniqueness and let it shine.",
  "I am worthy of success, love, and happiness.",
  "Every step I take brings me closer to my goals.",
  "I trust myself to make the right decisions.",
  "I am resilient and can handle whatever comes my way.",
  "My potential is limitless and I am just getting started.",
  "I radiate confidence, self-respect, and inner harmony.",
  "I choose to focus on what I can control and let go of the rest."
];

const coachingTopics = [
  { icon: Heart, title: "Self-Love", description: "Build a positive relationship with yourself" },
  { icon: Star, title: "Self-Esteem", description: "Recognize your worth and value" },
  { icon: Target, title: "Goal Setting", description: "Define and achieve your dreams" },
  { icon: Zap, title: "Motivation", description: "Stay driven and focused" },
  { icon: Trophy, title: "Success Mindset", description: "Develop a winning attitude" }
];

const ConfidenceCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "coach",
      content: "Welcome! I'm your Confidence Coach. I'm here to help you build self-esteem, overcome limiting beliefs, and unlock your full potential. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

  const generateNewAffirmation = () => {
    const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setDailyAffirmation(newAffirmation);
    toast({
      title: "New Affirmation Generated!",
      description: "Repeat this to yourself throughout the day.",
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great reflection! Remember, self-confidence is built one small step at a time. What specific situation triggered these feelings?",
        "I hear you. It's completely normal to feel this way sometimes. Let's explore what strengths you can draw upon to overcome this challenge.",
        "You're already taking a positive step by discussing this. Self-awareness is the foundation of growth. What would you tell a friend in the same situation?",
        "That's an insightful observation about yourself. Building confidence is a journey, not a destination. What small win can you celebrate today?",
        "I believe in your ability to grow through this. Let's create a small action plan. What's one thing you could do differently tomorrow?"
      ];

      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Confidence Coach
            </h1>
            <p className="text-muted-foreground">AI-powered coaching for self-esteem and mindset</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Affirmation & Topics */}
          <div className="space-y-6">
            {/* Daily Affirmation */}
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-pink-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Daily Affirmation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium italic text-purple-200 mb-4">
                  "{dailyAffirmation}"
                </p>
                <Button 
                  onClick={generateNewAffirmation}
                  variant="outline" 
                  className="w-full border-purple-500/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Affirmation
                </Button>
              </CardContent>
            </Card>

            {/* Coaching Topics */}
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Coaching Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coachingTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-950/30 hover:bg-purple-950/50 cursor-pointer transition-colors"
                    onClick={() => setInput(`I want to work on ${topic.title.toLowerCase()}.`)}
                  >
                    <topic.icon className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-sm">{topic.title}</p>
                      <p className="text-xs text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-purple-500/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{messages.filter(m => m.role === "user").length}</p>
                    <p className="text-xs text-muted-foreground">Messages Sent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-400">∞</p>
                    <p className="text-xs text-muted-foreground">Potential</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <Card className="border-purple-500/30 h-[600px] flex flex-col">
              <CardHeader className="border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-base">Coach Maya</p>
                      <p className="text-xs text-green-400 font-normal">Online</p>
                    </div>
                  </CardTitle>
                  <Badge className="bg-purple-600">AI Coach</Badge>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-purple-600 text-white rounded-br-md"
                            : "bg-purple-950/50 border border-purple-500/30 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-[10px] mt-2 opacity-60">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-purple-950/50 border border-purple-500/30 p-4 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share your thoughts or ask for guidance..."
                    className="min-h-[60px] resize-none bg-purple-950/30 border-purple-500/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceCoach;
