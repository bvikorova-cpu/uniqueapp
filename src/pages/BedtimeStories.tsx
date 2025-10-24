import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Star, Volume2, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BedtimeStories() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  const stories = [
    {
      id: 1,
      title: "Sleepy Cloud's Journey",
      emoji: "☁️",
      description: "Float away with a gentle cloud to dreamland",
      duration: "10 min"
    },
    {
      id: 2,
      title: "The Quiet Forest",
      emoji: "🌲",
      description: "Walk through a peaceful forest at night",
      duration: "15 min"
    },
    {
      id: 3,
      title: "Starlight Adventures",
      emoji: "⭐",
      description: "Watch the stars twinkle and tell their stories",
      duration: "12 min"
    },
    {
      id: 4,
      title: "Ocean Dreams",
      emoji: "🌊",
      description: "Drift with gentle waves to sleep",
      duration: "20 min"
    },
    {
      id: 5,
      title: "Moonlight Garden",
      emoji: "🌸",
      description: "Visit a magical garden under the moonlight",
      duration: "15 min"
    },
    {
      id: 6,
      title: "Cozy Bear's Lullaby",
      emoji: "🐻",
      description: "Snuggle up with a sleepy bear friend",
      duration: "10 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 hover:bg-white/10 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-indigo-800/50 backdrop-blur-sm border-4 border-purple-400/30 shadow-2xl mb-8">
            <CardHeader className="text-center">
              <Moon className="w-16 h-16 text-yellow-300 mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-4xl font-bold text-white mb-2">
                Bedtime Stories 🌙
              </CardTitle>
              <CardDescription className="text-lg text-purple-200">
                Calming stories to help you drift off to dreamland
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Audio Controls */}
          <Card className="bg-white/10 backdrop-blur-md border-2 border-purple-400/30 mb-8">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Volume
                    </label>
                    <span className="text-purple-200">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Timer Control */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Sleep Timer
                    </label>
                    <span className="text-purple-200">{selectedDuration} min</span>
                  </div>
                  <Slider
                    value={[selectedDuration]}
                    onValueChange={(value) => setSelectedDuration(value[0])}
                    min={5}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-900/50 rounded-lg">
                <p className="text-purple-200 text-sm text-center">
                  💫 The story will gently fade out after {selectedDuration} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <Card
                key={story.id}
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-800/80 to-purple-800/80 backdrop-blur-sm border-2 border-purple-400/30 hover:border-purple-300 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{story.emoji}</div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-sm text-purple-200 mb-4">
                    {story.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-purple-300" />
                    <span className="text-sm text-purple-300">{story.duration}</span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Listen Now
                  </Button>
                </CardContent>

                {/* Animated stars */}
                <div className="absolute top-4 right-4">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>

          {/* Night Mode Tip */}
          <Card className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 backdrop-blur-md border-2 border-purple-400/30 mt-8">
            <CardContent className="p-8 text-center">
              <Moon className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Sweet Dreams! 💤
              </h3>
              <p className="text-purple-200 mb-4">
                These stories are designed with calming music and gentle voices to help you fall asleep peacefully.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-purple-300">
                <span>🌙 Dark mode enabled</span>
                <span>•</span>
                <span>🔇 Gentle fade-out</span>
                <span>•</span>
                <span>✨ Relaxing music</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
