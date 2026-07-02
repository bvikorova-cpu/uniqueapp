import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Play, Pause, Volume2, Clock, Sparkles, CloudMoon, Star } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SleepStory {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "nature" | "fantasy" | "meditation" | "ambient";
  mood: string;
  gradient: string;
  icon: string;
}

const STORIES: SleepStory[] = [
  { id: "1", title: "Moonlit Forest Walk", description: "Wander through an ancient forest under silver moonlight as gentle creatures guide your path", duration: "15 min", category: "nature", mood: "Peaceful", gradient: "from-emerald-500/20 to-teal-500/10", icon: "🌲" },
  { id: "2", title: "Ocean of Stars", description: "Float on a calm ocean while constellations tell their stories above you", duration: "20 min", category: "fantasy", mood: "Dreamy", gradient: "from-indigo-500/20 to-blue-500/10", icon: "🌌" },
  { id: "3", title: "Rain on a Tin Roof", description: "Listen to gentle rain falling on a tin roof while warm fire crackles nearby", duration: "30 min", category: "ambient", mood: "Cozy", gradient: "from-slate-500/20 to-zinc-500/10", icon: "🌧️" },
  { id: "4", title: "Mountain Sunrise", description: "Experience a peaceful sunrise from a mountain peak with birds beginning to sing", duration: "12 min", category: "nature", mood: "Uplifting", gradient: "from-amber-500/20 to-orange-500/10", icon: "🏔️" },
  { id: "5", title: "Cloud Kingdom", description: "Drift through kingdoms in the clouds, meeting gentle giants and wise spirits", duration: "25 min", category: "fantasy", mood: "Whimsical", gradient: "from-violet-500/20 to-purple-500/10", icon: "☁️" },
  { id: "6", title: "Zen Garden at Dusk", description: "Find tranquility in a Japanese zen garden as the sun sets and lanterns glow", duration: "18 min", category: "meditation", mood: "Serene", gradient: "from-rose-500/20 to-pink-500/10", icon: "🏯" },
];

const CATEGORY_COLORS: Record<string, string> = {
  nature: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  fantasy: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  meditation: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  ambient: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function SleepStories() {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  const togglePlay = (storyId: string) => {
    if (activeStory === storyId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveStory(storyId);
      setIsPlaying(true);
    }
  };

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="SleepStories — How it works" steps={[{title:"Open this tool",desc:"Access SleepStories within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-blue-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10">
            <Moon className="w-5 h-5 text-indigo-400" />
          </div>
          Sleep Stories & Sounds
        </CardTitle>
        <CardDescription>Calming narratives and ambient soundscapes to help you drift into restful sleep</CardDescription>

        {/* Sleep Timer & Volume */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {[15, 30, 45, 60].map((min) => (
                <Button
                  key={min}
                  variant="outline"
                  size="sm"
                  className={`text-xs h-7 px-2 ${sleepTimer === min ? "bg-primary/10 border-primary/30 text-primary" : "border-border/50"}`}
                  onClick={() => setSleepTimer(sleepTimer === min ? null : min)}
                >
                  {min}m
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[150px]">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STORIES.map((story, index) => {
            const isActive = activeStory === story.id;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`relative overflow-hidden border-border/30 backdrop-blur-sm cursor-pointer transition-all group h-full ${
                    isActive ? "ring-1 ring-primary/30 border-primary/20" : "hover:border-primary/20 bg-card/40"
                  }`}
                  onClick={() => togglePlay(story.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient} ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"} transition-opacity`} />
                  <CardContent className="relative pt-4 pb-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{story.icon}</span>
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[story.category]}`}>
                        {story.category}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">{story.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{story.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {story.duration}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3" /> {story.mood}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 rounded-full ${
                          isActive && isPlaying ? "bg-primary/20 text-primary" : "bg-card/60"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(story.id);
                        }}
                      >
                        {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Playing indicator */}
                    <AnimatePresence>
                      {isActive && isPlaying && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1 pt-1"
                        >
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-primary/60 rounded-full"
                              animate={{ height: [4, 12 + Math.random() * 8, 4] }}
                              transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                          <span className="text-[10px] text-primary ml-2 font-medium">Now playing...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/20">
          <CloudMoon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Pro tip:</strong> Combine a sleep story with nature sounds from the Sounds tab for the ultimate bedtime experience. Set a sleep timer and let yourself drift off naturally.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
