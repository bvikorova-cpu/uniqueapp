import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Trophy, Dices, Brain, Swords, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface ChatGamesProps {
  onBack: () => void;
  userId: string;
}

type GameType = "trivia" | "wordchain" | "rps" | "emoji-guess" | null;

const TRIVIA_QUESTIONS = [
  { q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
  { q: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Neptune", "Uranus"], answer: 1 },
  { q: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2 },
  { q: "Which element has the chemical symbol 'Au'?", options: ["Silver", "Gold", "Aluminum", "Argon"], answer: 1 },
  { q: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },
  { q: "How many bones does an adult human have?", options: ["186", "196", "206", "216"], answer: 2 },
  { q: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { q: "What is the speed of light in km/s?", options: ["200,000", "250,000", "300,000", "350,000"], answer: 2 },
];

const EMOJI_PUZZLES = [
  { emojis: "🎬🦁👑", answer: "The Lion King" },
  { emojis: "🕷️🕸️🦸", answer: "Spider-Man" },
  { emojis: "⭐🔫💫", answer: "Star Wars" },
  { emojis: "🧊❄️👸", answer: "Frozen" },
  { emojis: "🦇🌃🦹", answer: "Batman" },
  { emojis: "🧙‍♂️💍🌋", answer: "Lord of the Rings" },
  { emojis: "🚢💑🧊", answer: "Titanic" },
  { emojis: "🦖🏝️🔬", answer: "Jurassic Park" },
];

const RPS_CHOICES = ["🪨", "📄", "✂️"] as const;

export const ChatGames = ({ onBack, userId }: ChatGamesProps) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [rpsResult, setRpsResult] = useState<{ player: string; cpu: string; result: string } | null>(null);
  const [rpsScore, setRpsScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [emojiGuess, setEmojiGuess] = useState("");
  const [emojiScore, setEmojiScore] = useState(0);
  const [emojiRevealed, setEmojiRevealed] = useState(false);
  const [wordChain, setWordChain] = useState<string[]>(["apple"]);
  const [wordInput, setWordInput] = useState("");
  const { toast } = useToast();

  // Trivia
  const answerTrivia = (optionIndex: number) => {
    if (triviaAnswered) return;
    setTriviaAnswered(true);
    if (optionIndex === TRIVIA_QUESTIONS[triviaIndex].answer) {
      setTriviaScore(s => s + 1);
      toast({ title: "Correct! 🎉", description: "+1 point" });
    } else {
      toast({ title: "Wrong! 😢", description: `Answer: ${TRIVIA_QUESTIONS[triviaIndex].options[TRIVIA_QUESTIONS[triviaIndex].answer]}`, variant: "destructive" });
    }
  };

  const nextTrivia = () => {
    setTriviaIndex(i => (i + 1) % TRIVIA_QUESTIONS.length);
    setTriviaAnswered(false);
  };

  // RPS
  const playRPS = (choice: string) => {
    const cpuChoice = RPS_CHOICES[Math.floor(Math.random() * 3)];
    const pi = RPS_CHOICES.indexOf(choice as any);
    const ci = RPS_CHOICES.indexOf(cpuChoice);
    let result = "Draw";
    if ((pi + 1) % 3 === ci) { result = "You Lose"; setRpsScore(s => ({ ...s, losses: s.losses + 1 })); }
    else if (pi !== ci) { result = "You Win!"; setRpsScore(s => ({ ...s, wins: s.wins + 1 })); }
    else { setRpsScore(s => ({ ...s, draws: s.draws + 1 })); }
    setRpsResult({ player: choice, cpu: cpuChoice, result });
  };

  // Emoji Guess
  const checkEmojiGuess = () => {
    const correct = EMOJI_PUZZLES[emojiIndex].answer.toLowerCase();
    if (emojiGuess.toLowerCase().includes(correct.toLowerCase().split(" ").pop()!)) {
      setEmojiScore(s => s + 1);
      toast({ title: "Correct! 🎬", description: `It was "${EMOJI_PUZZLES[emojiIndex].answer}"` });
    } else {
      setEmojiRevealed(true);
      toast({ title: "Not quite!", description: `Answer: ${EMOJI_PUZZLES[emojiIndex].answer}`, variant: "destructive" });
    }
    setEmojiGuess("");
    setTimeout(() => { setEmojiIndex(i => (i + 1) % EMOJI_PUZZLES.length); setEmojiRevealed(false); }, 1500);
  };

  // Word Chain
  const addWord = () => {
    const word = wordInput.trim().toLowerCase();
    if (!word) return;
    const lastWord = wordChain[wordChain.length - 1];
    if (word[0] !== lastWord[lastWord.length - 1]) {
      toast({ title: "Invalid!", description: `Word must start with "${lastWord[lastWord.length - 1]}"`, variant: "destructive" });
      return;
    }
    if (wordChain.includes(word)) {
      toast({ title: "Already used!", description: "Try a different word.", variant: "destructive" });
      return;
    }
    setWordChain(prev => [...prev, word]);
    setWordInput("");

    // CPU response
    setTimeout(() => {
      const lastChar = word[word.length - 1];
      const cpuWords = ["eagle", "elephant", "energy", "table", "star", "rain", "note", "engine", "orange", "exit", "tiger", "red", "dark", "kite", "earth", "heart", "time", "echo"];
      const valid = cpuWords.find(w => w[0] === lastChar && !wordChain.includes(w) && w !== word);
      if (valid) {
        setWordChain(prev => [...prev, valid]);
      } else {
        toast({ title: "You Win! 🏆", description: "CPU couldn't find a word!" });
      }
    }, 1000);
  };

  const games = [
    { id: "trivia" as GameType, icon: Brain, name: "Quick Trivia", desc: "Test your knowledge", color: "from-cyan-500 to-blue-500" },
    { id: "rps" as GameType, icon: Swords, name: "Rock Paper Scissors", desc: "Classic showdown", color: "from-emerald-500 to-teal-500" },
    { id: "emoji-guess" as GameType, icon: Sparkles, name: "Emoji Movie Quiz", desc: "Guess the movie", color: "from-purple-500 to-pink-500" },
    { id: "wordchain" as GameType, icon: Dices, name: "Word Chain", desc: "Last letter starts next", color: "from-amber-500 to-orange-500" },
  ];

  if (!activeGame) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Chat Games</h2>
            <p className="text-sm text-muted-foreground">Play mini-games while chatting</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(game.id)}
              className="cursor-pointer"
            >
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mx-auto mb-3`}>
                    <game.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-black mb-1">{game.name}</h3>
                  <p className="text-xs text-muted-foreground">{game.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setActiveGame(null)}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="text-xl font-black">{games.find(g => g.id === activeGame)?.name}</h2>
      </div>

      {activeGame === "trivia" && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Question {triviaIndex + 1}/{TRIVIA_QUESTIONS.length}</span>
              <span className="font-black text-primary">Score: {triviaScore}</span>
            </div>
            <h3 className="text-lg font-black">{TRIVIA_QUESTIONS[triviaIndex].q}</h3>
            <div className="grid grid-cols-2 gap-2">
              {TRIVIA_QUESTIONS[triviaIndex].options.map((opt, i) => (
                <motion.div key={i} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className={`w-full h-auto py-3 text-sm ${
                      triviaAnswered && i === TRIVIA_QUESTIONS[triviaIndex].answer ? "border-emerald-500 bg-emerald-500/20" :
                      triviaAnswered ? "opacity-50" : ""
                    }`}
                    onClick={() => answerTrivia(i)}
                    disabled={triviaAnswered}
                  >
                    {opt}
                  </Button>
                </motion.div>
              ))}
            </div>
            {triviaAnswered && (
              <Button onClick={nextTrivia} className="w-full bg-gradient-to-r from-primary to-accent text-white">
                Next Question →
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeGame === "rps" && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4 text-center">
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-emerald-500 font-bold">W: {rpsScore.wins}</span>
              <span className="text-muted-foreground font-bold">D: {rpsScore.draws}</span>
              <span className="text-red-500 font-bold">L: {rpsScore.losses}</span>
            </div>
            {rpsResult && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-2">
                <div className="flex items-center justify-center gap-6 text-5xl">
                  <span>{rpsResult.player}</span>
                  <span className="text-lg font-black text-muted-foreground">VS</span>
                  <span>{rpsResult.cpu}</span>
                </div>
                <p className={`text-xl font-black ${rpsResult.result === "You Win!" ? "text-emerald-500" : rpsResult.result === "You Lose" ? "text-red-500" : "text-muted-foreground"}`}>
                  {rpsResult.result}
                </p>
              </motion.div>
            )}
            <div className="flex justify-center gap-4">
              {RPS_CHOICES.map((choice) => (
                <motion.div key={choice} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" className="text-4xl h-20 w-20" onClick={() => playRPS(choice)}>
                    {choice}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeGame === "emoji-guess" && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4 text-center">
            <span className="text-sm text-muted-foreground">Score: <span className="font-bold text-primary">{emojiScore}</span></span>
            <p className="text-5xl tracking-widest">{EMOJI_PUZZLES[emojiIndex].emojis}</p>
            <p className="text-sm text-muted-foreground">Guess the movie!</p>
            {emojiRevealed && <p className="font-black text-lg text-primary">{EMOJI_PUZZLES[emojiIndex].answer}</p>}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Type your guess..."
                value={emojiGuess}
                onChange={(e) => setEmojiGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkEmojiGuess()}
              />
              <Button onClick={checkEmojiGuess} disabled={!emojiGuess.trim()}>Guess</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeGame === "wordchain" && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chain: {wordChain.length} words</span>
              <Button variant="ghost" size="sm" onClick={() => { setWordChain(["apple"]); setWordInput(""); }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {wordChain.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    i % 2 === 0 ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent-foreground"
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder={`Word starting with "${wordChain[wordChain.length - 1].slice(-1)}"...`}
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWord()}
              />
              <Button onClick={addWord} disabled={!wordInput.trim()}>Add</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
