import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import QuizList from "@/components/education/QuizList";

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
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("tutoring-chat", {
        body: { message: userMessage, history: chatHistory }
      });

      if (error) throw error;

      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string) => {
    navigate(`/quiz?category=${categoryId}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Education
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-2">
            Online tutoring and quizzes for your personal development
          </p>
        </div>

        <Tabs defaultValue="tutoring" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-8">
            <TabsTrigger value="tutoring" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              Tutoring
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutoring">
            <Card>
              <CardHeader>
                <CardTitle>Online Tutoring</CardTitle>
                <CardDescription>
                  Ask anything and get an instant answer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Detailed Description */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-300/30 rounded-xl p-4 sm:p-6 mb-4">
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">🎓 What is Online Tutoring?</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Our AI-powered tutoring system provides instant, personalized educational support across all subjects. Whether you're struggling with algebra, learning a new language, or exploring scientific concepts, our virtual tutor is available 24/7 to help.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span><strong>Instant Answers:</strong> Get explanations within seconds</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span><strong>All Subjects:</strong> Math, science, languages, history & more</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span><strong>Step-by-Step:</strong> Detailed explanations with examples</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span><strong>24/7 Available:</strong> Learn anytime, anywhere</span>
                    </div>
                  </div>
                </div>

                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation by asking a question</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-12"
                            : "bg-background mr-12"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>Teacher is thinking...</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write your question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !chatMessage.trim()}
                    size="icon"
                    className="h-[80px] w-[80px]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="space-y-8">
              {/* Detailed Description */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/30 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-2">📝 What are Quizzes?</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Challenge yourself with our comprehensive quiz system featuring 50+ categories. Each quiz contains 20 carefully crafted questions with instant AI feedback to help you learn from your mistakes and track your progress.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>50+ Categories:</strong> From academics to pop culture</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>AI Feedback:</strong> Learn why answers are correct/wrong</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Custom Quizzes:</strong> Create your own quizzes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Track Progress:</strong> See your improvement over time</span>
                  </div>
                </div>
              </div>

              {/* Custom Quizzes Section */}
              <QuizList />
              
              {/* Original Quiz Categories Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">AI-Generated Quizzes by Category</CardTitle>
                  <CardDescription>20 questions with instant AI feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                    {quizCategories.map((category) => (
                      <Card key={category.id} className="hover:shadow-lg transition-shadow hover-scale">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-3xl">{category.icon}</span>
                            {category.name}
                          </CardTitle>
                          <CardDescription>20 questions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleStartQuiz(category.id)}
                            className="w-full"
                          >
                            Start
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
