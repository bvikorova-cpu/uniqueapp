import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Shield, MessageCircle, BookOpen, Heart, AlertTriangle, Send, Loader2, Phone,
  GraduationCap, Scale, Gamepad2, Trophy, FileText, Info, HelpCircle,
  CheckCircle, Lock, Globe, Sparkles, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SafetyJournal from "@/components/safety/SafetyJournal";
import SafetyStories from "@/components/safety/SafetyStories";
import SafetyCourses from "@/components/safety/SafetyCourses";
import SafetyLegalInfo from "@/components/safety/SafetyLegalInfo";
import SafetySosContacts from "@/components/safety/SafetySosContacts";
import SafetyRoleplay from "@/components/safety/SafetyRoleplay";
import SafetySupportWall from "@/components/safety/SafetySupportWall";
import SafetyBadges from "@/components/safety/SafetyBadges";
import { SafetyHero } from "@/components/safety/SafetyHero";
import { SafetyAIShield } from "@/components/safety/SafetyAIShield";
import { SafetyParityPack } from "@/components/safety/SafetyParityPack";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface Message {
  role: "user" | "assistant";
  content: string;
}

const SafetyPrevention = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mode, setMode] = useState<"safe" | "crisis">("safe");

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
      setMessages((prev) => [...prev, { role: "assistant", content: data.message || "I'm here to help." }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: MessageCircle, title: "AI Support Chat", description: "Compassionate AI for emotional support, 24/7.", tab: "chat", color: "from-teal-500/20 to-cyan-500/10" },
    { icon: GraduationCap, title: "Interactive Courses", description: "Recognize bullying, respond safely, build resilience.", tab: "courses", color: "from-emerald-500/20 to-teal-500/10" },
    { icon: BookOpen, title: "Story Library", description: "Anonymous stories from people who overcame bullying.", tab: "stories", color: "from-sky-500/20 to-blue-500/10" },
    { icon: Scale, title: "Legal Information", description: "Your rights, country-specific laws & protections.", tab: "legal", color: "from-amber-500/20 to-yellow-500/10" },
    { icon: FileText, title: "Safety Journal", description: "Document incidents, mood & evidence privately.", tab: "journal", color: "from-violet-500/20 to-purple-500/10" },
    { icon: Phone, title: "SOS Contacts", description: "Emergency hotlines & services worldwide.", tab: "sos", color: "from-red-500/20 to-rose-500/10" },
    { icon: Gamepad2, title: "Role-Play Scenarios", description: "Practice safe responses interactively.", tab: "roleplay", color: "from-indigo-500/20 to-blue-500/10" },
    { icon: Heart, title: "Support Wall", description: "Anonymous encouragement, give & receive.", tab: "wall", color: "from-pink-500/20 to-rose-500/10" },
    { icon: Trophy, title: "Badges & Achievements", description: "Track progress, earn recognition.", tab: "badges", color: "from-yellow-500/20 to-amber-500/10" },
  ];

  return (
    <div
      className={`min-h-screen pt-20 transition-colors duration-700 ${
        mode === "crisis"
          ? "bg-gradient-to-b from-red-950/20 via-background to-background"
          : "bg-gradient-to-b from-teal-950/15 via-background to-background"
      }`}
    >
      {/* Crisis Banner — only visible in crisis mode */}
      {mode === "crisis" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 py-3 px-4 text-center"
        >
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-3 text-white">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <p className="font-bold text-sm sm:text-base">
              IN CRISIS? Call <a href="tel:112" className="underline">112</a> / <a href="tel:911" className="underline">911</a> or text HOME to 741741
            </p>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab("sos")} className="bg-white text-red-700 hover:bg-white/90 font-bold">
              SOS Contacts
            </Button>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-6">
        <SafetyHero mode={mode} onModeChange={setMode} />

        <HeroRewardedAd sectionKey="page_safetyprevention" />

        {/* AI Shield - new premium AI tools */}
        <SafetyAIShield />

        {/* Compact Disclaimer */}
        <Alert className="mb-6 border-amber-500/40 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Educational use only — not a replacement for professional help
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            If you're in immediate danger, contact emergency services (911/112) or a crisis hotline.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 justify-start bg-card/50 backdrop-blur-md border border-border/40 p-2">
            <TabsTrigger value="overview" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Info className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <MessageCircle className="h-4 w-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <GraduationCap className="h-4 w-4" /> Courses
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" /> Stories
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Scale className="h-4 w-4" /> Legal
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4" /> Journal
            </TabsTrigger>
            <TabsTrigger value="sos" className="gap-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Phone className="h-4 w-4" /> SOS
            </TabsTrigger>
            <TabsTrigger value="roleplay" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Gamepad2 className="h-4 w-4" /> Role-Play
            </TabsTrigger>
            <TabsTrigger value="wall" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Heart className="h-4 w-4" /> Wall
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Trophy className="h-4 w-4" /> Badges
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab — Cinematic Feature Grid */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.tab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-2xl hover:shadow-teal-500/20 transition-all hover:scale-[1.02] hover:border-teal-400/50 border border-border/40 bg-gradient-to-br ${feature.color} backdrop-blur-md h-full`}
                      onClick={() => setActiveTab(feature.tab)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-card/60 backdrop-blur-md flex items-center justify-center border border-border/40">
                            <Icon className="h-5 w-5 text-teal-400" />
                          </div>
                          <CardTitle className="text-base font-bold text-foreground">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">{feature.description}</p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-teal-400 hover:text-teal-300" onClick={() => { window.location.href = (feature as any).path || `/safety-prevention?tool=${encodeURIComponent(feature.title)}`; }}>
                          Open →
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ + Quick Start in tighter layout */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/40 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4 text-teal-400" /> FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="who">
                      <AccordionTrigger className="text-sm">Who is this for?</AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        Victims, bystanders, parents, educators — anyone affected by bullying. All ages, teen-appropriate.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="privacy">
                      <AccordionTrigger className="text-sm flex items-center gap-2"><Lock className="w-3 h-3" /> Is it private?</AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        Journal entries are private. Stories & wall posts are anonymous. Chat is not stored permanently.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="account">
                      <AccordionTrigger className="text-sm">Do I need an account?</AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        Browse Legal & SOS without an account. Interactive features need sign-in to save progress.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ai-credits">
                      <AccordionTrigger className="text-sm flex items-center gap-2"><Sparkles className="w-3 h-3 text-teal-400" /> AI tools cost?</AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        New users get 20 free credits. Each AI tool costs 8–15 credits. Top up anytime in Settings.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="border-teal-500/30 bg-teal-500/5 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4 text-teal-400" /> Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-xs">
                    <li><strong>Need support?</strong> → <Button variant="link" className="p-0 h-auto text-teal-400 text-xs" onClick={() => setActiveTab("chat")}>AI Chat</Button></li>
                    <li><strong>Decode a bullying message?</strong> → Open <strong className="text-orange-400">Bully Decoder</strong> above</li>
                    <li><strong>Build evidence for school?</strong> → Open <strong className="text-amber-400">Evidence Builder</strong></li>
                    <li><strong>Practice responses?</strong> → Open <strong className="text-cyan-400">Response Coach</strong></li>
                    <li><strong>In crisis?</strong> → Toggle <strong className="text-red-400">Crisis Mode</strong> in hero</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="border-border/40 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-teal-400" /> Confidential Support Chat
                </CardTitle>
                <CardDescription className="text-xs">
                  Compassionate AI assistant — listens without judgment. Not a replacement for professional help.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border border-border/40 rounded-lg p-4 mb-4 bg-background/50">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-teal-400/60" />
                      <p className="text-lg font-medium">You're not alone.</p>
                      <p className="mt-2 text-sm">Start a conversation whenever you're ready.</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 max-w-md mx-auto">
                        {[
                          "I'm being bullied at school and don't know what to do",
                          "My friend is being bullied, how can I help?",
                          "I'm feeling overwhelmed and anxious",
                          "How do I report cyberbullying?",
                        ].map((q) => (
                          <Button
                            key={q}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-2 whitespace-normal border-teal-500/30 hover:bg-teal-500/10"
                            onClick={() => setInput(q)}
                          >
                            {q.length > 30 ? q.slice(0, 30) + "…" : q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user" ? "bg-teal-600 text-white" : "bg-card border border-border/40"}`}>
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-card border border-border/40 rounded-2xl px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
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
                    placeholder="Share what's on your mind..."
                    className="flex-1 bg-background/50 border-border/40"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="lg" className="bg-teal-600 hover:bg-teal-500">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses"><SafetyCourses /></TabsContent>
          <TabsContent value="stories"><SafetyStories /></TabsContent>
          <TabsContent value="legal"><SafetyLegalInfo /></TabsContent>
          <TabsContent value="journal"><SafetyJournal /></TabsContent>
          <TabsContent value="sos"><SafetySosContacts /></TabsContent>
          <TabsContent value="roleplay"><SafetyRoleplay /></TabsContent>
          <TabsContent value="wall"><SafetySupportWall /></TabsContent>
          <TabsContent value="badges"><SafetyBadges /></TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="mt-8 border-border/40 bg-card/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Global Resource</p>
                <p className="text-xs">
                  Designed to help worldwide. Laws & resources vary by country — always check local regulations and seek professional help when needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyPrevention;
