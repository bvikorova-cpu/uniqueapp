import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, Clock, Star, Search, BookOpen, Video, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface RecordedLessonsProps {
  onBack: () => void;
}

export const RecordedLessons = ({ onBack }: RecordedLessonsProps) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['skill-swap-lessons'],
    queryFn: async () => {
      const { data: offerings } = await supabase
        .from('skill_offerings')
        .select('id, title, category, description, price_per_hour, user_id, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!offerings?.length) return [];

      const userIds = [...new Set(offerings.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get review averages
      const { data: reviews } = await supabase
        .from('skill_swap_reviews')
        .select('reviewed_user_id, rating');

      const ratingMap = new Map<string, { total: number; count: number }>();
      reviews?.forEach(r => {
        const s = ratingMap.get(r.reviewed_user_id) || { total: 0, count: 0 };
        s.total += (r.rating || 0);
        s.count++;
        ratingMap.set(r.reviewed_user_id, s);
      });

      const categoryEmojis: Record<string, string> = {
        'Technology': '💻', 'Creative': '🎨', 'Teaching': '📚',
        'Music': '🎵', 'Sports': '⚽', 'Cooking': '🍳',
        'Language': '🗣️', 'Other': '✨',
      };

      return offerings.map(o => {
        const profile = profileMap.get(o.user_id);
        const r = ratingMap.get(o.user_id);
        return {
          id: o.id,
          title: o.title,
          instructor: profile?.full_name || 'User',
          category: o.category,
          rating: r ? Math.round((r.total / r.count) * 10) / 10 : 0,
          emoji: categoryEmojis[o.category] || '✨',
          isPremium: (o.price_per_hour || 0) > 0,
          price: o.price_per_hour,
        };
      });
    },
  });

  const categories = ["All", ...new Set(lessons.map(l => l.category))];

  const filtered = lessons.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || l.category === filterCategory;
    return matchSearch && matchCat;
  });

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Recorded Lessons - How it works"} steps={[{ title: 'Open', desc: 'Access the Recorded Lessons section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Recorded Lessons.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" /> Skill Offerings
        </h2>
        <Badge variant="secondary">{lessons.length} Available</Badge>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search offerings..." className="pl-9 bg-muted/10 border-border/50" />
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center bg-card/60 border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Offerings Found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or create your own offering!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lesson, i) => (
            <motion.div key={lesson.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center">
                  <span className="text-5xl">{lesson.emoji}</span>
                  {lesson.isPremium && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500/90 text-white text-[10px]">
                        €{lesson.price}/hr
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1.5">{lesson.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">by {lesson.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {lesson.rating || '—'}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{lesson.category}</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};