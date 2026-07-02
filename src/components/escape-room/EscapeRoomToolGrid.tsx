import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock, Plus, Trophy, Crown, Briefcase, Sparkles, BookOpen, Lightbulb,
  Palette, BarChart3, History, Award, Users, Zap, Star, DollarSign,
  Brain, Wand2, Volume2, Calendar, Play, Music, Timer
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const tools = [
  { id: "browse", label: "Browse Rooms", desc: "Explore 76+ immersive rooms", icon: Lock, gradient: "from-amber-500 to-orange-600" },
  { id: "create", label: "Create Room", desc: "Build & publish your own room", icon: Plus, gradient: "from-purple-500 to-violet-600" },
  { id: "leaderboard", label: "Leaderboard", desc: "Top escape artists globally", icon: Trophy, gradient: "from-yellow-500 to-amber-600" },
  { id: "premium", label: "Premium Plans", desc: "Unlock all rooms & AI tools", icon: Crown, gradient: "from-rose-500 to-pink-600" },
  { id: "corporate", label: "Corporate Events", desc: "Team building packages", icon: Briefcase, gradient: "from-blue-500 to-indigo-600" },
  { id: "ai-puzzle", label: "AI Puzzle Generator", desc: "Generate unique puzzles with AI", icon: Sparkles, gradient: "from-violet-500 to-purple-600", credits: 4 },
  { id: "ai-story", label: "AI Story Writer", desc: "Create room storylines & lore", icon: BookOpen, gradient: "from-emerald-500 to-teal-600", credits: 4 },
  { id: "ai-hint", label: "AI Hint System", desc: "Smart contextual hints", icon: Lightbulb, gradient: "from-cyan-500 to-blue-600", credits: 3 },
  { id: "ai-theme", label: "AI Theme Designer", desc: "Design room themes & atmospheres", icon: Palette, gradient: "from-pink-500 to-rose-600", credits: 5 },
  { id: "analytics", label: "Room Analytics", desc: "Performance & player insights", icon: BarChart3, gradient: "from-indigo-500 to-blue-600" },
  { id: "history", label: "My Escape History", desc: "Track your completed rooms", icon: History, gradient: "from-slate-500 to-gray-600" },
  { id: "badges", label: "Achievement Badges", desc: "Earn rewards & unlock tiers", icon: Award, gradient: "from-amber-500 to-yellow-600" },
  { id: "teams", label: "Team Manager", desc: "Manage squads & invitations", icon: Users, gradient: "from-green-500 to-emerald-600" },
  { id: "challenges", label: "Daily Challenges", desc: "Fresh puzzles every 24 hours", icon: Zap, gradient: "from-orange-500 to-red-600" },
  { id: "reviews", label: "Room Reviews", desc: "Rate & review escape rooms", icon: Star, gradient: "from-yellow-400 to-orange-500" },
  { id: "earnings", label: "Creator Earnings", desc: "Track revenue from your rooms", icon: DollarSign, gradient: "from-emerald-500 to-green-600" },
  { id: "ai-difficulty", label: "AI Difficulty Tuner", desc: "Auto-balance puzzle difficulty", icon: Brain, gradient: "from-red-500 to-rose-600", credits: 3 },
  { id: "ai-clue", label: "AI Clue Generator", desc: "Generate cryptic clue chains", icon: Wand2, gradient: "from-fuchsia-500 to-purple-600", credits: 4 },
  { id: "multiplayer", label: "Multiplayer Lobby", desc: "Real-time team waiting rooms", icon: Users, gradient: "from-green-500 to-emerald-600" },
  { id: "ai-narrator", label: "AI Room Narrator", desc: "AI voice narration scripts", icon: Volume2, gradient: "from-violet-500 to-purple-600", credits: 4 },
  { id: "season-pass", label: "Season Pass", desc: "Seasonal challenges & rewards", icon: Calendar, gradient: "from-amber-500 to-orange-600" },
  { id: "replay", label: "Room Replay", desc: "Replay rooms with analytics", icon: Play, gradient: "from-blue-500 to-indigo-600" },
  { id: "ai-sound", label: "Custom Sound Designer", desc: "AI atmospheric sound design", icon: Music, gradient: "from-pink-500 to-rose-600", credits: 5 },
  { id: "speedrun", label: "Speedrun Tournaments", desc: "Race for the fastest time", icon: Timer, gradient: "from-red-500 to-orange-600" },
];

interface Props { onToolSelect: (id: string) => void; }

export function EscapeRoomToolGrid({ onToolSelect }: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Escape Room Tool Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Room Tool Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape Room Tool Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {tools.map(tool => {
        const Icon = tool.icon;
        return (
          <Card
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border/50 hover:border-amber-500/30 group"
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                {tool.credits && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />{tool.credits} CR
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-xs md:text-sm leading-tight mb-0.5">{tool.label}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{tool.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
    </>
  );
}
