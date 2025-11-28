import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, MessageCircle, BookOpen, Heart, AlertTriangle, Send, Loader2, Phone, Globe, 
  Users, GraduationCap, Scale, Gamepad2, Trophy, FileText
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
              psychiatric, or medical treatment. If you are in crisis, contact emergency services (911/112) or a crisis hotline immediately.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Safety & Bullying Prevention</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A global resource for bullying prevention, self-defense education, and emotional support.
          </p>
        </div>

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
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="destructive">Not Medical Advice</Badge>
              <Badge variant="destructive">Educational Only</Badge>
              <Badge variant="destructive">Seek Professional Help</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 justify-start">
            <TabsTrigger value="chat"><MessageCircle className="h-4 w-4 mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="courses"><GraduationCap className="h-4 w-4 mr-1" />Courses</TabsTrigger>
            <TabsTrigger value="stories"><BookOpen className="h-4 w-4 mr-1" />Stories</TabsTrigger>
            <TabsTrigger value="legal"><Scale className="h-4 w-4 mr-1" />Legal</TabsTrigger>
            <TabsTrigger value="journal"><FileText className="h-4 w-4 mr-1" />Journal</TabsTrigger>
            <TabsTrigger value="sos"><Phone className="h-4 w-4 mr-1" />SOS</TabsTrigger>
            <TabsTrigger value="roleplay"><Gamepad2 className="h-4 w-4 mr-1" />Role-Play</TabsTrigger>
            <TabsTrigger value="wall"><Heart className="h-4 w-4 mr-1" />Support Wall</TabsTrigger>
            <TabsTrigger value="badges"><Trophy className="h-4 w-4 mr-1" />Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" />Confidential Support Chat</CardTitle>
                <CardDescription>
                  <span className="text-destructive font-semibold">⚠️ Not a replacement for professional help.</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-lg p-4 mb-4 bg-muted/30">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p>You're not alone. Start a conversation whenever you're ready.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && <div className="flex justify-start"><div className="bg-secondary rounded-lg px-4 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Share what's on your mind..." className="flex-1" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
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
      </div>
    </div>
  );
};

export default SafetyPrevention;
