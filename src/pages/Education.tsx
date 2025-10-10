import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, GraduationCap, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const quizCategories = [
  { id: "math", name: "Matematika", icon: "📐" },
  { id: "biology", name: "Biológia", icon: "🧬" },
  { id: "physics", name: "Fyzika", icon: "⚛️" },
  { id: "chemistry", name: "Chémia", icon: "🧪" },
  { id: "geography", name: "Geografia", icon: "🌍" },
  { id: "history", name: "História", icon: "📜" },
  { id: "literature", name: "Literatura", icon: "📚" },
  { id: "english", name: "Angličtina", icon: "🇬🇧" },
  { id: "computer", name: "Informatika", icon: "💻" },
  { id: "art", name: "Umenie", icon: "🎨" },
  { id: "celebrity", name: "Celebrity", icon: "⭐" },
  { id: "sport", name: "Šport", icon: "⚽" },
  { id: "movies", name: "Film a TV", icon: "🎬" },
  { id: "music", name: "Hudba", icon: "🎵" },
  { id: "food", name: "Jedlo a varenie", icon: "🍳" },
  { id: "travel", name: "Cestovanie", icon: "✈️" },
  { id: "fashion", name: "Móda", icon: "👗" },
  { id: "nature", name: "Príroda", icon: "🌿" },
  { id: "cars", name: "Automobily", icon: "🚗" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "business", name: "Biznis", icon: "💼" },
  { id: "psychology", name: "Psychológia", icon: "🧠" },
  { id: "health", name: "Zdravie a fitness", icon: "💪" },
  { id: "technology", name: "Technológie", icon: "📱" },
  { id: "science", name: "Veda", icon: "🔬" },
  { id: "politics", name: "Politika", icon: "🏛️" },
  { id: "economics", name: "Ekonómia", icon: "💰" },
  { id: "astronomy", name: "Astronómia", icon: "🌟" },
  { id: "animals", name: "Zvieratá", icon: "🦁" },
  { id: "architecture", name: "Architektúra", icon: "🏗️" },
  { id: "languages", name: "Jazyky sveta", icon: "🗣️" },
  { id: "mythology", name: "Mytológia", icon: "⚡" },
  { id: "religion", name: "Náboženstvá", icon: "🕉️" },
  { id: "philosophy", name: "Filozofia", icon: "🤔" },
  { id: "law", name: "Právo", icon: "⚖️" },
  { id: "medicine", name: "Medicína", icon: "⚕️" },
  { id: "environment", name: "Životné prostredie", icon: "♻️" },
  { id: "beauty", name: "Krása a starostlivosť", icon: "💄" },
  { id: "photography", name: "Fotografia", icon: "📷" },
  { id: "dance", name: "Tanec", icon: "💃" },
  { id: "cooking", name: "Kuchárstvo", icon: "👨‍🍳" },
  { id: "wine", name: "Víno a gastronómia", icon: "🍷" },
  { id: "coffee", name: "Káva", icon: "☕" },
  { id: "pets", name: "Domáce zvieratá", icon: "🐕" },
  { id: "gardening", name: "Záhradníctvo", icon: "🌱" },
  { id: "diy", name: "DIY a remeslá", icon: "🔨" },
  { id: "magic", name: "Kúzla a ilúzie", icon: "🎩" },
  { id: "comics", name: "Komiksy", icon: "💥" },
  { id: "anime", name: "Anime a manga", icon: "🎌" },
  { id: "socialMedia", name: "Sociálne siete", icon: "📲" },
  { id: "brands", name: "Značky a logo", icon: "™️" },
  { id: "flags", name: "Vlajky a krajiny", icon: "🏁" },
];

const courseCategories = [
  {
    name: "Ekonomické kurzy",
    icon: "💼",
    courses: [
      "Základy účtovníctva", "Finančné plánovanie", "Investovanie pre začiatočníkov",
      "Marketing a reklama", "Podnikanie od A po Z", "E-commerce", 
      "Manažment projektov", "Business plán", "Analýza trhu", "Osobné financie",
      "Kryptomeny", "Logistika a dodávateľský reťazec"
    ]
  },
  {
    name: "Krása a zdravie",
    icon: "💄",
    courses: [
      "Make-up pre začiatočníkov", "Starostlivosť o pleť", "Manikúra",
      "Pedikúra", "Styling a móda", "Nechtový dizajn", "Vlasoví styling",
      "Masáže", "Aromaterapia", "Jóga", "Pilates", "Fitness tréning"
    ]
  },
  {
    name: "Osobnostný rozvoj",
    icon: "🌟",
    courses: [
      "Time management", "Produktivita", "Mindfulness", "Meditácia",
      "Stres manažment", "Emocionálna inteligencia", "Komunikácia", "Asertivita",
      "Public speaking", "Prezentačné zručnosti", "Leadership", "Team building"
    ]
  },
  {
    name: "IT a počítače",
    icon: "💻",
    courses: [
      "HTML/CSS", "JavaScript", "React", "Python",
      "Java", "C++", "PHP", "SQL",
      "Node.js", "TypeScript", "Angular", "Vue.js"
    ]
  },
  {
    name: "Školstvo",
    icon: "🎓",
    courses: [
      "Pedagogika", "Didaktika", "Metodika vyučovania", "Psychológia dieťaťa",
      "Špeciálna pedagogika", "Inkluzívne vzdelávanie", "Montessori metóda", "Waldorfská pedagogika",
      "Projektové vyučovanie", "Digitálne vzdelávanie", "E-learning tvorba", "Gamifikácia"
    ]
  },
  {
    name: "Sociálne odvetvia",
    icon: "🤝",
    courses: [
      "Sociálna práca", "Terénna sociálna práca", "Komunitná práca", "Case management",
      "Práca s rodinami", "Práca so seniormi", "Práca s mládežou", "Adiktológia a práca so závislosťami",
      "Sociálna práca s osobami bez domova", "Krízová intervencia", "Domáce násilie", "Supervízia a prevencia vyhorenia"
    ]
  }
];

export default function Education() {
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        title: "Chyba",
        description: "Nepodarilo sa odoslať správu",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string) => {
    navigate(`/quiz?category=${categoryId}`);
  };

  const handleEnrollCourse = (courseName: string) => {
    navigate(`/course/${encodeURIComponent(courseName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Vzdelávanie
          </h1>
          <p className="text-muted-foreground text-lg">
            Online doučovanie, kvízy a kurzy pre váš osobný rozvoj
          </p>
        </div>

        <Tabs defaultValue="tutoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tutoring" className="gap-2">
              <Brain className="h-4 w-4" />
              Doučovanie
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Kvíz
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Kurzy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutoring">
            <Card>
              <CardHeader>
                <CardTitle>Online Doučovanie</CardTitle>
                <CardDescription>
                  Opýtajte sa na čokoľvek a získajte okamžitú odpoveď
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Začnite konverzáciu položením otázky</p>
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
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>Učiteľ premýšľa...</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Napíšte svoju otázku..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quizCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-3xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>20 otázok</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleStartQuiz(category.id)}
                      className="w-full"
                    >
                      Štart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-8">
              {courseCategories.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="text-4xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      {category.courses.length} dostupných kurzov
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {category.courses.map((course, courseIdx) => (
                        <Button
                          key={courseIdx}
                          variant="outline"
                          className="justify-start h-auto py-3 px-4 text-left"
                          onClick={() => handleEnrollCourse(course)}
                        >
                          <span className="truncate">{course}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
