import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Brain, Send, Loader2, AlertCircle, GraduationCap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import QuizList from "@/components/education/QuizList";
import { TutoringCreditsPanel } from "@/components/education/TutoringCreditsPanel";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";

const quizCategories = [
  { id: "math", name: "Mathematics", icon: "📐" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "physics", name: "Physics", icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "geography", name: "Geography", icon: "🌍" },
  { id: "history", name: "History", icon: "📜" },
  { id: "literature", name: "Literature", icon: "📚" },
  { id: "english", name: "English", icon: "🇬🇧" },
  { id: "computer", name: "Computer Science", icon: "💻" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "celebrity", name: "Celebrities", icon: "⭐" },
  { id: "sport", name: "Sports", icon: "⚽" },
  { id: "movies", name: "Film & TV", icon: "🎬" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "food", name: "Food & Cooking", icon: "🍳" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "cars", name: "Cars", icon: "🚗" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "psychology", name: "Psychology", icon: "🧠" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "technology", name: "Technology", icon: "📱" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "politics", name: "Politics", icon: "🏛️" },
  { id: "economics", name: "Economics", icon: "💰" },
  { id: "astronomy", name: "Astronomy", icon: "🌟" },
  { id: "animals", name: "Animals", icon: "🦁" },
  { id: "architecture", name: "Architecture", icon: "🏗️" },
  { id: "languages", name: "World Languages", icon: "🗣️" },
  { id: "mythology", name: "Mythology", icon: "⚡" },
  { id: "religion", name: "Religions", icon: "🕉️" },
  { id: "philosophy", name: "Philosophy", icon: "🤔" },
  { id: "law", name: "Law", icon: "⚖️" },
  { id: "medicine", name: "Medicine", icon: "⚕️" },
  { id: "environment", name: "Environment", icon: "♻️" },
  { id: "beauty", name: "Beauty & Care", icon: "💄" },
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "dance", name: "Dance", icon: "💃" },
  { id: "cooking", name: "Culinary Arts", icon: "👨‍🍳" },
  { id: "wine", name: "Wine & Gastronomy", icon: "🍷" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "pets", name: "Pets", icon: "🐕" },
  { id: "gardening", name: "Gardening", icon: "🌱" },
  { id: "diy", name: "DIY & Crafts", icon: "🔨" },
  { id: "magic", name: "Magic & Illusions", icon: "🎩" },
  { id: "comics", name: "Comics", icon: "💥" },
  { id: "anime", name: "Anime & Manga", icon: "🎌" },
  { id: "socialMedia", name: "Social Media", icon: "📲" },
  { id: "brands", name: "Brands & Logos", icon: "™️" },
  { id: "flags", name: "Flags & Countries", icon: "🏁" },
];

const Education = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { credits, isLoading: creditsLoading, useCredit, addCredits, isUsingCredit } = useTutoringCredits();

  useEffect(() => {
    const purchase = searchParams.get("purchase");
    const creditsParam = searchParams.get("credits");
    if (purchase === "success" && creditsParam) {
      const creditsToAdd = parseInt(creditsParam, 10);
      if (!isNaN(creditsToAdd)) {
        addCredits(creditsToAdd);
        navigate("/education", { replace: true });
      }
    } else if (purchase === "canceled") {
      sonnerToast.error("Purchase was canceled");
      navigate("/education", { replace: true });
    }
  }, [searchParams, addCredits, navigate]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    if (credits < 1) {
      toast({ title: "Insufficient Credits", description: "Please purchase credits to continue.", variant: "destructive" });
      return;
    }
    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      await useCredit();
      const { data, error } = await supabase.functions.invoke("tutoring-chat", { body: { message: userMessage, history: chatHistory } });
      if (error) throw error;
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string) => navigate(`/quiz?category=${categoryId}`);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <GraduationCap className="w-4 h-4" />
            <span className="font-medium">AI-Powered Learning</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Education Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-lg mx-auto">
            AI tutoring and 50+ quiz categories for your development
          </p>
        </motion.div>

        <Tabs defaultValue="tutoring" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/80 backdrop-blur-sm border">
            <TabsTrigger value="tutoring" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4" /> Tutoring
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" /> Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutoring">
            <div className="space-y-4">
              <TutoringCreditsPanel />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" /> Online Tutoring
                  </CardTitle>
                  <CardDescription>Ask anything and get an instant answer (1 credit per message)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { icon: "⚡", title: "Instant Answers", desc: "Within seconds" },
                      { icon: "📚", title: "All Subjects", desc: "Math, science, languages..." },
                      { icon: "📝", title: "Step-by-Step", desc: "Detailed explanations" },
                      { icon: "🕐", title: "24/7 Available", desc: "Learn anytime" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <span className="text-lg">{f.icon}</span>
                        <div>
                          <p className="text-xs font-semibold">{f.title}</p>
                          <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!creditsLoading && credits < 1 && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                      <div>
                        <p className="font-medium text-destructive text-sm">No credits available</p>
                        <p className="text-xs text-muted-foreground">Purchase credits above to start learning.</p>
                      </div>
                    </div>
                  )}

                  <div className="min-h-[280px] max-h-[450px] overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-xl border">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">Start by asking a question</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div key={idx} className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-card border mr-8"}`}>
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write your question..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      className="min-h-[70px]"
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !chatMessage.trim() || credits < 1 || isUsingCredit} size="icon" className="h-[70px] w-[70px]">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="space-y-6">
              {/* Features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { icon: "🎯", title: "50+ Categories" },
                  { icon: "🤖", title: "AI Feedback" },
                  { icon: "✏️", title: "Custom Quizzes" },
                  { icon: "📊", title: "Track Progress" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                    <span className="text-lg">{f.icon}</span>
                    <p className="text-xs font-semibold">{f.title}</p>
                  </div>
                ))}
              </div>

              <QuizList />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-primary" /> AI-Generated Quizzes
                  </CardTitle>
                  <CardDescription>20 questions with instant AI feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.02 } } }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
                  >
                    {quizCategories.map((category) => (
                      <motion.div key={category.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                        <Card className="group cursor-pointer hover:border-primary/30 transition-all duration-200 hover:scale-[1.02]" onClick={() => handleStartQuiz(category.id)}>
                          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{category.name}</p>
                              <p className="text-[10px] text-muted-foreground">20 questions</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Education;
