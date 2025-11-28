import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  MessageCircle, 
  BookOpen, 
  Heart, 
  AlertTriangle,
  Send,
  Loader2,
  Phone,
  Globe,
  Users,
  FileText,
  Brain,
  HandHeart,
  Scale,
  Lightbulb
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SafetyPrevention = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("safety-prevention-chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "I'm here to help. Please tell me more about your situation.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resources = [
    {
      title: "International Resources",
      icon: Globe,
      items: [
        { name: "UNICEF - End Violence", url: "https://www.unicef.org/end-violence", description: "Global initiative to end violence against children" },
        { name: "StopBullying.gov", url: "https://www.stopbullying.gov", description: "US government anti-bullying resource" },
        { name: "Childline International", url: "https://www.childlineinternational.org", description: "Global network of child helplines" },
        { name: "PACER's National Bullying Prevention Center", url: "https://www.pacer.org/bullying", description: "Resources and support for bullying prevention" },
      ],
    },
    {
      title: "Crisis Hotlines",
      icon: Phone,
      items: [
        { name: "Crisis Text Line", url: "https://www.crisistextline.org", description: "Text HOME to 741741 (US)" },
        { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres", description: "Find crisis centers worldwide" },
        { name: "Kids Help Phone", url: "https://kidshelpphone.ca", description: "1-800-668-6868 (Canada)" },
        { name: "Childline UK", url: "https://www.childline.org.uk", description: "0800 1111 (UK)" },
      ],
    },
  ];

  const educationalContent = [
    {
      title: "Understanding Bullying",
      icon: Brain,
      content: "Bullying is unwanted, aggressive behavior that involves a real or perceived power imbalance. It includes actions such as making threats, spreading rumors, attacking someone physically or verbally, and excluding someone from a group on purpose.",
    },
    {
      title: "Types of Bullying",
      icon: FileText,
      content: "Physical bullying (hitting, kicking), Verbal bullying (name-calling, teasing), Social bullying (spreading rumors, exclusion), Cyberbullying (online harassment, sharing embarrassing content).",
    },
    {
      title: "Warning Signs",
      icon: AlertTriangle,
      content: "Unexplained injuries, lost or destroyed belongings, changes in eating habits, difficulty sleeping, declining grades, loss of friends, feelings of helplessness, self-destructive behaviors.",
    },
    {
      title: "Self-Defense Basics",
      icon: Shield,
      content: "Self-defense is not just physical - it includes setting boundaries, speaking up, seeking help, and building confidence. Remember: your safety is the priority. Avoid confrontation when possible and always report incidents to trusted adults.",
    },
  ];

  const safetyTips = [
    { icon: Users, title: "Stay in Groups", description: "There's safety in numbers. Walk with friends and avoid isolated areas." },
    { icon: HandHeart, title: "Trust Your Instincts", description: "If something feels wrong, it probably is. Remove yourself from uncomfortable situations." },
    { icon: Scale, title: "Know Your Rights", description: "Everyone has the right to feel safe. Schools and workplaces have policies against bullying." },
    { icon: Lightbulb, title: "Document Everything", description: "Keep records of incidents - dates, times, what happened, and any witnesses." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Critical Disclaimer Banner */}
      <div className="bg-destructive text-destructive-foreground py-4 px-4">
        <div className="container mx-auto">
          <Alert variant="destructive" className="border-2 border-destructive-foreground bg-destructive">
            <AlertTriangle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">⚠️ IMPORTANT DISCLAIMER ⚠️</AlertTitle>
            <AlertDescription className="text-lg font-semibold mt-2">
              This service is for informational and educational purposes only. It DOES NOT REPLACE professional psychological, 
              psychiatric, or medical treatment. If you are in crisis, experiencing abuse, or need immediate help, 
              please contact emergency services (911/112) or a professional crisis hotline immediately. 
              Always consult qualified professionals for mental health concerns.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Safety & Bullying Prevention</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A global resource for bullying prevention, self-defense education, and emotional support.
            Together we can create a safer world for everyone.
          </p>
        </div>

        {/* Disclaimer Card */}
        <Card className="mb-8 border-4 border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-2xl">
              <AlertTriangle className="h-8 w-8" />
              Professional Help Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-destructive">
              🚨 THIS SERVICE DOES NOT REPLACE PROFESSIONAL PSYCHOLOGICAL OR PSYCHIATRIC TREATMENT 🚨
            </p>
            <p className="mt-4 text-muted-foreground">
              The AI assistant and resources provided here are for general information and emotional support only. 
              They are not a substitute for professional medical advice, diagnosis, or treatment. 
              If you or someone you know is in immediate danger, please contact emergency services immediately.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="destructive" className="text-sm">Not Medical Advice</Badge>
              <Badge variant="destructive" className="text-sm">Educational Only</Badge>
              <Badge variant="destructive" className="text-sm">Seek Professional Help</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Support Chat
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Tips
            </TabsTrigger>
          </TabsList>

          {/* AI Support Chat */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Confidential Support Chat
                </CardTitle>
                <CardDescription>
                  Talk to our AI support assistant about bullying, safety concerns, or if you just need someone to listen.
                  <span className="block mt-2 text-destructive font-semibold">
                    ⚠️ This is not a replacement for professional help. If you're in crisis, please contact emergency services.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-lg p-4 mb-4 bg-muted/30">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p>You're not alone. Start a conversation whenever you're ready.</p>
                      <p className="text-sm mt-2">Everything shared here is confidential.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share what's on your mind... (Press Enter to send)"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Educational Content */}
          <TabsContent value="education">
            <div className="grid gap-6 md:grid-cols-2">
              {educationalContent.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <a
                          key={itemIndex}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <p className="font-semibold text-primary hover:underline">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Safety Tips */}
          <TabsContent value="tips">
            <div className="grid gap-6 md:grid-cols-2">
              {safetyTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {tip.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Safety Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>What To Do If You're Being Bullied</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li><strong>Tell someone you trust</strong> - a parent, teacher, counselor, or trusted adult</li>
                  <li><strong>Don't respond or retaliate</strong> - this can escalate the situation</li>
                  <li><strong>Keep evidence</strong> - save messages, take screenshots, document incidents</li>
                  <li><strong>Block online bullies</strong> - use platform tools to block and report</li>
                  <li><strong>Stay safe</strong> - avoid being alone in areas where bullying occurs</li>
                  <li><strong>Build a support network</strong> - connect with friends and supportive people</li>
                  <li><strong>Practice self-care</strong> - take care of your mental and physical health</li>
                  <li><strong>Know it's not your fault</strong> - bullying is about the bully, not you</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Disclaimer */}
        <Card className="mt-8 border-4 border-amber-500 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-bold mb-2">Remember</h3>
              <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                This platform provides educational information and AI-based emotional support only. 
                It is NOT a substitute for professional psychological, psychiatric, or medical treatment. 
                If you are experiencing a mental health crisis, please seek professional help immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyPrevention;
