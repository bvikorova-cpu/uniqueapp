import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LessonViewer } from "@/components/educational/LessonViewer";
import { QuizViewer } from "@/components/educational/QuizViewer";
import { CompletionCelebration } from "@/components/educational/CompletionCelebration";
import { EducationalHero } from "@/components/educational/EducationalHero";
import { EnchantedTopicCard } from "@/components/educational/EnchantedTopicCard";
import { CategoryFilter } from "@/components/educational/CategoryFilter";
import { ProgressDashboard } from "@/components/educational/ProgressDashboard";
import { LearningStreakTracker } from "@/components/educational/LearningStreakTracker";
import { AchievementBadges } from "@/components/educational/AchievementBadges";
import { LearningMap } from "@/components/educational/LearningMap";
import { educationalContent } from "@/data/educationalContent";
import { useEducationalProgress } from "@/hooks/useEducationalProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_EDUCATIONALSTORIES_STEPS = [
  { title: 'Browse by topic', desc: 'Stories are grouped by subject and age.' },
  { title: 'Read or listen', desc: 'Each story has audio narration.' },
  { title: 'Answer comprehension', desc: 'Short questions turn reading into learning.' },
  { title: 'Earn stars & badges', desc: 'Completing stories rewards progress.' }
];
const __HIW_EDUCATIONALSTORIES = { title: 'Educational Stories', intro: 'Stories that teach — history, science and life lessons.', steps: __HIW_EDUCATIONALSTORIES_STEPS };


interface EducationalTopic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

type ViewMode = "topics" | "lessons" | "quiz" | "results" | "certificate";

const topics: EducationalTopic[] = [
  { id: "alphabet", title: "Alphabet Adventure", emoji: "🔤", category: "Language", description: "Learn letters with fun stories!", difficulty: "easy" },
  { id: "numbers", title: "Number Kingdom", emoji: "🔢", category: "Math", description: "Count and learn with friendly numbers!", difficulty: "easy" },
  { id: "colors", title: "Rainbow World", emoji: "🌈", category: "Art", description: "Discover all the beautiful colors!", difficulty: "easy" },
  { id: "animals", title: "Animal Friends", emoji: "🦁", category: "Science", description: "Meet animals from around the world!", difficulty: "easy" },
  { id: "shapes", title: "Shape Explorer", emoji: "⭐", category: "Math", description: "Find shapes in everyday things!", difficulty: "easy" },
  { id: "weather", title: "Weather Wizard", emoji: "☀️", category: "Science", description: "Learn about rain, sun, and snow!", difficulty: "medium" },
  { id: "planets", title: "Space Journey", emoji: "🪐", category: "Science", description: "Visit planets in our solar system!", difficulty: "medium" },
  { id: "dinosaurs", title: "Dinosaur Discovery", emoji: "🦕", category: "Science", description: "Travel back to the time of dinosaurs!", difficulty: "medium" },
  { id: "transportation", title: "Transportation Adventure", emoji: "🚗", category: "Science", description: "Discover different types of transportation!", difficulty: "easy" },
  { id: "food", title: "Food World", emoji: "🍎", category: "Health", description: "Learn about healthy foods!", difficulty: "easy" },
  { id: "family", title: "My Family", emoji: "👨‍👩‍👧‍👦", category: "Social", description: "Learn about your family!", difficulty: "easy" },
  { id: "emotions", title: "World of Emotions", emoji: "😊", category: "Social", description: "Learn to understand feelings!", difficulty: "medium" },
  { id: "professions", title: "Cool Careers", emoji: "👨‍⚕️", category: "Social", description: "Discover amazing jobs!", difficulty: "medium" },
  { id: "household", title: "Home Helpers", emoji: "🧹", category: "Life Skills", description: "Learn household activities!", difficulty: "easy" },
  { id: "holidays", title: "Holiday Fun", emoji: "🎂", category: "Culture", description: "Celebrate holidays and traditions!", difficulty: "easy" },
  { id: "science", title: "Science Lab", emoji: "🧪", category: "Science", description: "Do cool experiments and discover!", difficulty: "hard" },
  { id: "music", title: "Music & Instruments", emoji: "🎹", category: "Arts", description: "Learn about music and instruments!", difficulty: "medium" },
  { id: "sports", title: "Sports & Exercise", emoji: "⚽", category: "Health", description: "Get active and play sports!", difficulty: "medium" },
  { id: "body", title: "Body & Health", emoji: "❤️", category: "Health", description: "Learn how your body works!", difficulty: "hard" },
];

