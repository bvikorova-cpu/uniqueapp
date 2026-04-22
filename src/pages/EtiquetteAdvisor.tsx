import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, ArrowLeft, Send, Sparkles, Heart, Briefcase, Utensils, Wine, Users, MessageCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "advisor";
  content: string;
  timestamp: Date;
}

interface EtiquetteTopic {
  icon: React.ElementType;
  title: string;
  description: string;
  quickTips: string[];
}

const etiquetteTopics: EtiquetteTopic[] = [
  {
    icon: Heart,
    title: "Weddings",
    description: "Navigate wedding ceremonies, receptions, and gift-giving",
    quickTips: [
      "RSVP promptly by the deadline specified",
      "Arrive 15-30 minutes before the ceremony",
      "Put your phone on silent during the ceremony",
      "Don't wear white unless specified",
      "Gift should match your relationship & the invite cost"
    ]
  },
  {
    icon: Utensils,
    title: "Formal Dining",
    description: "Master table manners and fine dining etiquette",
    quickTips: [
      "Work from the outside in with silverware",
      "Napkin goes on lap immediately when seated",
      "Wait for host to start eating",
      "Keep elbows off the table",
      "Thank the host before leaving"
    ]
  },
  {
    icon: Briefcase,
    title: "Business Meetings",
    description: "Professional conduct in corporate settings",
    quickTips: [
      "Arrive 5 minutes early",
      "Prepare and review agenda beforehand",
      "Silence your phone",
      "Make eye contact when speaking",
      "Follow up with action items within 24 hours"
    ]
  },
  {
    icon: Wine,
    title: "Cocktail Parties",
    description: "Social etiquette for networking events",
    quickTips: [
      "Greet the host first upon arrival",
      "Keep food/drink in left hand for handshakes",
      "Mingle and don't monopolize one person",
      "Limit alcohol consumption",
      "Thank the host when leaving"
    ]
  },
  {
    icon: Users,
    title: "Cultural Customs",
    description: "Respectful behavior across different cultures",
    quickTips: [
      "Research customs before traveling",
      "Learn basic greetings in local language",
      "Observe dress codes at religious sites",
      "Accept hospitality graciously",
      "Ask politely when unsure"
    ]
  }
];

const EtiquetteAdvisor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "advisor",
      content: "Welcome to the Etiquette Advisor! I'm here to help you navigate any social situation with grace and confidence. Whether it's a formal dinner, business meeting, or cultural event, feel free to ask me anything about proper etiquette.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<EtiquetteTopic | null>(null);

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

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = "";
      const query = input.toLowerCase();

      if (query.includes("wedding") || query.includes("bride") || query.includes("groom")) {
        response = "For wedding etiquette: Always RSVP on time, arrive 15-30 minutes early to the ceremony, dress appropriately (avoid white unless told otherwise), put your phone on silent, and be present during the ceremony. For gifts, consider the couple's registry and your relationship with them. Would you like more specific advice about a particular aspect of wedding etiquette?";
      } else if (query.includes("dinner") || query.includes("table") || query.includes("eating")) {
        response = "Formal dining etiquette basics: Start with silverware from the outside and work inward. Place your napkin on your lap when seated. Wait for the host to begin eating. Keep elbows off the table during the meal. For wine, hold the glass by the stem. Is there a specific dining situation you'd like me to address?";
      } else if (query.includes("business") || query.includes("meeting") || query.includes("interview")) {
        response = "Professional etiquette tips: Arrive 5 minutes early, dress appropriately for the company culture, maintain good eye contact, silence your phone, and prepare talking points in advance. After meetings, send a follow-up email within 24 hours summarizing key points and action items. What specific business situation are you preparing for?";
      } else if (query.includes("thank") || query.includes("gift")) {
        response = "Thank you note etiquette: Send handwritten notes within 2 weeks of receiving a gift or attending an event. Be specific about what you're thanking them for, mention how you'll use the gift if applicable, and express genuine appreciation. Digital thanks are acceptable for casual situations, but formal occasions warrant a written note.";
      } else {
        response = "That's a great question about social etiquette. The key principles are: be considerate of others, arrive on time, dress appropriately for the occasion, listen actively, and express gratitude. Could you tell me more about the specific situation you're navigating so I can provide tailored advice?";
      }

      const advisorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "advisor",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, advisorResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Event Etiquette Advisor
            </h1>
            <p className="text-muted-foreground">Your AI guide to social grace and proper conduct</p>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="chat">Ask Anything</TabsTrigger>
            <TabsTrigger value="guides">Quick Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Topics */}
              <div className="space-y-4">
                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-amber-400" />
                      Quick Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "Wedding guest etiquette",
                      "Business meeting conduct",
                      "Formal dinner rules",
                      "Thank you note timing",
                      "Gift giving guidelines",
                      "Introductions & handshakes"
                    ].map((topic, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => setInput(`What's the proper etiquette for ${topic.toLowerCase()}?`)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-amber-400" />
                        {topic}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat */}
              <div className="lg:col-span-2">
                <Card className="border-amber-500/30 h-[600px] flex flex-col">
                  <CardHeader className="border-b border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Etiquette Advisor</p>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
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
                                ? "bg-amber-600 text-white rounded-br-md"
                                : "bg-amber-950/50 border border-amber-500/30 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-[10px] mt-2 opacity-60">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-amber-950/50 border border-amber-500/30 p-4 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100" />
                              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-amber-500/20">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about any social situation or etiquette question..."
                        className="min-h-[60px] resize-none bg-amber-950/30 border-amber-500/30"
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
                        className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {etiquetteTopics.map((topic, index) => (
                <Card 
                  key={index}
                  className="border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <topic.icon className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.quickTips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-amber-400 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                    <Button variant="ghost" className="w-full mt-4 text-amber-400" onClick={() => console.info("[Coming soon] View All Tips →")}>
                      View All Tips →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Topic Detail Modal */}
            {selectedTopic && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg border-amber-500/30 bg-background">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <selectedTopic.icon className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                          <CardTitle>{selectedTopic.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">{selectedTopic.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Essential Tips
                    </h4>
                    <ul className="space-y-3">
                      {selectedTopic.quickTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/30">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => setSelectedTopic(null)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EtiquetteAdvisor;
