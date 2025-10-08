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
  { id: "celebrity", name: "Celebrity", icon: "⭐" },
  { id: "english", name: "Angličtina", icon: "🇬🇧" },
  { id: "slovak", name: "Slovenčina", icon: "🇸🇰" },
  { id: "computer", name: "Informatika", icon: "💻" },
  { id: "art", name: "Umenie", icon: "🎨" },
];

const courseCategories = [
  {
    name: "Ekonomické kurzy",
    icon: "💼",
    courses: [
      "Základy účtovníctva", "Finančné plánovanie", "Investovanie pre začiatočníkov", "Daňová sústava",
      "Marketing a reklama", "Podnikanie od A po Z", "E-commerce", "Finančná gramotnosť",
      "Manažment projektov", "Business plán", "Analýza trhu", "Osobné financie",
      "Kryptomeny", "Akciový trh", "Nehnuteľnosti", "Príjem z pasívnych zdrojov",
      "Excel pre ekonómov", "Finančná analýza", "Controlling", "Logistika a dodávateľský reťazec",
      "Reklamná stratégia", "Cenová politika", "Obchodné rokovania", "Firemné financie",
      "Audit", "Rozpočtovanie", "Cash flow manažment", "Risk manažment",
      "Správa majetku", "Bankové produkty", "Poisťovníctvo", "Ekonometria",
      "Mikroekonómia", "Makroekonómia", "Medzinárodný obchod", "Ekonomická legislatíva",
      "Dane a odvody", "Účtovné štandardy", "Finančné deriváty", "Crowdfunding",
      "Startup financovanie", "Venture capital", "Private equity", "IPO proces",
      "Fúzie a akvizície", "Korporátne riadenie", "Compliance", "ESG investing",
      "Behavioral economics", "Fintech inovácie"
    ]
  },
  {
    name: "Hobby",
    icon: "🎨",
    courses: [
      "Maľovanie akrylom", "Akvarel", "Kresba ceruzkou", "Digitálne umenie",
      "Fotografia", "Video editing", "Hudobná produkcia", "Gitara pre začiatočníkov",
      "Klavír", "Spev", "Pletenie", "Háčkovanie",
      "Šitie", "Šperky ručne", "Drevorezba", "Keramika",
      "Origami", "Kaligráfia", "Scrapbooking", "Mydlárstvo",
      "Sviečkárstvo", "Makramé", "Zahradníctvo", "Bonsai",
      "Teráriá", "Akváriá", "Včelárstvo", "Varenie",
      "Pečenie", "Barista kurz", "Sommelier", "Mixológia",
      "Káva latte art", "Cukrárstvo", "Dekorácia tort", "Domáce pečivo",
      "Vegánske varenie", "Raw food", "Fermentácia", "Domáce syry",
      "Salámy a údeniny", "Liečivé bylinky", "Čajovníctvo", "Bylinkové záhrady",
      "Kompostovanie", "Permakultúra", "Urban gardening", "Pestovanie húb"
    ]
  },
  {
    name: "Krása a zdravie",
    icon: "💄",
    courses: [
      "Make-up pre začiatočníkov", "Profesionálny make-up", "Permanent make-up", "Manikúra",
      "Pedikúra", "Gél laky", "Nechtový dizajn", "Vlasoví styling",
      "Barbering", "Farbiarske techniky", "Predĺžovanie vlasov", "Líčenie neviest",
      "Masáže", "Aromaterapia", "Reflexná terapia", "Ayurveda",
      "Jóga", "Pilates", "Fitness tréning", "Výživa a diéty",
      "Detox programy", "Wellness poradca", "Kozmetika", "Skin care rutina",
      "Anti-aging", "Prírodná kozmetika", "Bylinkové recepty", "Estetika",
      "Vizážistika", "Brow artist", "Lash artist", "Tetovanie",
      "Permanentný make-up", "Body art", "SPA terapie", "Hydroterapia",
      "Kryoterapia", "Solárium školenie", "Medicínska kozmetika", "Dermatológia",
      "Homeopatia", "Fytoterapia", "Liečivé rastliny", "Zdravá výživa",
      "Makrobiotika", "Nutrigenetika", "Športová výživa", "Suplementy"
    ]
  },
  {
    name: "Jazykové kurzy",
    icon: "🌐",
    courses: [
      "Angličtina A1", "Angličtina A2", "Angličtina B1", "Angličtina B2",
      "Angličtina C1", "Business English", "Konverzácia v angličtine", "TOEFL príprava",
      "IELTS príprava", "Nemčina A1", "Nemčina A2", "Nemčina B1",
      "Nemčina B2", "Nemčina pre prácu", "Španielčina A1", "Španielčina A2",
      "Španielčina B1", "Taliančina", "Francúzština", "Ruština",
      "Čínština", "Japončina", "Kórejčina", "Arabčina",
      "Portugalčina", "Holandčina", "Švédčina", "Nórčina",
      "Dánčina", "Fínčina", "Poľština", "Čeština",
      "Maďarčina", "Rumunčina", "Bulharčina", "Gréčtina",
      "Turečtina", "Hebrejčina", "Hindi", "Indonézština",
      "Thajčina", "Vietnamčina", "Slovinčina", "Chorvátčina",
      "Srbčina", "Albánčina", "Ukrajinčina", "Litovčina",
      "Lotyština", "Estónčina"
    ]
  },
  {
    name: "Osobnostný rozvoj",
    icon: "🌟",
    courses: [
      "Time management", "Produktivita", "Mindfulness", "Meditácia",
      "Stres manažment", "Emocionálna inteligencia", "Komunikácia", "Asertivita",
      "Public speaking", "Prezentačné zručnosti", "Leadership", "Team building",
      "Konfliktné riešenie", "Vyjednávanie", "Kritické myslenie", "Kreativita",
      "Design thinking", "Lateral thinking", "Speed reading", "Pamäťové techniky",
      "Note-taking", "Mind mapping", "Goal setting", "Habit building",
      "Self-discipline", "Motivácia", "Sebavedomie", "Pozitívne myslenie",
      "Life coaching", "Career coaching", "NLP", "Terapia",
      "Psychológia", "Filozofia", "Etika", "Sociológia",
      "Networking", "Personal branding", "CV writing", "Interview skills",
      "Salary negotiation", "Work-life balance", "Burnout prevention", "Resilience",
      "Growth mindset", "Emotional wellness", "Relationship skills", "Parenting",
      "Spiritualita", "Life purpose"
    ]
  },
  {
    name: "IT a počítače",
    icon: "💻",
    courses: [
      "HTML/CSS", "JavaScript", "React", "Python",
      "Java", "C++", "PHP", "SQL",
      "Node.js", "TypeScript", "Angular", "Vue.js",
      "Django", "Flask", "Ruby on Rails", "ASP.NET",
      "Mobile development", "Android development", "iOS development", "Flutter",
      "React Native", "Unity", "Unreal Engine", "Game development",
      "Data science", "Machine learning", "AI", "Deep learning",
      "Data analytics", "Big data", "Cloud computing", "AWS",
      "Azure", "Google Cloud", "DevOps", "Docker",
      "Kubernetes", "CI/CD", "Git", "Linux",
      "Cybersecurity", "Ethical hacking", "Penetration testing", "Network security",
      "Blockchain", "Smart contracts", "Web3", "NFT development",
      "UI/UX design", "Figma", "Adobe XD", "Photoshop"
    ]
  },
  {
    name: "Školstvo",
    icon: "🎓",
    courses: [
      "Pedagogika", "Didaktika", "Metodika vyučovania", "Psychológia dieťaťa",
      "Špeciálna pedagogika", "Inkluzívne vzdelávanie", "Montessori metóda", "Waldorfská pedagogika",
      "Projektové vyučovanie", "Digitálne vzdelávanie", "E-learning tvorba", "Gamifikácia",
      "Classroom management", "Motivácia žiakov", "Hodnotenie žiakov", "Formativne hodnotenie",
      "Kritériá hodnotenia", "Feedback techniky", "Práca s talentovanými", "Práca so žiakmi so ŠVVP",
      "Dyslexia", "Dysgraphia", "Dyscalculia", "ADHD v škole",
      "Autizmus", "Logopédia", "Raný vývoj dieťaťa", "Predškolská výchova",
      "Primárne vzdelávanie", "Sekundárne vzdelávanie", "Kurikulum design", "Lesson planning",
      "Výchova k občianstvu", "Environmentálna výchova", "Mediálna výchova", "Finančná gramotnosť",
      "Školský manažment", "Riadenie školy", "Legislatíva školstva", "Školské poradenstvo",
      "Kariérové poradenstvo", "Vzdelávací audit", "Akreditácia programov", "Medzinárodné certifikácie",
      "Dvojjazyčné vzdelávanie", "CLIL metóda", "Outdoor education", "Experiential learning"
    ]
  },
  {
    name: "Zdravotníctvo",
    icon: "⚕️",
    courses: [
      "Anatomia", "Fyziológia", "Patológia", "Farmakológia",
      "Prvá pomoc", "CPR kurz", "Ošetrovateľstvo", "Zdravotnícky asistent",
      "Zubná hygiena", "Fyzioterapia", "Ergoterapia", "Logopédia zdravotná",
      "Nutricionizmus", "Dietetika", "Geriatria", "Pediatria",
      "Psychiatria", "Psychoterapia", "Klinická psychológia", "Zdravotnícka etika",
      "Zdravotnícka legislatíva", "Kvalita v zdravotníctve", "Pacient safety", "Infection control",
      "Sterilizácia", "Hygienické štandardy", "EKG", "Ultrazvuk",
      "Röntgen", "MRI", "CT", "Laboratórna diagnostika",
      "Hematológia", "Mikrobiológia", "Imunológia", "Onkológia",
      "Kardiológia", "Neurológia", "Ortopédia", "Traumatológia",
      "Dermatológia zdravotná", "Oftalmológia", "ORL", "Gynekológia",
      "Pôrodníctvo", "Neonatológia", "Anestéziológia", "Intenzívna medicína",
      "Urgentná medicína", "Radiológia"
    ]
  },
  {
    name: "Sociálne odvetvia",
    icon: "🤝",
    courses: [
      "Sociálna práca", "Terénna sociálna práca", "Komunitná práca", "Case management",
      "Práca s rodinami", "Práca so seniormi", "Práca s mládežou", "Práca s deťmi",
      "Práca s hendikepovanými", "Práca s bezdomovcami", "Práca s migrantmi", "Práca s utečencami",
      "Krízová intervencia", "Domáce násilie", "Prevencia závislostí", "Alkoholizmus",
      "Drogová závislosť", "Gamblerstvo", "Poradenstvo", "Rodinné poradenstvo",
      "Manželské poradenstvo", "Kariérové poradenstvo sociálne", "Dlhová poradňa", "Právne poradenstvo",
      "Adopcia", "Pestúnska starostlivosť", "Detské domovy", "Denné centrá",
      "Komunitné centrá", "Senior centrá", "Chránené dielne", "Rehabilitácia",
      "Resocializácia", "Probácia", "Mediácia", "Restoratívna justícia",
      "Ľudské práva", "Práva dieťaťa", "Práva seniorov", "Antidiskriminácia",
      "Gender equality", "Inklúzia", "Diverzita", "Multikulturalizmus",
      "Fundraising", "Grant writing", "Projektový manažment NGO", "Dobrovoľníctvo",
      "Komunitný rozvoj", "Participácia občanov"
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
                <CardTitle>Online Doučovanie s AI</CardTitle>
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
                    <CardDescription>125+ otázok</CardDescription>
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
