import { useState } from "react";
import { ArrowLeft, Play, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, Eye, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const STORIES = [
  {
    id: "1", artist: "Luna Wave", avatar: "🎤", title: "Epic Guitar Solo", views: 12400, likes: 890,
    duration: 15, thumbnail: "🎸", gradient: "from-violet-600 to-pink-500", timeAgo: "2h ago",
  },
  {
    id: "2", artist: "DJ Pulse", avatar: "🎧", title: "Crowd Goes Wild", views: 8200, likes: 654,
    duration: 15, thumbnail: "🎉", gradient: "from-blue-600 to-cyan-500", timeAgo: "4h ago",
  },
  {
    id: "3", artist: "The Vibes", avatar: "🎹", title: "Acoustic Surprise", views: 15600, likes: 1230,
    duration: 15, thumbnail: "🎵", gradient: "from-emerald-600 to-teal-500", timeAgo: "6h ago",
  },
  {
    id: "4", artist: "Neon Lights", avatar: "🎤", title: "Final Encore", views: 21000, likes: 1890,
    duration: 15, thumbnail: "✨", gradient: "from-amber-600 to-orange-500", timeAgo: "8h ago",
  },
  {
    id: "5", artist: "Echo Chamber", avatar: "🥁", title: "Drum Battle", views: 9800, likes: 780,
    duration: 15, thumbnail: "🥁", gradient: "from-red-600 to-rose-500", timeAgo: "12h ago",
  },
  {
    id: "6", artist: "Melody Queen", avatar: "👑", title: "High Note Hit", views: 18300, likes: 1560,
    duration: 15, thumbnail: "🎶", gradient: "from-pink-600 to-purple-500", timeAgo: "1d ago",
  },
];

export const ConcertStories = ({ onBack }: Props) => {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const currentStory = STORIES.find(s => s.id === activeStory);
  const currentIndex = STORIES.findIndex(s => s.id === activeStory);

  const openStory = (id: string) => {
    setActiveStory(id);
    setProgress(0);
    // Auto-progress timer
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Auto next
          const idx = STORIES.findIndex(s => s.id === id);
          if (idx < STORIES.length - 1) {
            setActiveStory(STORIES[idx + 1].id);
            return 0;
          }
          setActiveStory(null);
          return 100;
        }
        return prev + 2;
      });
    }, 300);
    return () => clearInterval(interval);
  };

  const toggleLike = (id: string) => {
    setLikedStories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < STORIES.length - 1) {
      setActiveStory(STORIES[currentIndex + 1].id);
      setProgress(0);
    } else setActiveStory(null);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveStory(STORIES[currentIndex - 1].id);
      setProgress(0);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Concert Stories works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Concert Stories
          </h2>
          <p className="text-sm text-muted-foreground">15-second highlights from live performances</p>
        </div>
      </div>

      {/* Story Circles */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {STORIES.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openStory(story.id)}
            className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${story.gradient} p-0.5`}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-2xl">
                {story.avatar}
              </div>
            </div>
            <p className="text-xs font-medium truncate w-16 text-center">{story.artist}</p>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {currentStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Progress Bars */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-30">
              {STORIES.map((s, i) => (
                <div key={s.id} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%" }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-30">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentStory.gradient} flex items-center justify-center text-sm`}>
                  {currentStory.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{currentStory.artist}</p>
                  <p className="text-white/60 text-xs">{currentStory.timeAgo}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white" onClick={() => setActiveStory(null)}>✕</Button>
            </div>

            {/* Content */}
            <div className={`w-full h-full bg-gradient-to-br ${currentStory.gradient} flex flex-col items-center justify-center`}>
              <span className="text-8xl mb-4">{currentStory.thumbnail}</span>
              <h3 className="text-white text-2xl font-black">{currentStory.title}</h3>
              <p className="text-white/70 text-sm mt-1">
                <Clock className="w-3 h-3 inline mr-1" />{currentStory.duration}s highlight
              </p>
            </div>

            {/* Navigation */}
            <div className="absolute left-0 top-0 w-1/3 h-full z-20 cursor-pointer" onClick={goPrev} />
            <div className="absolute right-0 top-0 w-1/3 h-full z-20 cursor-pointer" onClick={goNext} />

            {/* Bottom Actions */}
            <div className="absolute bottom-6 left-3 right-3 flex items-center justify-between z-30">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleLike(currentStory.id)} className="text-white flex items-center gap-1">
                  <Heart className={`w-6 h-6 ${likedStories.has(currentStory.id) ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-sm">{currentStory.likes + (likedStories.has(currentStory.id) ? 1 : 0)}</span>
                </button>
                <button className="text-white flex items-center gap-1">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">{(currentStory.views / 1000).toFixed(1)}k</span>
                </button>
              </div>
              <button className="text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stories Feed */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Trending Highlights</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STORIES.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openStory(story.id)}
              className="cursor-pointer group"
            >
              <div className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${story.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl">{story.thumbnail}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-bold text-xs">{story.title}</p>
                  <p className="text-white/60 text-[10px]">{story.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/60 text-[10px] flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {(story.views / 1000).toFixed(1)}k
                    </span>
                    <span className="text-white/60 text-[10px] flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {story.likes}
                    </span>
                  </div>
                </div>
                <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0 text-[10px]">
                  {story.duration}s
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
    );
};
