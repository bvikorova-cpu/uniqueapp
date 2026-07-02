import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { expandQuizQuestions } from "@/utils/expandQuizData";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const quizData: Record<string, Array<{question: string; options: string[]; correct: number}>> = {
  math: [
    { question: "What is 15 + 28?", options: ["41", "42", "43", "44"], correct: 2 },
    { question: "What is 12 × 8?", options: ["84", "96", "102", "108"], correct: 1 },
    { question: "What is √144?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "What is 256 ÷ 16?", options: ["14", "15", "16", "17"], correct: 2 },
    { question: "What percent is 25 of 100?", options: ["20%", "25%", "30%", "35%"], correct: 1 },
    { question: "What is 7²?", options: ["42", "45", "49", "56"], correct: 2 },
    { question: "What is 3/4 as a decimal?", options: ["0.5", "0.65", "0.75", "0.8"], correct: 2 },
    { question: "What is the circumference of a circle with radius 5?", options: ["10π", "15π", "20π", "25π"], correct: 0 },
    { question: "How many degrees does a triangle have?", options: ["90°", "180°", "270°", "360°"], correct: 1 },
    { question: "What is 2⁵?", options: ["16", "25", "32", "64"], correct: 2 },
    { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correct: 1 },
    { question: "What is √81?", options: ["7", "8", "9", "10"], correct: 2 },
    { question: "What is 144 ÷ 12?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "What is the area of a square with side 6?", options: ["24", "30", "36", "42"], correct: 2 },
    { question: "What is 9 × 9?", options: ["72", "81", "90", "99"], correct: 1 },
    { question: "What is 1/2 + 1/4?", options: ["1/6", "2/6", "3/4", "5/8"], correct: 2 },
    { question: "What is 50% of 80?", options: ["30", "35", "40", "45"], correct: 2 },
    { question: "What is 100 - 37?", options: ["53", "63", "67", "73"], correct: 1 },
    { question: "How many sides does a pentagon have?", options: ["4", "5", "6", "7"], correct: 1 },
    { question: "What is √169?", options: ["11", "12", "13", "14"], correct: 2 },
  ],
  biology: [
    { question: "Which organ pumps blood?", options: ["Lungs", "Heart", "Liver", "Brain"], correct: 1 },
    { question: "How many chromosomes does a human have?", options: ["23", "44", "46", "48"], correct: 2 },
    { question: "What do chloroplasts produce?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 0 },
    { question: "Which cell has no nucleus?", options: ["Red blood cell", "White blood cell", "Nerve cell", "Muscle cell"], correct: 0 },
    { question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correct: 2 },
    { question: "What is photosynthesis?", options: ["Breathing", "Food production from light", "Reproduction", "Growth"], correct: 1 },
    { question: "How many bones does an adult have?", options: ["186", "196", "206", "216"], correct: 2 },
    { question: "What is the largest cell?", options: ["Nerve cell", "Egg", "Sperm", "Liver cell"], correct: 1 },
    { question: "What is DNA?", options: ["Protein", "Nucleic acid", "Carbohydrate", "Lipid"], correct: 1 },
    { question: "Which organ secretes insulin?", options: ["Liver", "Stomach", "Pancreas", "Kidneys"], correct: 2 },
    { question: "How many teeth does an adult have?", options: ["28", "30", "32", "34"], correct: 2 },
    { question: "What is mitosis?", options: ["Cell division", "Breathing", "Digestion", "Photosynthesis"], correct: 0 },
    { question: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O"], correct: 3 },
    { question: "What is hemoglobin?", options: ["Hormone", "Protein in blood", "Vitamin", "Enzyme"], correct: 1 },
    { question: "What percent of the body is water?", options: ["50%", "60%", "70%", "80%"], correct: 1 },
    { question: "Which vitamin do we produce from the sun?", options: ["A", "C", "D", "E"], correct: 2 },
    { question: "What are mitochondria?", options: ["Cell nucleus", "Powerhouse", "Ribosomes", "Vacuoles"], correct: 1 },
    { question: "How many pairs of ribs does a human have?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "Which organ filters blood?", options: ["Liver", "Lungs", "Kidneys", "Spleen"], correct: 2 },
    { question: "What is evolution?", options: ["Extinction", "Adaptation and development", "Mutation", "Migration"], correct: 1 },
  ],
  physics: [
    { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correct: 0 },
    { question: "Who discovered gravity?", options: ["Einstein", "Newton", "Galileo", "Tesla"], correct: 1 },
    { question: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correct: 2 },
    { question: "At what temperature does water boil?", options: ["90°C", "95°C", "100°C", "105°C"], correct: 2 },
    { question: "What is E in the equation E=mc²?", options: ["Energy", "Electron", "Existence", "Equivalent"], correct: 0 },
    { question: "What is the unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correct: 1 },
    { question: "What is an atom?", options: ["Smallest particle", "Molecule", "Electron", "Proton"], correct: 0 },
    { question: "At what temperature does water freeze?", options: ["-5°C", "0°C", "5°C", "10°C"], correct: 1 },
    { question: "What is a light year?", options: ["Time", "Distance", "Speed", "Energy"], correct: 1 },
    { question: "What is Earth's gravity?", options: ["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"], correct: 1 },
    { question: "What is a photon?", options: ["Light particle", "Electron", "Neutron", "Proton"], correct: 0 },
    { question: "Which law talks about action and reaction?", options: ["First Newton's", "Second Newton's", "Third Newton's", "Law of gravity"], correct: 2 },
    { question: "What is acoustics?", options: ["Science of light", "Science of sound", "Science of motion", "Science of heat"], correct: 1 },
    { question: "What is the speed of sound in air?", options: ["243 m/s", "343 m/s", "443 m/s", "543 m/s"], correct: 1 },
    { question: "What is a magnet?", options: ["Material attracting iron", "Stone", "Metal", "Wood"], correct: 0 },
    { question: "Which planet is the largest?", options: ["Earth", "Saturn", "Jupiter", "Uranus"], correct: 2 },
    { question: "What is electricity?", options: ["Flow of electrons", "Energy", "Light", "Heat"], correct: 0 },
    { question: "What is the formula for kinetic energy?", options: ["mv", "mv²", "½mv²", "m²v"], correct: 2 },
    { question: "What is a rainbow?", options: ["Light dispersion", "Light reflection", "Light absorption", "Light emission"], correct: 0 },
    { question: "Which metal is the best conductor?", options: ["Iron", "Copper", "Silver", "Gold"], correct: 2 },
  ],
  chemistry: [
    { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
    { question: "How many oxygen atoms does a water molecule have?", options: ["1", "2", "3", "4"], correct: 0 },
    { question: "What is the pH of a neutral solution?", options: ["5", "6", "7", "8"], correct: 2 },
    { question: "Which gas is most abundant in the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"], correct: 1 },
    { question: "What is the symbol for sodium?", options: ["So", "Sd", "Na", "S"], correct: 2 },
  ],
  geography: [
    { question: "What is the largest city in Slovakia?", options: ["Košice", "Bratislava", "Prešov", "Žilina"], correct: 1 },
    { question: "What is the highest peak in Slovakia?", options: ["Kriváň", "Rysy", "Gerlachovský štít", "Lomnický štít"], correct: 2 },
    { question: "How many neighbors does Slovakia have?", options: ["3", "4", "5", "6"], correct: 2 },
    { question: "Which river flows through Bratislava?", options: ["Váh", "Danube", "Hron", "Nitra"], correct: 1 },
    { question: "In what year was the Slovak Republic established?", options: ["1990", "1991", "1992", "1993"], correct: 3 },
  ],
  history: [
    { question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
    { question: "Who was the first president of the USA?", options: ["Jefferson", "Washington", "Lincoln", "Adams"], correct: 1 },
    { question: "When did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2 },
    { question: "Who discovered America?", options: ["Magellan", "Columbus", "Vasco da Gama", "Cook"], correct: 1 },
    { question: "In what year was Czechoslovakia established?", options: ["1916", "1917", "1918", "1919"], correct: 2 },
  ],
  literature: [
    { question: "Who wrote Romeo and Juliet?", options: ["Byron", "Shakespeare", "Dickens", "Wilde"], correct: 1 },
    { question: "Which Slovak writer was Martin Kukučín?", options: ["Hviezdoslav", "Botto", "Kukučín", "Hollý"], correct: 2 },
    { question: "Who wrote The Little Prince?", options: ["Verne", "Saint-Exupéry", "Dumas", "Hugo"], correct: 1 },
    { question: "From which country is Fyodor Dostoevsky?", options: ["Poland", "Ukraine", "Russia", "Czechia"], correct: 2 },
    { question: "Who wrote 1984?", options: ["Huxley", "Bradbury", "Orwell", "Kafka"], correct: 2 },
  ],
  english: [
    { question: "What is the past tense of 'go'?", options: ["goed", "went", "gone", "goes"], correct: 1 },
    { question: "How do you say 'pes' in English?", options: ["cat", "dog", "bird", "fish"], correct: 1 },
    { question: "What is the plural of 'child'?", options: ["childs", "children", "childes", "child"], correct: 1 },
    { question: "'I ___ a student.' What fits?", options: ["is", "are", "am", "be"], correct: 2 },
    { question: "What color is the sky?", options: ["green", "red", "blue", "yellow"], correct: 2 },
  ],
  computer: [
    { question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], correct: 0 },
    { question: "Which language is used for web styling?", options: ["HTML", "CSS", "JavaScript", "Python"], correct: 1 },
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correct: 0 },
    { question: "Which of these is an operating system?", options: ["Chrome", "Firefox", "Linux", "Java"], correct: 2 },
    { question: "What is RAM?", options: ["Permanent storage", "Temporary memory", "Hard drive", "Graphics card"], correct: 1 },
  ],
  art: [
    { question: "Who painted the Mona Lisa?", options: ["Picasso", "Da Vinci", "Van Gogh", "Michelangelo"], correct: 1 },
    { question: "Which artist had a 'blue period'?", options: ["Monet", "Picasso", "Dalí", "Matisse"], correct: 1 },
    { question: "What is 'Starry Night'?", options: ["Sculpture", "Painting", "Building", "Poem"], correct: 1 },
    { question: "Where is the Mona Lisa displayed?", options: ["Tate Modern", "Louvre", "MoMA", "Prado"], correct: 1 },
    { question: "Which style does Salvador Dalí represent?", options: ["Realism", "Impressionism", "Surrealism", "Cubism"], correct: 2 },
  ],
  celebrity: [
    { question: "Who is the singer of Bad Guy and Ocean Eyes?", options: ["Ariana Grande", "Billie Eilish", "Dua Lipa", "Taylor Swift"], correct: 1 },
    { question: "Who played Iron Man in Marvel movies?", options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"], correct: 2 },
    { question: "Who is the most followed person on Instagram?", options: ["Kylie Jenner", "Cristiano Ronaldo", "Selena Gomez", "Dwayne Johnson"], correct: 1 },
    { question: "Which Slovak hockey player played in the NHL?", options: ["Zdeno Chára", "Marián Hossa", "Ján Lašák", "All of them"], correct: 3 },
    { question: "Who won Eurovision 2023?", options: ["Sweden", "Finland", "Ukraine", "Spain"], correct: 0 },
  ],
  sport: [
    { question: "How many players does a football team have on the field?", options: ["9", "10", "11", "12"], correct: 2 },
    { question: "Which sport does Roger Federer play?", options: ["Tennis", "Badminton", "Squash", "Table tennis"], correct: 0 },
    { question: "How many rings does the Olympic symbol have?", options: ["3", "4", "5", "6"], correct: 2 },
    { question: "Where were the 2024 Olympics held?", options: ["Tokyo", "Paris", "Los Angeles", "Brisbane"], correct: 1 },
    { question: "When did the Slovak team win the Ice Hockey World Championship?", options: ["2000", "2002", "2012", "Never"], correct: 1 },
  ],
  movies: [
    { question: "Who directed Titanic?", options: ["Spielberg", "Cameron", "Nolan", "Tarantino"], correct: 1 },
    { question: "In what year was the first Harry Potter film released?", options: ["1999", "2000", "2001", "2002"], correct: 2 },
    { question: "Which film won the 2024 Oscar for Best Picture?", options: ["Oppenheimer", "Barbie", "Killers of the Flower Moon", "Poor Things"], correct: 0 },
    { question: "Who played Jack Dawson in Titanic?", options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Cruise", "Johnny Depp"], correct: 1 },
    { question: "Which film had the highest box office revenue of all time?", options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars"], correct: 1 },
  ],
  music: [
    { question: "Who composed Moonlight Sonata?", options: ["Mozart", "Bach", "Beethoven", "Chopin"], correct: 2 },
    { question: "Which band played Bohemian Rhapsody?", options: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"], correct: 1 },
    { question: "Which instrument has 88 keys?", options: ["Organ", "Piano", "Accordion", "Synthesizer"], correct: 1 },
    { question: "Who is the 'King of Pop'?", options: ["Elvis Presley", "Michael Jackson", "Prince", "David Bowie"], correct: 1 },
    { question: "In which country did rap originate?", options: ["Jamaica", "United Kingdom", "USA", "France"], correct: 2 },
  ],
  food: [
    { question: "From which country does pizza originate?", options: ["France", "Spain", "Italy", "Greece"], correct: 2 },
    { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Cucumber"], correct: 1 },
    { question: "What is the main ingredient in hummus?", options: ["Beans", "Lentils", "Chickpeas", "Peas"], correct: 2 },
    { question: "What is tofu made from?", options: ["Milk", "Soybeans", "Rice", "Corn"], correct: 1 },
    { question: "Which dish is typical for Slovakia?", options: ["Paella", "Bryndzové halušky", "Sushi", "Curry"], correct: 1 }
  ],
  travel: [
    { question: "What is the capital of France?", options: ["Lyon", "Marseille", "Paris", "Nice"], correct: 2 },
    { question: "On which continent is Egypt?", options: ["Asia", "Africa", "Europe", "Australia"], correct: 1 },
    { question: "Which country has the most inhabitants?", options: ["India", "China", "USA", "Indonesia"], correct: 1 },
    { question: "Where is the Eiffel Tower located?", options: ["London", "Rome", "Paris", "Madrid"], correct: 2 },
    { question: "Which country has the shape of a boot?", options: ["Greece", "Spain", "Italy", "Portugal"], correct: 2 },
  ],
  fashion: [
    { question: "Which brand has the 'swoosh' logo?", options: ["Adidas", "Nike", "Puma", "Reebok"], correct: 1 },
    { question: "Who is the founder of Chanel?", options: ["Christian Dior", "Coco Chanel", "Yves Saint Laurent", "Giorgio Armani"], correct: 1 },
    { question: "In which city is Fashion Week held first in the year?", options: ["Paris", "Milan", "New York", "London"], correct: 2 },
    { question: "What does 'haute couture' mean?", options: ["Cheap fashion", "High fashion", "Sportswear", "Casual wear"], correct: 1 },
    { question: "Which color is classic for Tiffany jewelry?", options: ["Pink", "Blue", "Green", "Purple"], correct: 1 },
  ],
  nature: [
    { question: "What is the largest animal in the world?", options: ["Elephant", "Shark", "Blue whale", "Giraffe"], correct: 2 },
    { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct: 1 },
    { question: "Which is the tallest tree in the world?", options: ["Beech", "Sequoia", "Pine", "Oak"], correct: 1 },
    { question: "Which animal sleeps 20 hours a day?", options: ["Bear", "Koala", "Sloth", "Cat"], correct: 1 },
    { question: "What is the fastest animal on land?", options: ["Cheetah", "Lion", "Antelope", "Horse"], correct: 0 },
  ],
  cars: [
    { question: "Which brand makes the Mustang model?", options: ["Chevrolet", "Ford", "Dodge", "Chrysler"], correct: 1 },
    { question: "What does BMW stand for?", options: ["Berlin Motor Works", "Bavarian Motor Works", "British Motor Works", "Belgian Motor Works"], correct: 1 },
    { question: "Which country makes Ferrari?", options: ["Germany", "France", "Italy", "Spain"], correct: 2 },
    { question: "What powers an electric car?", options: ["Gasoline", "Diesel", "Electricity", "Hydrogen"], correct: 2 },
    { question: "Which brand has a logo with four rings?", options: ["BMW", "Mercedes", "Audi", "Volkswagen"], correct: 2 },
  ],
  gaming: [
    { question: "Which company created Minecraft?", options: ["Microsoft", "Mojang", "Sony", "Nintendo"], correct: 1 },
    { question: "In what year was the first GTA released?", options: ["1995", "1997", "1999", "2001"], correct: 1 },
    { question: "What is the main character's name in The Legend of Zelda?", options: ["Zelda", "Link", "Ganon", "Mario"], correct: 1 },
    { question: "Which console is from Sony?", options: ["Xbox", "Switch", "PlayStation", "Wii"], correct: 2 },
    { question: "What does RPG stand for?", options: ["Real Player Game", "Role Playing Game", "Rapid Power Game", "Random Player Guide"], correct: 1 },
  ],
  business: [
    { question: "Who founded Apple?", options: ["Bill Gates", "Steve Jobs", "Elon Musk", "Mark Zuckerberg"], correct: 1 },
    { question: "What does CEO stand for?", options: ["Chief Executive Officer", "Central Executive Officer", "Corporate Executive Officer", "Company Executive Officer"], correct: 0 },
    { question: "Which company owns Instagram?", options: ["Google", "Meta", "Twitter", "Microsoft"], correct: 1 },
    { question: "In which city is Wall Street?", options: ["Los Angeles", "Chicago", "New York", "Boston"], correct: 2 },
    { question: "What is Bitcoin?", options: ["Stock", "Cryptocurrency", "Fund", "Bond"], correct: 1 },
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

  // Automatically expand all quiz categories to 20 questions
  const baseQuestions = quizData[category] || quizData.math;
  const questions = expandQuizQuestions(baseQuestions);
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
      <>
        <FloatingHowItWorks title="How Quiz works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {percentage}%
              </div>
              <p className="text-xl">
                Correct answers: {score} of {questions.length}
              </p>
              <div className="space-y-2">
                <Button onClick={handleRestart} className="w-full" size="lg">
                  Try Again
                </Button>
                <Button onClick={() => navigate("/education")} variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Education
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button 
          onClick={() => navigate("/education")} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardDescription>
                Question {currentQuestion + 1} of {questions.length}
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
                  Confirm Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  {currentQuestion < questions.length - 1 ? "Next Question" : "Show Results"}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Score: {score} / {currentQuestion + (answered ? 1 : 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
