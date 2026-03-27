import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, Clock, Star, Eye, Search, Filter, BookOpen, Video, Lock } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  rating: number;
  views: number;
  thumbnail: string;
  emoji: string;
  isPremium: boolean;
  level: string;
  tags: string[];
}

const MOCK_LESSONS: Lesson[] = [
  { id: "1", title: "Python for Beginners — Complete Guide", instructor: "James L.", category: "Technology", duration: "45 min", rating: 4.9, views: 1240, thumbnail: "", emoji: "🐍", isPremium: false, level: "Beginner", tags: ["Python", "Coding"] },
  { id: "2", title: "Watercolor Painting Fundamentals", instructor: "Maria G.", category: "Creative", duration: "30 min", rating: 4.8, views: 890, thumbnail: "", emoji: "🎨", isPremium: false, level: "Beginner", tags: ["Art", "Painting"] },
  { id: "3", title: "Advanced Guitar Techniques", instructor: "Tomáš M.", category: "Creative", duration: "55 min", rating: 5.0, views: 2100, thumbnail: "", emoji: "🎸", isPremium: true, level: "Advanced", tags: ["Guitar", "Music"] },
  { id: "4", title: "Japanese Conversation Practice", instructor: "Yuki T.", category: "Teaching", duration: "40 min", rating: 4.9, views: 1560, thumbnail: "", emoji: "🇯🇵", isPremium: true, level: "Intermediate", tags: ["Japanese", "Language"] },
  { id: "5", title: "Home Gardening 101", instructor: "Emma S.", category: "Gardening", duration: "25 min", rating: 4.7, views: 670, thumbnail: "", emoji: "🌱", isPremium: false, level: "Beginner", tags: ["Garden", "Plants"] },
  { id: "6", title: "UI/UX Design Masterclass", instructor: "Aisha B.", category: "Technology", duration: "60 min", rating: 4.8, views: 1890, thumbnail: "", emoji: "✨", isPremium: true, level: "Advanced", tags: ["Design", "UX"] },
  { id: "7", title: "Spanish in 30 Days — Day 1", instructor: "Carlos R.", category: "Teaching", duration: "20 min", rating: 4.6, views: 3200, thumbnail: "", emoji: "🇪🇸", isPremium: false, level: "Beginner", tags: ["Spanish", "Language"] },
  { id: "8", title: "Meditation & Mindfulness", instructor: "Priya P.", category: "Other", duration: "35 min", rating: 4.9, views: 2400, thumbnail: "", emoji: "🧘", isPremium: false, level: "Beginner", tags: ["Wellness", "Meditation"] },
  { id: "9", title: "Photography Lighting Masterclass", instructor: "Sarah K.", category: "Creative", duration: "50 min", rating: 4.8, views: 1100, thumbnail: "", emoji: "📸", isPremium: true, level: "Advanced", tags: ["Photography", "Lighting"] },
];

interface RecordedLessonsProps {
  onBack: () => void;
}

export const RecordedLessons = ({ onBack }: RecordedLessonsProps) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", ...new Set(MOCK_LESSONS.map(l => l.category))];

  const filtered = MOCK_LESSONS.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === "All" || l.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" /> Lesson Library
        </h2>
        <Badge variant="secondary">{MOCK_LESSONS.length} Lessons</Badge>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons..." className="pl-9 bg-muted/10 border-border/50" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <Button key={c} size="sm" variant={filterCategory === c ? "default" : "outline"} onClick={() => setFilterCategory(c)} className="text-xs h-8">
                {c}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson, i) => (
          <motion.div key={lesson.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center">
                <span className="text-5xl">{lesson.emoji}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </motion.div>
                </div>
                {lesson.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500/90 text-white text-[10px] gap-1">
                      <Lock className="w-2.5 h-2.5" /> Premium
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                    <Clock className="w-2.5 h-2.5 mr-1" /> {lesson.duration}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm line-clamp-2 mb-1.5">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">by {lesson.instructor}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {lesson.rating}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> {lesson.views.toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{lesson.level}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lesson.tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center bg-card/60 border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Lessons Found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </Card>
      )}
    </motion.div>
  );
};
