import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quizData: Record<string, Array<{question: string; options: string[]; correct: number}>> = {
  math: [
    { question: "Koľko je 15 + 28?", options: ["41", "42", "43", "44"], correct: 2 },
    { question: "Čo je 12 × 8?", options: ["84", "96", "102", "108"], correct: 1 },
    { question: "Koľko je √144?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "Čo je 256 ÷ 16?", options: ["14", "15", "16", "17"], correct: 2 },
    { question: "Koľko percent je 25 zo 100?", options: ["20%", "25%", "30%", "35%"], correct: 1 },
  ],
  biology: [
    { question: "Ktorý orgán pumpuje krv?", options: ["Pľúca", "Srdce", "Pečeň", "Mozog"], correct: 1 },
    { question: "Koľko chromozómov má človek?", options: ["23", "44", "46", "48"], correct: 2 },
    { question: "Čo produkujú chloroplasty?", options: ["Kyslík", "Oxid uhličitý", "Dusík", "Vodík"], correct: 0 },
    { question: "Ktorá bunka nemá jadro?", options: ["Červená krvinková", "Biela krvinková", "Nervová", "Svalová"], correct: 0 },
    { question: "Koľko komôr má ľudské srdce?", options: ["2", "3", "4", "5"], correct: 2 },
  ],
  physics: [
    { question: "Aká je rýchlosť svetla?", options: ["300 000 km/s", "150 000 km/s", "450 000 km/s", "600 000 km/s"], correct: 0 },
    { question: "Kto objavil gravitáciu?", options: ["Einstein", "Newton", "Galileo", "Tesla"], correct: 1 },
    { question: "Čo je jednotka elektrického odporu?", options: ["Volt", "Ampér", "Ohm", "Watt"], correct: 2 },
    { question: "Pri akej teplote vrie voda?", options: ["90°C", "95°C", "100°C", "105°C"], correct: 2 },
    { question: "Čo je E v rovnici E=mc²?", options: ["Energia", "Elektrón", "Existencia", "Ekvivalent"], correct: 0 },
  ],
  chemistry: [
    { question: "Aký je chemický symbol pre zlato?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
    { question: "Koľko atómov kyslíka má molekula vody?", options: ["1", "2", "3", "4"], correct: 0 },
    { question: "Čo je pH neutrálneho roztoku?", options: ["5", "6", "7", "8"], correct: 2 },
    { question: "Ktorý plyn je najrozšírenejší v atmosfére?", options: ["Kyslík", "Dusík", "Oxid uhličitý", "Argón"], correct: 1 },
    { question: "Aký je symbol pre sodík?", options: ["So", "Sd", "Na", "S"], correct: 2 },
  ],
  geography: [
    { question: "Ktoré je najväčšie mesto na Slovensku?", options: ["Košice", "Bratislava", "Prešov", "Žilina"], correct: 1 },
    { question: "Ktorý je najvyšší vrch Slovenska?", options: ["Kriváň", "Rysy", "Gerlachovský štít", "Lomnický štít"], correct: 2 },
    { question: "Koľko má Slovensko susedov?", options: ["3", "4", "5", "6"], correct: 2 },
    { question: "Ktorá rieka preteká Bratislavou?", options: ["Váh", "Dunaj", "Hron", "Nitra"], correct: 1 },
    { question: "V ktorom roku vznikla SR?", options: ["1990", "1991", "1992", "1993"], correct: 3 },
  ],
  history: [
    { question: "V ktorom roku skončila 2. svetová vojna?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
    { question: "Kto bol prvým prezidentom USA?", options: ["Jefferson", "Washington", "Lincoln", "Adams"], correct: 1 },
    { question: "Kedy padol Berlínsky múr?", options: ["1987", "1988", "1989", "1990"], correct: 2 },
    { question: "Kto objavil Ameriku?", options: ["Magellan", "Kolumbus", "Vasco da Gama", "Cook"], correct: 1 },
    { question: "V ktorom roku vzniklo Československo?", options: ["1916", "1917", "1918", "1919"], correct: 2 },
  ],
  literature: [
    { question: "Kto napísal Romeo a Júlia?", options: ["Byron", "Shakespeare", "Dickens", "Wilde"], correct: 1 },
    { question: "Ktorý slovenský spisovateľ napísal Martin Kukučín?", options: ["Hviezdoslav", "Botto", "Kukučín", "Hollý"], correct: 2 },
    { question: "Kto napísal Malého princa?", options: ["Verne", "Saint-Exupéry", "Dumas", "Hugo"], correct: 1 },
    { question: "Z ktorej krajiny pochádza Fjodor Dostojevskij?", options: ["Poľsko", "Ukrajina", "Rusko", "Česko"], correct: 2 },
    { question: "Kto napísal 1984?", options: ["Huxley", "Bradbury", "Orwell", "Kafka"], correct: 2 },
  ],
  celebrity: [
    { question: "Kto je speváčka hitov Bad Guy a Ocean Eyes?", options: ["Ariana Grande", "Billie Eilish", "Dua Lipa", "Taylor Swift"], correct: 1 },
    { question: "Kto hral Iron Mana v Marvel filmoch?", options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"], correct: 2 },
    { question: "Kto je najsledovanejšia osoba na Instagrame?", options: ["Kylie Jenner", "Cristiano Ronaldo", "Selena Gomez", "Dwayne Johnson"], correct: 1 },
    { question: "Ktorý slovenský hokejista hral v NHL?", options: ["Zdeno Chára", "Marián Hossa", "Ján Lašák", "Všetci"], correct: 3 },
    { question: "Kto vyhral Eurovíziu 2023?", options: ["Švédsko", "Fínsko", "Ukrajina", "Španielsko"], correct: 0 },
  ],
  english: [
    { question: "What is the past tense of 'go'?", options: ["goed", "went", "gone", "goes"], correct: 1 },
    { question: "How do you say 'pes' in English?", options: ["cat", "dog", "bird", "fish"], correct: 1 },
    { question: "What is the plural of 'child'?", options: ["childs", "children", "childes", "child"], correct: 1 },
    { question: "'I ___ a student.' What fits?", options: ["is", "are", "am", "be"], correct: 2 },
    { question: "What color is the sky?", options: ["green", "red", "blue", "yellow"], correct: 2 },
  ],
  slovak: [
    { question: "Koľko samohlások má slovenská abeceda?", options: ["5", "6", "7", "8"], correct: 0 },
    { question: "Ktoré slovo je príslovka?", options: ["rýchlo", "rýchly", "rýchlosť", "rýchlejší"], correct: 0 },
    { question: "Čo je sloveso?", options: ["podstatné meno", "prídavné meno", "činnostné slovo", "číslovka"], correct: 2 },
    { question: "Koľko pádov má slovenčina?", options: ["4", "5", "6", "7"], correct: 2 },
    { question: "Aký je rod slova 'dievča'?", options: ["mužský", "ženský", "stredný", "žiadny"], correct: 2 },
  ],
  computer: [
    { question: "Čo znamená HTML?", options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], correct: 0 },
    { question: "Ktorý jazyk sa používa na styling webov?", options: ["HTML", "CSS", "JavaScript", "Python"], correct: 1 },
    { question: "Čo znamená CPU?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correct: 0 },
    { question: "Ktorý z týchto je operačný systém?", options: ["Chrome", "Firefox", "Linux", "Java"], correct: 2 },
    { question: "Čo je RAM?", options: ["Permanent storage", "Temporary memory", "Hard drive", "Graphics card"], correct: 1 },
  ],
  art: [
    { question: "Kto namaľoval Mona Lisu?", options: ["Picasso", "Da Vinci", "Van Gogh", "Michelangelo"], correct: 1 },
    { question: "Ktorý umelec mal 'modré obdobie'?", options: ["Monet", "Picasso", "Dalí", "Matisse"], correct: 1 },
    { question: "Čo je 'Hvezdná noc'?", options: ["Socha", "Obraz", "Budova", "Báseň"], correct: 1 },
    { question: "Kde je vystavená Mona Lisa?", options: ["Tate Modern", "Louvre", "MoMA", "Prado"], correct: 1 },
    { question: "Ktorý štýl predstavuje Salvador Dalí?", options: ["Realizmus", "Impresionizmus", "Surrealizmus", "Kubizmus"], correct: 2 },
  ],
};

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "math";
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const questions = quizData[category] || quizData.math;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    
    setAnswered(true);
    if (selectedAnswer === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Výsledky kvízu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {percentage}%
              </div>
              <p className="text-xl">
                Správne odpovede: {score} z {questions.length}
              </p>
              <div className="space-y-2">
                <Button onClick={handleRestart} className="w-full" size="lg">
                  Skúsiť znova
                </Button>
                <Button onClick={() => navigate("/education")} variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Späť na vzdelávanie
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button 
          onClick={() => navigate("/education")} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardDescription>
                Otázka {currentQuestion + 1} z {questions.length}
              </CardDescription>
              <Progress value={progress} />
            </div>
            <CardTitle className="text-2xl mt-4">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(val) => !answered && setSelectedAnswer(parseInt(val))}
              disabled={answered}
            >
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                      answered
                        ? idx === question.correct
                          ? "border-green-500 bg-green-500/10"
                          : idx === selectedAnswer
                          ? "border-red-500 bg-red-500/10"
                          : "border-muted"
                        : selectedAnswer === idx
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label 
                      htmlFor={`option-${idx}`} 
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <span>{option}</span>
                      {answered && idx === question.correct && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {answered && idx === selectedAnswer && idx !== question.correct && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-2">
              {!answered ? (
                <Button 
                  onClick={handleAnswer} 
                  disabled={selectedAnswer === null}
                  className="w-full"
                  size="lg"
                >
                  Potvrdiť odpoveď
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  {currentQuestion < questions.length - 1 ? "Ďalšia otázka" : "Zobraziť výsledky"}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Skóre: {score} / {currentQuestion + (answered ? 1 : 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
