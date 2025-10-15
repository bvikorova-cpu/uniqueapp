import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Scale, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TeenDebatePartner() {
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState<"for" | "against" | "">("");
  const [argument, setArgument] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const startDebate = async () => {
    if (!topic || !position) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic and choose your position",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-debate-partner', {
        body: { 
          action: 'start',
          topic, 
          position,
          messages: []
        }
      });

      if (error) throw error;
      setConversation([{ role: 'ai', content: data.response }]);
      toast({
        title: "Debate Started!",
        description: "Present your opening argument",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to start debate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendArgument = async () => {
    if (!argument.trim()) return;

    const newMessage = { role: 'user', content: argument };
    setConversation(prev => [...prev, newMessage]);
    setArgument("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('teen-debate-partner', {
        body: { 
          action: 'respond',
          topic,
          position,
          messages: [...conversation, newMessage]
        }
      });

      if (error) throw error;
      setConversation(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Debate Partner (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice argumentation and critical thinking with interactive debates
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {conversation.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Start a Debate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Debate Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Should school uniforms be mandatory?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Your Position</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant={position === "for" ? "default" : "outline"}
                      onClick={() => setPosition("for")}
                      className="flex-1"
                    >
                      For
                    </Button>
                    <Button
                      variant={position === "against" ? "default" : "outline"}
                      onClick={() => setPosition("against")}
                      className="flex-1"
                    >
                      Against
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={startDebate} 
                  disabled={loading}
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {loading ? "Starting..." : "Start Debate"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Debate: {topic}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your position: <span className="font-semibold capitalize">{position}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {conversation.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-8'
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {msg.role === 'user' ? 'You' : 'Opponent'}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Present your argument or counter-argument..."
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      onClick={sendArgument} 
                      disabled={loading || !argument.trim()}
                      className="w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {loading ? "Sending..." : "Send Argument"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Debate Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Support your claims with evidence and examples</li>
                <li>• Address opposing arguments directly and respectfully</li>
                <li>• Use logical reasoning, not just emotions</li>
                <li>• Anticipate counter-arguments and prepare responses</li>
                <li>• Stay calm and focused on the topic</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
