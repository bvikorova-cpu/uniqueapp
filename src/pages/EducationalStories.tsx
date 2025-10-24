import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Star, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface EducationalTopic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function EducationalStories() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic | null>(null);
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState(0);

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
          <Card className="bg-white border-4 border-yellow-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-orange-600 mb-2">Your Learning Progress</h3>
                  <p className="text-gray-600">Keep learning to earn more stars!</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-3xl font-bold text-orange-600">{stars}</span>
                </div>
              </div>
              <Progress value={progress} className="h-4" />
              <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
            </CardContent>
          </Card>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic, index) => (
              <Card
                key={topic.id}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-yellow-50 border-4 border-yellow-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl"
                onClick={() => setSelectedTopic(topic)}
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
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold">
                      {topic.category}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getDifficultyColor(topic.difficulty)}`} />
                  </div>
                  
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Start learning
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quiz Section */}
          <Card className="bg-gradient-to-br from-white to-orange-50 border-4 border-orange-200 mt-8">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-600 mb-2">
                Ready for a Quiz? 🎯
              </h3>
              <p className="text-gray-700 mb-6">
                Test what you've learned and earn bonus stars!
              </p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg">
                <Star className="mr-2 h-5 w-5" />
                Take Quiz Now!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
