import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, MessageCircle, BookOpen, Heart, AlertTriangle, Send, Loader2, Phone, 
  Users, GraduationCap, Scale, Gamepad2, Trophy, FileText, Info, HelpCircle,
  CheckCircle, Lock, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SafetyJournal from "@/components/safety/SafetyJournal";
import SafetyStories from "@/components/safety/SafetyStories";
import SafetyCourses from "@/components/safety/SafetyCourses";
import SafetyLegalInfo from "@/components/safety/SafetyLegalInfo";
import SafetySosContacts from "@/components/safety/SafetySosContacts";
import SafetyRoleplay from "@/components/safety/SafetyRoleplay";
import SafetySupportWall from "@/components/safety/SafetySupportWall";
import SafetyBadges from "@/components/safety/SafetyBadges";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SafetyPrevention = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    {
      icon: MessageCircle,
      title: "AI Support Chat",
      description: "Chat with our compassionate AI assistant for emotional support, coping strategies, and guidance. Available 24/7 for immediate help.",
      tab: "chat"
    },
    {
      icon: GraduationCap,
      title: "Interactive Courses",
      description: "Learn to recognize bullying, respond safely, and build resilience through structured lessons with quizzes. Track your progress and earn badges.",
      tab: "courses"
    },
    {
      icon: BookOpen,
      title: "Story Library",
      description: "Read anonymous stories from others who have overcome bullying. Share your own experience to help and inspire others.",
      tab: "stories"
    },
    {
      icon: Scale,
      title: "Legal Information",
      description: "Understand your rights as a victim of bullying. Learn about laws and protections in different countries.",
      tab: "legal"
    },
    {
      icon: FileText,
      title: "Safety Journal",
      description: "Document incidents, track your mood, and collect evidence. Your entries are private and can help when reporting.",
      tab: "journal"
    },
    {
      icon: Phone,
      title: "SOS Contacts",
      description: "Access emergency hotlines and support services worldwide. Find help in your country instantly.",
      tab: "sos"
    },
    {
      icon: Gamepad2,
      title: "Role-Play Scenarios",
      description: "Practice handling difficult situations in a safe environment. Learn what to do through interactive decision-making.",
      tab: "roleplay"
    },
    {
      icon: Heart,
      title: "Support Wall",
      description: "Post and read anonymous messages of encouragement. Support others and receive support from the community.",
      tab: "wall"
    },
    {
      icon: Trophy,
      title: "Badges & Achievements",
      description: "Track your progress and earn badges for completing courses, sharing stories, and supporting others.",
      tab: "badges"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Critical Disclaimer Banner */}
      <div className="bg-destructive py-4 px-4">
        <div className="container mx-auto">
          <Alert variant="destructive" className="border-2 border-white/30 bg-destructive">
            <AlertTriangle className="h-6 w-6 text-white" />
            <AlertTitle className="text-xl font-bold text-white">⚠️ IMPORTANT DISCLAIMER ⚠️</AlertTitle>
            <AlertDescription className="text-lg font-semibold mt-2 text-white">
              This service is for informational and educational purposes only. It DOES NOT REPLACE professional psychological, 
              psychiatric, or medical treatment. If you are in crisis, contact emergency services (911/112) or a crisis hotline immediately.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Safety & Bullying Prevention</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive global resource for bullying prevention, self-defense education, and emotional support.
            All features are fully functional and designed to help you stay safe.
          </p>
        </div>

        {/* Professional Help Disclaimer Card */}
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
            <p className="mt-2 text-muted-foreground">
              While our tools can provide support and education, they are not a substitute for professional mental health services.
              If you are experiencing severe distress, thoughts of self-harm, or are in immediate danger, please contact emergency services or a mental health professional immediately.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="destructive">Not Medical Advice</Badge>
              <Badge variant="destructive">Educational Only</Badge>
              <Badge variant="destructive">Seek Professional Help for Serious Issues</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 justify-start bg-muted/50 p-2">
            <TabsTrigger value="overview" className="gap-1">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-1">
              <GraduationCap className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1">
              <BookOpen className="h-4 w-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-1">
              <Scale className="h-4 w-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-1">
              <FileText className="h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="sos" className="gap-1">
              <Phone className="h-4 w-4" />
              SOS
            </TabsTrigger>
            <TabsTrigger value="roleplay" className="gap-1">
              <Gamepad2 className="h-4 w-4" />
              Role-Play
            </TabsTrigger>
            <TabsTrigger value="wall" className="gap-1">
              <Heart className="h-4 w-4" />
              Support Wall
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  How to Use This Section
                </CardTitle>
                <CardDescription>
                  A complete guide to all available features and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-lg">
                    Welcome to our Safety & Bullying Prevention center. This section provides comprehensive tools 
                    and resources to help anyone affected by bullying - whether you're a victim, witness, parent, 
                    or educator. All features are <strong>fully functional</strong> and designed to provide real support.
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <Card 
                        key={feature.tab} 
                        className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                        onClick={() => setActiveTab(feature.tab)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            {feature.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                          <Button variant="link" className="p-0 h-auto mt-2">
                            Open {feature.title} →
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* FAQ Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="who">
                      <AccordionTrigger>Who is this section for?</AccordionTrigger>
                      <AccordionContent>
                        This section is designed for anyone affected by bullying: victims seeking support and guidance, 
                        parents wanting to help their children, educators looking for resources, and bystanders who want 
                        to learn how to help. All ages are welcome, and content is appropriate for teens and adults.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="privacy">
                      <AccordionTrigger>Is my information private?</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-start gap-2">
                          <Lock className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            Yes! Your journal entries are completely private and only visible to you. Stories and support 
                            wall messages can be posted anonymously. We never share your personal information. Chat conversations 
                            are not stored permanently.
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="account">
                      <AccordionTrigger>Do I need an account?</AccordionTrigger>
                      <AccordionContent>
                        You can browse information (Legal, SOS Contacts) without an account. To use interactive features 
                        like the Journal, Stories, Support Wall, Courses, and Badges, you'll need to sign in. This ensures 
                        your progress is saved and your privacy is protected.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="crisis">
                      <AccordionTrigger>What if I'm in immediate danger?</AccordionTrigger>
                      <AccordionContent>
                        <Alert variant="destructive" className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>If you are in immediate danger:</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside mt-2">
                              <li><strong>Call Emergency Services: 911 (US) or 112 (EU)</strong></li>
                              <li>Crisis Text Line: Text HOME to 741741</li>
                              <li>National Suicide Prevention Lifeline: 988</li>
                              <li>Go to the SOS Contacts tab for more resources</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="help-others">
                      <AccordionTrigger>How can I help others?</AccordionTrigger>
                      <AccordionContent>
                        There are many ways to contribute:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Share Your Story:</strong> Your experience can help others feel less alone</li>
                          <li><strong>Post Encouragement:</strong> Leave supportive messages on the Support Wall</li>
                          <li><strong>Support Stories:</strong> Show appreciation for others who share their experiences</li>
                          <li><strong>Complete Courses:</strong> Learn how to be an effective bystander</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Quick Start Guide */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Quick Start Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-3">
                      <li>
                        <strong>Need immediate support?</strong> → Start with the <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("chat")}>AI Support Chat</Button>
                      </li>
                      <li>
                        <strong>Want to learn about bullying?</strong> → Take our <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("courses")}>Interactive Courses</Button>
                      </li>
                      <li>
                        <strong>Need to document incidents?</strong> → Use the <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("journal")}>Safety Journal</Button>
                      </li>
                      <li>
                        <strong>Looking for help in your area?</strong> → Check <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("sos")}>SOS Contacts</Button>
                      </li>
                      <li>
                        <strong>Want to practice responses?</strong> → Try <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("roleplay")}>Role-Play Scenarios</Button>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Confidential Support Chat
                </CardTitle>
                <CardDescription className="space-y-2">
                  <p>
                    Chat with our AI assistant for emotional support, coping strategies, and guidance.
                    The assistant is trained to be compassionate, non-judgmental, and helpful.
                  </p>
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-semibold">
                      ⚠️ This chat is NOT a replacement for professional mental health services.
                      For serious concerns, please contact a professional or crisis hotline.
                    </AlertDescription>
                  </Alert>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-lg p-4 mb-4 bg-muted/30">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p className="text-lg font-medium">You're not alone.</p>
                      <p className="mt-2">Start a conversation whenever you're ready. I'm here to listen and help.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("I'm being bullied at school and don't know what to do")}>
                          I'm being bullied
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("My friend is being bullied, how can I help?")}>
                          My friend is being bullied
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("I'm feeling overwhelmed and anxious")}>
                          I'm feeling anxious
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("How do I report cyberbullying?")}>
                          Cyberbullying help
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-secondary rounded-lg px-4 py-2">
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
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="lg">
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

        {/* Footer Disclaimer */}
        <Card className="mt-8 border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Global Resource</p>
                <p>
                  This section is designed to help people worldwide. While we provide general information and support,
                  laws and resources vary by country. Always check local regulations and seek local professional help
                  when needed. If you're in crisis, contact your local emergency services immediately.
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