export default function EducationalStories() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("topics");
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { progress, updateProgress, saveQuizAnswer, calculateTotalProgress } = useEducationalProgress();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to track your progress");
      setTimeout(() => navigate("/auth"), 2000);
    } else {
      setIsAuthenticated(true);
    }
  };

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(topics.map(t => t.category))];
    return cats;
  }, []);

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
      const matchesSearch = !searchQuery || topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === "all" || topic.difficulty === selectedDifficulty;
      return matchesCategory && matchesSearch && matchesDifficulty;
    });
  }, [selectedCategory, searchQuery, selectedDifficulty]);

  const totalProgress = calculateTotalProgress && calculateTotalProgress();
  const totalStars = totalProgress && typeof totalProgress === 'object' ? totalProgress.totalStars : 0;
  const completedTopics = totalProgress && typeof totalProgress === 'object' ? totalProgress.completedTopics : 0;

  // Build topic progress list for dashboard
  const topicProgressList = useMemo(() => {
    if (!progress || !Array.isArray(progress)) return [];
    return (progress as any[]).map(p => {
      const topic = topics.find(t => t.id === p.topic_id);
      return {
        topicId: p.topic_id,
        topicTitle: topic?.title || p.topic_id,
        topicEmoji: topic?.emoji || "📚",
        lessonsCompleted: p.lessons_completed || 0,
        totalLessons: p.total_lessons || 3,
        quizScore: p.quiz_score || 0,
        starsEarned: p.stars_earned || 0,
        isCompleted: p.is_completed || false,
      };
    });
  }, [progress]);

  const completedTopicIds = topicProgressList.filter(p => p.isCompleted).map(p => p.topicId);
  const quizzesPassed = topicProgressList.filter(p => p.quizScore >= 70).length;

  const allTopicsCompleted = completedTopics === 19;
  const averageQuizScore = topicProgressList.length > 0
    ? topicProgressList.reduce((sum, p) => sum + p.quizScore, 0) / topicProgressList.length
    : 0;

  const handleStartLearning = (topic: EducationalTopic) => {
    setSelectedTopic(topic);
    setCurrentLesson(0);
    setViewMode("lessons");
  };

  const handleLessonComplete = () => {
    if (!selectedTopic) return;
    const content = educationalContent[selectedTopic.id];
    const nextLesson = currentLesson + 1;
    if (nextLesson < content.lessons.length) {
      setCurrentLesson(nextLesson);
      updateProgress({ topicId: selectedTopic.id, totalLessons: content.lessons.length, lessonsCompleted: nextLesson });
    } else {
      updateProgress({ topicId: selectedTopic.id, totalLessons: content.lessons.length, lessonsCompleted: content.lessons.length });
      toast.success("🎉 All lessons complete! Time for the quiz!");
      setViewMode("quiz");
    }
  };

  const handleQuizComplete = (score: number) => {
    if (!selectedTopic) return;
    setQuizScore(score);
    const starsEarned = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    const content = educationalContent[selectedTopic.id];
    updateProgress({ topicId: selectedTopic.id, totalLessons: content.lessons.length, lessonsCompleted: content.lessons.length, quizScore: score, starsEarned });
    setViewMode("results");
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentLesson(0);
    setViewMode("topics");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
      <FloatingHowItWorks title={__HIW_EDUCATIONALSTORIES.title} intro={__HIW_EDUCATIONALSTORIES.intro} steps={__HIW_EDUCATIONALSTORIES.steps} />
        <Card className="p-8"><CardContent><p className="text-lg text-muted-foreground">Loading...</p></CardContent></Card>
      </div>
    );
  }

  if (viewMode === "lessons" && selectedTopic) {
    const content = educationalContent[selectedTopic.id];
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <LessonViewer lessons={content.lessons} currentLesson={currentLesson} onLessonComplete={handleLessonComplete} onBack={handleBackToTopics} />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "quiz" && selectedTopic) {
    const content = educationalContent[selectedTopic.id];
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <QuizViewer questions={content.quiz} onQuizComplete={handleQuizComplete} onBack={handleBackToTopics} />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "results" && selectedTopic) {
    const starsEarned = quizScore >= 90 ? 3 : quizScore >= 70 ? 2 : quizScore >= 50 ? 1 : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-2xl">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6 animate-bounce" />
                  <h2 className="text-4xl font-black text-foreground mb-4">Awesome Job! 🎉</h2>
                  <p className="text-2xl text-muted-foreground mb-8">You scored {quizScore}%!</p>
                  <div className="flex justify-center gap-2 mb-8">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className={`w-16 h-16 ${i < starsEarned ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-lg text-muted-foreground mb-8">
                    {starsEarned === 3 && "Perfect! You're a superstar! ⭐⭐⭐"}
                    {starsEarned === 2 && "Great work! Keep learning! ⭐⭐"}
                    {starsEarned === 1 && "Good start! Practice makes perfect! ⭐"}
                    {starsEarned === 0 && "Keep trying! You can do it! 💪"}
                  </p>
                  <Button onClick={handleBackToTopics} size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-xl">
                    Learn More Topics!
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "certificate" && totalProgress && typeof totalProgress === 'object') {
    return (
      <CompletionCelebration
        totalTopicsCompleted={totalProgress.completedTopics}
        totalStarsEarned={totalProgress.totalStars}
        averageQuizScore={averageQuizScore}
        onClose={handleBackToTopics}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button variant="ghost" onClick={() => navigate("/kids-channel")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-6xl mx-auto">
          {/* Animated Hero */}
          <EducationalHero
            totalStars={totalStars}
            completedTopics={completedTopics}
            totalTopics={topics.length}
            streak={topicProgressList.length > 0 ? Math.min(topicProgressList.length, 7) : 0}
          />

          {/* Streak & XP */}
          <LearningStreakTracker
            streak={topicProgressList.length > 0 ? Math.min(topicProgressList.length, 7) : 0}
            totalXP={completedTopics * 100 + totalStars * 25}
          />

          {/* Achievement Badges */}
          <AchievementBadges
            completedTopics={completedTopics}
            totalStars={totalStars}
            streak={topicProgressList.length > 0 ? Math.min(topicProgressList.length, 7) : 0}
            quizzesPassed={quizzesPassed}
          />

          {/* Learning Map */}
          <LearningMap topics={topics} completedTopicIds={completedTopicIds} />

          {/* Progress Dashboard */}
          <ProgressDashboard topicProgressList={topicProgressList} />

          {/* Certificate Button */}
          {allTopicsCompleted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 mb-8 text-center border-2 border-amber-300">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h4 className="text-xl font-bold text-foreground mb-2">Congratulations! 🎉</h4>
              <p className="text-muted-foreground mb-4">You've completed all topics!</p>
              <Button onClick={() => setViewMode("certificate")} size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                <Trophy className="mr-2 h-5 w-5" /> Get Your Certificate
              </Button>
            </motion.div>
          )}

          {/* Category Filter & Search */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
          />

          {/* Topics Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedDifficulty}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredTopics.map((topic, index) => {
                const topicProg = topicProgressList.find(p => p.topicId === topic.id);
                return (
                  <EnchantedTopicCard
                    key={topic.id}
                    topic={topic}
                    index={index}
                    progress={topicProg ? {
                      lessonsCompleted: topicProg.lessonsCompleted,
                      totalLessons: topicProg.totalLessons,
                      starsEarned: topicProg.starsEarned,
                      isCompleted: topicProg.isCompleted,
                    } : undefined}
                    onStart={() => handleStartLearning(topic)}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No topics found. Try a different filter!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
