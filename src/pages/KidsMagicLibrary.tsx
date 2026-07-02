import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Heart, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsGoldPass } from "@/hooks/useKidsGoldPass";

import { GalleryHero } from "@/components/kids/gallery/GalleryHero";
import { GalleryStats } from "@/components/kids/gallery/GalleryStats";
import { GalleryFilters, type GalleryCategory } from "@/components/kids/gallery/GalleryFilters";
import { GalleryLightbox } from "@/components/kids/gallery/GalleryLightbox";
import { GalleryAchievements } from "@/components/kids/gallery/GalleryAchievements";
import { GalleryTimeline } from "@/components/kids/gallery/GalleryTimeline";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSMAGICLIBRARY_STEPS = [
  { title: 'Pick a story', desc: 'Illustrated stories organised by age and theme.' },
  { title: 'Read or listen', desc: 'Text-to-speech reads along with kid-friendly voices.' },
  { title: 'Answer questions', desc: 'Comprehension prompts turn reading into learning.' },
  { title: 'Collect stars', desc: 'Finishing a story rewards stars and unlocks new ones.' }
];
const __HIW_KIDSMAGICLIBRARY = { title: 'Kids Magic Library', intro: 'A curated library of interactive stories and read-alongs.', steps: __HIW_KIDSMAGICLIBRARY_STEPS };


interface Story {
  id: string;
  title: string;
  category: string;
  story_content: string;
  illustration_url: string | null;
  created_at: string;
}

