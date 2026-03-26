import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, HelpCircle, Gift, Clock, Target, Swords, Share2,
  Copy, Link, Users, Zap, Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES = [
  "General Knowledge", "Science", "History", "Geography", "Sports",
  "Entertainment", "Technology", "Mathematics", "Literature", "Music"
];

export const BonusRoundCard = () => {
  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
      <div className="absolute top-2 right-2">
        <Badge className="bg-yellow-500 text-white gap-1 animate-pulse">
          <Sparkles className="h-3 w-3" /> Bonus
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Bonus Round
        </CardTitle>
        <CardDescription>Special questions worth 2x points. Appear randomly during matches!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-yellow-500/10 rounded-xl">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-semibold">Speed Bonus</div>
            <div className="text-[10px] text-muted-foreground">Answer in &lt;5s for 3x</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-xl">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs font-semibold">Perfect Round</div>
            <div className="text-[10px] text-muted-foreground">All correct = bonus XP</div>
          </div>
          <div className="text-center p-3 bg-cyan-500/10 rounded-xl">
            <div className="text-2xl mb-1">🔮</div>
            <div className="text-xs font-semibold">Mystery Q</div>
            <div className="text-[10px] text-muted-foreground">Random category, 5x reward</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MysteryCategory = () => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="relative overflow-hidden cursor-pointer border-primary/30 bg-gradient-to-br from-primary/10 via-violet-500/5 to-cyan-500/10">
        <CardContent className="p-6 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl mb-3"
          >
            🔮
          </motion.div>
          <h3 className="font-bold text-lg mb-1">Mystery Category</h3>
          <p className="text-sm text-muted-foreground mb-3">Random topic, higher stakes, bigger rewards</p>
          <div className="flex justify-center gap-3">
            <Badge className="bg-primary/15 text-primary border-primary/30">3x Credits</Badge>
            <Badge className="bg-violet-500/15 text-violet-500 border-violet-500/30">+100 XP</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const CustomChallenge = () => {
  const [category, setCategory] = useState("General Knowledge");
  const [questions, setQuestions] = useState(10);
  const [timePerQ, setTimePerQ] = useState(15);
  const [entry, setEntry] = useState(10);

  const handleCreateChallenge = () => {
    const challengeLink = `${window.location.origin}/brain-duel?challenge=custom_${Date.now()}`;
    navigator.clipboard.writeText(challengeLink);
    toast.success("Challenge link copied! Share it with your friend.");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Create Custom Challenge
        </CardTitle>
        <CardDescription>Set your own rules and challenge anyone!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="mystery">🔮 Mystery (Random)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Questions: {questions}</label>
            <Slider value={[questions]} onValueChange={([v]) => setQuestions(v)} min={5} max={50} step={5} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Time per question: {timePerQ}s</label>
            <Slider value={[timePerQ]} onValueChange={([v]) => setTimePerQ(v)} min={5} max={30} step={5} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Entry: {entry} credits</label>
            <Slider value={[entry]} onValueChange={([v]) => setEntry(v)} min={5} max={100} step={5} />
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Winner gets:</span>
            <Badge variant="outline" className="text-green-500 border-green-500/30 font-bold">
              +{entry * 2} credits
            </Badge>
          </div>
        </div>

        <Button onClick={handleCreateChallenge} className="w-full gap-2">
          <Share2 className="h-4 w-4" />
          Create & Copy Challenge Link
        </Button>
      </CardContent>
    </Card>
  );
};
