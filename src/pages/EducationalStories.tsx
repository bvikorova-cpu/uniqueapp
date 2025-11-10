import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Star, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LessonViewer } from "@/components/educational/LessonViewer";
import { QuizViewer } from "@/components/educational/QuizViewer";
import { educationalContent } from "@/data/educationalContent";
import { useEducationalProgress } from "@/hooks/useEducationalProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EducationalTopic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

type ViewMode = "topics" | "lessons" | "quiz" | "results";

export default function EducationalStories() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("topics");
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const topics: EducationalTopic[] = [
    {
      id: "alphabet",
      title: "Alphabet Adventure",
      emoji: "🔤",
      category: "Language",
      description: "Learn letters with fun stories!",
      difficulty: "easy"
    },
    {
      id: "numbers",
      title: "Number Kingdom",
      emoji: "🔢",
      category: "Math",
      description: "Count and learn with friendly numbers!",
      difficulty: "easy"
    },
    {
      id: "colors",
      title: "Rainbow World",
      emoji: "🌈",
      category: "Art",
      description: "Discover all the beautiful colors!",
      difficulty: "easy"
    },
    {
      id: "animals",
      title: "Animal Friends",
      emoji: "🦁",
      category: "Science",
      description: "Meet animals from around the world!",
      difficulty: "easy"
    },
    {
      id: "shapes",
      title: "Shape Explorer",
      emoji: "⭐",
      category: "Math",
      description: "Find shapes in everyday things!",
      difficulty: "easy"
    },
    {
      id: "weather",
      title: "Weather Wizard",
      emoji: "☀️",
      category: "Science",
      description: "Learn about rain, sun, and snow!",
      difficulty: "medium"
    },
    {
      id: "planets",
      title: "Space Journey",
      emoji: "🪐",
      category: "Science",
      description: "Visit planets in our solar system!",
      difficulty: "medium"
    },
    {
      id: "dinosaurs",
      title: "Dinosaur Discovery",
      emoji: "🦕",
      category: "Science",
      description: "Travel back to the time of dinosaurs!",
      difficulty: "medium"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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
      updateProgress({
        topicId: selectedTopic.id,
        totalLessons: content.lessons.length,
        lessonsCompleted: nextLesson,
      });
    } else {
      // All lessons complete, update progress and go to quiz
      updateProgress({
        topicId: selectedTopic.id,
        totalLessons: content.lessons.length,
        lessonsCompleted: content.lessons.length,
      });
      toast.success("🎉 All lessons complete! Time for the quiz!");
      setViewMode("quiz");
    }
  };

  const handleQuizComplete = (score: number) => {
    if (!selectedTopic) return;

    setQuizScore(score);
    const starsEarned = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

    const content = educationalContent[selectedTopic.id];
    updateProgress({
      topicId: selectedTopic.id,
      totalLessons: content.lessons.length,
      lessonsCompleted: content.lessons.length,
      quizScore: score,
      starsEarned,
    });

    setViewMode("results");
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentLesson(0);
    setViewMode("topics");
  };

  const totalProgress = calculateTotalProgress && calculateTotalProgress();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-lg text-gray-700">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "lessons" && selectedTopic) {
    const content = educationalContent[selectedTopic.id];
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <LessonViewer
              lessons={content.lessons}
              currentLesson={currentLesson}
              onLessonComplete={handleLessonComplete}
              onBack={handleBackToTopics}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (viewMode === "quiz" && selectedTopic) {
    const content = educationalContent[selectedTopic.id];
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <QuizViewer
              questions={content.quiz}
              onQuizComplete={handleQuizComplete}
              onBack={handleBackToTopics}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (viewMode === "results" && selectedTopic) {
    const starsEarned = quizScore >= 90 ? 3 : quizScore >= 70 ? 2 : quizScore >= 50 ? 1 : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border-4 border-yellow-300">
              <CardContent className="p-12 text-center">
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
                <h2 className="text-4xl font-bold text-orange-600 mb-4">
                  Awesome Job! 🎉
                </h2>
                <p className="text-2xl text-gray-700 mb-8">
                  You scored {quizScore}%!
                </p>
                
                <div className="flex justify-center gap-2 mb-8">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-16 h-16 ${
                        i < starsEarned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-lg text-gray-600 mb-8">
                  {starsEarned === 3 && "Perfect! You're a superstar! ⭐⭐⭐"}
                  {starsEarned === 2 && "Great work! Keep learning! ⭐⭐"}
                  {starsEarned === 1 && "Good start! Practice makes perfect! ⭐"}
                  {starsEarned === 0 && "Keep trying! You can do it! 💪"}
                </p>

                <Button
                  onClick={handleBackToTopics}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-6 text-xl"
                >
                  Learn More Topics!
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-orange-600 mb-2">
                Learn & Play! 🎓
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Fun stories that teach you amazing things!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Progress Section */}
          {totalProgress && (
            <Card className="bg-white border-4 border-yellow-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-orange-600 mb-2">Your Learning Progress</h3>
                    <p className="text-gray-600">Keep learning to earn more stars!</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    <span className="text-3xl font-bold text-orange-600">{totalProgress.totalStars}</span>
                  </div>
                </div>
                <Progress value={totalProgress.overallProgress} className="h-4" />
                <p className="text-sm text-gray-600 mt-2">
                  {totalProgress.completedTopics} of 8 topics completed ({totalProgress.overallProgress}%)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic, index) => (
              <Card
                key={topic.id}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-yellow-50 border-4 border-yellow-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{topic.emoji}</div>
                  <h3 className="text-xl font-bold text-orange-600 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {topic.description}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold">
                      {topic.category}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getDifficultyColor(topic.difficulty)}`} />
                  </div>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    onClick={() => handleStartLearning(topic)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