interface Drawing {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

interface Character {
  id: string;
  name: string;
  hair_color: string;
  superpower: string;
  eye_color: string;
  costume_color: string;
  personality: string;
  image_url: string | null;
  created_at: string;
}

interface ColoringPage {
  id: string;
  original_image_url: string;
  processed_image_url: string;
  difficulty: string;
  created_at: string;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: GalleryCategory;
  type: "story" | "drawing" | "character" | "coloring";
  date: string;
  subtitle?: string;
}

export default function KidsMagicLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasGoldPass } = useKidsGoldPass();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Load favorites from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from("kids_gallery_favorites")
      .select("item_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavorites(data.map((r: any) => r.item_id));
      });
  }, [user]);

  // Fetch stories from DB
  const { data: stories = [] } = useQuery({
    queryKey: ["kids-stories-db", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("kids_stories")
        .select("id,title,category,story_text,illustration_url,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category || "story",
        story_content: r.story_text,
        illustration_url: r.illustration_url,
        created_at: r.created_at,
      })) as Story[];
    },
    enabled: !!user,
  });

  // Fetch drawings from DB
  const { data: drawings = [] } = useQuery({
    queryKey: ["kids-drawings-db", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("kids_drawings")
        .select("id,title,drawing_url,tutorial_topic,difficulty,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title || r.tutorial_topic || "Drawing",
        image_url: r.drawing_url,
        category: r.difficulty || "drawing",
        created_at: r.created_at,
      })) as Drawing[];
    },
    enabled: !!user,
  });

  // Fetch characters
  const { data: characters = [] } = useQuery({
    queryKey: ["kids-characters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("created_characters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Character[];
    },
    enabled: !!user,
  });

  // Fetch coloring pages
  const { data: coloringPages = [] } = useQuery({
    queryKey: ["kids-coloring-pages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("coloring_pages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ColoringPage[];
    },
    enabled: !!user,
  });


  // Build unified gallery items
  const allItems = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];

    stories.forEach((s) => {
      if (s.illustration_url) {
        items.push({
          id: s.id,
          title: s.title,
          imageUrl: s.illustration_url,
          category: "stories",
          type: "story",
          date: s.created_at,
          subtitle: s.category,
        });
      }
    });

    drawings.forEach((d) => {
      items.push({
        id: d.id,
        title: d.title,
        imageUrl: d.image_url,
        category: "drawings",
        type: "drawing",
        date: d.created_at,
        subtitle: d.category,
      });
    });

    characters.forEach((c) => {
      if (c.image_url) {
        items.push({
          id: c.id,
          title: c.name,
          imageUrl: c.image_url,
          category: "characters",
          type: "character",
          date: c.created_at,
          subtitle: c.superpower,
        });
      }
    });

    coloringPages.forEach((p) => {
      items.push({
        id: p.id,
        title: `${p.difficulty} Level`,
        imageUrl: p.processed_image_url,
        category: "coloring",
        type: "coloring",
        date: p.created_at,
        subtitle: p.difficulty,
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stories, drawings, characters, coloringPages]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeCategory === "favorites") {
      items = items.filter((i) => favorites.includes(i.id));
    } else if (activeCategory !== "all") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q));
    }
    return items;
  }, [allItems, activeCategory, search, favorites]);

  const counts: Record<GalleryCategory, number> = {
    all: allItems.length,
    stories: allItems.filter((i) => i.category === "stories").length,
    drawings: allItems.filter((i) => i.category === "drawings").length,
    characters: allItems.filter((i) => i.category === "characters").length,
    coloring: allItems.filter((i) => i.category === "coloring").length,
    favorites: favorites.length,
  };

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!user) return;
      const isFav = favorites.includes(id);
      setFavorites((prev) =>
        isFav ? prev.filter((f) => f !== id) : [...prev, id]
      );
      if (isFav) {
        await supabase
          .from("kids_gallery_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", id);
      } else {
        await supabase
          .from("kids_gallery_favorites")
          .insert({ user_id: user.id, item_id: id, item_type: "gallery" });
      }
    },
    [user, favorites]
  );

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success("Downloaded successfully! 📥");
    } catch {
      toast.error("Failed to download");
    }
  };

  // Streak (simple localStorage-based)
  const streak = useMemo(() => {
    if (!user) return 0;
    const stored = localStorage.getItem(`kids_gallery_streak_${user.id}`);
    return stored ? parseInt(stored, 10) : 0;
  }, [user]);

  // Timeline items
  const timelineItems = useMemo(
    () =>
      allItems.map((i) => ({
        id: i.id,
        title: i.title,
        type: i.type,
        date: i.date,
        imageUrl: i.imageUrl,
      })),
    [allItems]
  );

  // Lightbox items for current filter
  const lightboxItems = filteredItems.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    title: i.title,
    category: i.subtitle || i.category,
    date: format(new Date(i.date), "MMM d, yyyy"),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/80 via-pink-50/80 to-blue-50/80 dark:from-gray-900 dark:via-purple-950/50 dark:to-blue-950/50">
      <FloatingHowItWorks title={__HIW_KIDSMAGICLIBRARY.title} intro={__HIW_KIDSMAGICLIBRARY.intro} steps={__HIW_KIDSMAGICLIBRARY.steps} />
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/kids-channel")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              const url = window.location.href;
              try {
                if (navigator.share) {
                  await navigator.share({ title: "My Magic Library 🎨", url });
                } else {
                  await navigator.clipboard.writeText(url);
                  toast.success("Portfolio link copied! 🔗");
                }
              } catch (err: any) {
                if (err?.name !== "AbortError") {
                  toast.error("Couldn't share — copy the URL from the address bar.");
                }
              }
            }}
          >
            <Share2 className="h-4 w-4" /> Share Portfolio
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-2">
        <GalleryHero
          totalCreations={allItems.length}
          hasGoldPass={hasGoldPass}
        />

        <GalleryStats
          stories={stories.length}
          drawings={drawings.length}
          characters={characters.length}
          coloringPages={coloringPages.length}
          streak={streak}
        />

        <GalleryFilters
          active={activeCategory}
          onChange={setActiveCategory}
          search={search}
          onSearchChange={setSearch}
          counts={counts}
        />

        {/* Masonry grid */}
        <div className="max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <span className="text-6xl block mb-4">🎨</span>
              <h3 className="text-xl font-bold mb-2">
                {activeCategory === "favorites" ? "No favorites yet!" : "No creations yet!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeCategory === "favorites"
                  ? "Heart your favorite creations to see them here"
                  : "Start creating magical art, stories and characters!"}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate("/kids-story-creator")} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Create Story ✨
                </Button>
                <Button onClick={() => navigate("/kids-drawing-buddy")} variant="outline">
                  Start Drawing 🎨
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="break-inside-avoid group cursor-pointer"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="relative overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm truncate">{item.title}</p>
                            <p className="text-white/70 text-xs">{item.subtitle}</p>
                          </div>
                        </div>

                        {/* Favorite button */}
                        <button
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-white"
                            }`}
                          />
                        </button>

                        {/* Category badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs bg-black/30 text-white backdrop-blur-sm border-0"
                        >
                          {item.type === "story" ? "📖" : item.type === "drawing" ? "🎨" : item.type === "character" ? "🦸" : "🖌️"}{" "}
                          {item.category}
                        </Badge>
                      </div>

                      <div className="px-3 py-2.5">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Achievements */}
        <GalleryAchievements
          stories={stories.length}
          drawings={drawings.length}
          characters={characters.length}
          coloringPages={coloringPages.length}
        />

        {/* Timeline */}
        <GalleryTimeline items={timelineItems} />
      </div>

      {/* Lightbox */}
      <GalleryLightbox
        items={lightboxItems}
        currentIndex={lightboxIndex}
        isOpen={lightboxIndex >= 0}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
        onDownload={handleDownload}
        onFavorite={toggleFavorite}
        isFavorited={lightboxIndex >= 0 && favorites.includes(filteredItems[lightboxIndex]?.id || "")}
      />
    </div>
  );
}
