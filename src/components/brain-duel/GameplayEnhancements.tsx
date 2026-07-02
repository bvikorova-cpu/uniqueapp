import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, Gift, Clock, Swords, Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = [
  "General Knowledge", "Science", "History", "Geography", "Sports",
  "Entertainment", "Technology", "Mathematics", "Literature", "Music"
];

export const BonusRoundCard = () => {
  return (
    <>
      <FloatingHowItWorks title={"Gameplay Enhancements - How it works"} steps={[{ title: 'Open', desc: 'Access the Gameplay Enhancements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gameplay Enhancements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-2 border-dashed border-yellow-500/30 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5" />
      <div className="absolute top-2 right-2">
        <Badge className="bg-yellow-500 text-white gap-1 animate-pulse shadow-md">
          <Sparkles className="h-3 w-3" /> Bonus
        </Badge>
      </div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Bonus Round
        </CardTitle>
        <CardDescription>Special questions worth 2x points. Appear randomly during matches!</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "⚡", title: "Speed Bonus", desc: "Answer in <5s for 3x", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { emoji: "🎯", title: "Perfect Round", desc: "All correct = bonus XP", bg: "bg-purple-500/10 border-purple-500/20" },
            { emoji: "🔮", title: "Mystery Q", desc: "Random category, 5x reward", bg: "bg-cyan-500/10 border-cyan-500/20" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`text-center p-3 rounded-xl border backdrop-blur-sm ${item.bg}`}
            >
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs font-semibold">{item.title}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export const MysteryCategory = () => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="relative overflow-hidden cursor-pointer border-primary/30 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-cyan-500/10" />
        <CardContent className="p-6 text-center relative">
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
    <Card className="border-primary/20 backdrop-blur-xl bg-card/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Create Custom Challenge
        </CardTitle>
        <CardDescription>Set your own rules and challenge anyone!</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="backdrop-blur-sm">
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

        <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 border border-primary/5">
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