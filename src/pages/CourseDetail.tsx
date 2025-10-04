import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle, Award } from "lucide-react";
import { CourseTest } from "@/components/courses/CourseTest";
import { Certificate } from "@/components/courses/Certificate";

const CourseDetail = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [currentTopic, setCurrentTopic] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<number[]>([]);
  const [showTest, setShowTest] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [userName, setUserName] = useState("");

  const topics = [
    { title: "Téma 1: Úvod do kurzu", content: "V tejto téme sa oboznámite so základmi kurzu a jeho cieľmi. Naučíte sa kľúčové koncepty a pripravíte sa na pokročilejšie témy." },
    { title: "Téma 2: Základné pojmy", content: "Pochopenie základných pojmov je kľúčové pre úspešné zvládnutie kurzu. V tejto časti sa naučíte terminológiu a základné princípy." },
    { title: "Téma 3: Praktické aplikácie", content: "Teória je dôležitá, ale praktické aplikácie sú kľúčom k úspechu. Naučíte sa ako aplikovať teoretické poznatky v praxi." },
    { title: "Téma 4: Pokročilé techniky", content: "V tejto téme sa dostanete k pokročilejším technikám a metódam. Rozšírite si svoje znalosti a zručnosti." },
    { title: "Téma 5: Riešenie problémov", content: "Naučíte sa identifikovať a riešiť bežné problémy. Praktické príklady vám pomôžu lepšie pochopiť problematiku." },
    { title: "Téma 6: Prípadové štúdie", content: "Reálne prípadové štúdie vám ukážu ako sa používajú naučené koncepty v praxi. Analyzujete konkrétne situácie." },
    { title: "Téma 7: Najlepšie postupy", content: "Spoznáte overené postupy a odporúčania odborníkov. Tieto znalosti vám pomôžu dosiahnuť najlepšie výsledky." },
    { title: "Téma 8: Nástroje a zdroje", content: "Objavíte užitočné nástroje a zdroje, ktoré vám pomôžu v ďalšom štúdiu a praxi." },
    { title: "Téma 9: Trendy a budúcnosť", content: "Dozviete sa o aktuálnych trendoch a budúcich smeroch v danej oblasti. Pripravíte sa na budúce výzvy." },
    { title: "Téma 10: Zhrnutie a záver", content: "Záverečná téma zhrnie všetko naučené a pripraví vás na záverečný test. Prejdete si kľúčové body celého kurzu." },
  ];

  const handleTopicComplete = (index: number) => {
    if (!completedTopics.includes(index)) {
      setCompletedTopics([...completedTopics, index]);
    }
    if (index === 9) {
      setShowTest(true);
    } else if (index < 9) {
      setCurrentTopic(index + 1);
    }
  };

  const handleTestPass = (name: string) => {
    setUserName(name);
    setTestPassed(true);
  };

  const progress = (completedTopics.length / topics.length) * 100;

  if (testPassed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <Certificate
          userName={userName}
          courseName={courseName || ""}
          completionDate={new Date().toLocaleDateString('sk-SK')}
        />
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowTest(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na kurz
          </Button>
          <CourseTest
            courseName={courseName || ""}
            onTestPass={handleTestPass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/education")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na vzdelávanie
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{courseName}</CardTitle>
                <CardDescription className="mt-2">
                  Online kurz s certifikáciou
                </CardDescription>
              </div>
              <Award className="h-12 w-12 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Postup kurzu</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTopics.length}/{topics.length} tém dokončených
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {topics.map((topic, index) => (
            <Card key={index} className={currentTopic === index ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {completedTopics.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                  </div>
                  {currentTopic === index && (
                    <Badge variant="default">Aktuálna téma</Badge>
                  )}
                </div>
              </CardHeader>
              {currentTopic === index && (
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {topic.content}
                  </p>
                  <Button
                    onClick={() => handleTopicComplete(index)}
                    className="w-full"
                  >
                    {index === 9 ? "Pokračovať na test" : "Dokončiť tému a pokračovať"}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
