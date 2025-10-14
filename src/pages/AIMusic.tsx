import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, Sparkles, Heart, Activity, Mic, Users, Star, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

const AIMusic = () => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("");
  const [activity, setActivity] = useState("");
  const [playlist, setPlaylist] = useState<any>(null);
  const [therapySession, setTherapySession] = useState<any>(null);
  const [discoveries, setDiscoveries] = useState<any>(null);
  const [karaokeSong, setKaraokeSong] = useState("");
  const [vocalCoachTips, setVocalCoachTips] = useState<any>(null);

  const moods = [
    { value: "happy", label: "Happy", icon: "😊" },
    { value: "sad", label: "Sad", icon: "😢" },
    { value: "energetic", label: "Energetic", icon: "⚡" },
    { value: "relaxed", label: "Relaxed", icon: "😌" },
    { value: "focused", label: "Focused", icon: "🎯" },
    { value: "romantic", label: "Romantic", icon: "💕" },
  ];

  const activities = [
    { value: "workout", label: "Workout", icon: "💪" },
    { value: "study", label: "Study", icon: "📚" },
    { value: "party", label: "Party", icon: "🎉" },
    { value: "sleep", label: "Sleep", icon: "😴" },
    { value: "work", label: "Work", icon: "💼" },
    { value: "meditation", label: "Meditation", icon: "🧘" },
  ];

  const checkCredits = (required: number) => {
    if (credits.credits_remaining < required) {
      toast.error(`You need ${required} credits. Redirecting...`);
      setTimeout(() => navigate('/ai-credits'), 1500);
      return false;
    }
    return true;
  };

  const generatePlaylist = async () => {
    if (!mood && !activity) {
      toast.error("Select a mood or activity");
      return;
    }
    if (!checkCredits(5)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-music-curator', {
        body: {
          type: 'playlist',
          mood,
          activity,
        }
      });

      if (error) throw error;
      setPlaylist(data.playlist);
      await refresh();
      toast.success("Playlist created!");
    } catch (error: any) {
      toast.error(error.message || "Error generating playlist");
    } finally {
      setLoading(false);
    }
  };

  const generateTherapySession = async () => {
    if (!checkCredits(10)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-music-curator', {
        body: {
          type: 'therapy',
          mood,
        }
      });

      if (error) throw error;
      setTherapySession(data.session);
      await refresh();
      toast.success("Therapy session created!");
    } catch (error: any) {
      toast.error(error.message || "Error generating session");
    } finally {
      setLoading(false);
    }
  };

  const discoverArtists = async () => {
    if (!checkCredits(5)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-music-curator', {
        body: {
          type: 'discover',
          preferences: { mood, activity },
        }
      });

      if (error) throw error;
      setDiscoveries(data.artists);
      await refresh();
      toast.success("New artists discovered!");
    } catch (error: any) {
      toast.error(error.message || "Error discovering artists");
    } finally {
      setLoading(false);
    }
  };

  const getVocalCoaching = async () => {
    if (!karaokeSong) {
      toast.error("Enter a song name");
      return;
    }
    if (!checkCredits(8)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-music-curator', {
        body: {
          type: 'karaoke',
          song: karaokeSong,
        }
      });

      if (error) throw error;
      setVocalCoachTips(data.tips);
      await refresh();
      toast.success("AI Vocal Coach ready!");
    } catch (error: any) {
      toast.error(error.message || "Error generating tips");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Music & Playlist Curator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your personal music assistant for the perfect music experience
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Credits: {credits.credits_remaining}</span>
          </div>
        </div>

        <Tabs defaultValue="playlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-4xl mx-auto">
            <TabsTrigger value="playlist" className="gap-2">
              <Music className="h-4 w-4" />
              Playlist
            </TabsTrigger>
            <TabsTrigger value="therapy" className="gap-2">
              <Heart className="h-4 w-4" />
              Therapy
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-2">
              <Users className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="karaoke" className="gap-2">
              <Mic className="h-4 w-4" />
              Karaoke
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playlist" className="space-y-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Music className="h-6 w-6 text-primary" />
                Create Playlist by Mood
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Choose your mood</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {moods.map((m) => (
                      <Button
                        key={m.value}
                        variant={mood === m.value ? "default" : "outline"}
                        onClick={() => setMood(m.value)}
                        className="gap-2"
                      >
                        <span>{m.icon}</span>
                        {m.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Or activity</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {activities.map((a) => (
                      <Button
                        key={a.value}
                        variant={activity === a.value ? "default" : "outline"}
                        onClick={() => setActivity(a.value)}
                        className="gap-2"
                      >
                        <span>{a.icon}</span>
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={generatePlaylist}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Playlist (5 credits)
                </Button>

                {playlist && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg space-y-3">
                    <h3 className="font-bold text-lg">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlist.description}</p>
                    <div className="space-y-2">
                      {playlist.songs?.map((song: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-background rounded">
                          <Play className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="therapy" className="space-y-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Music Therapy Session
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Create a personalized music therapy for your current emotional state
                </p>

                <Button 
                  onClick={generateTherapySession}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Start Therapy Session (10 credits)
                </Button>

                {therapySession && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg space-y-3">
                    <h3 className="font-bold text-lg">{therapySession.title}</h3>
                    <p className="text-sm">{therapySession.description}</p>
                    <div className="space-y-2">
                      {therapySession.exercises?.map((exercise: any, idx: number) => (
                        <div key={idx} className="p-3 bg-background rounded">
                           <p className="font-medium">{exercise.name}</p>
                           <p className="text-sm text-muted-foreground">{exercise.instruction}</p>
                           <p className="text-xs text-primary mt-1">Duration: {exercise.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Discover New Artists
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Discover new artists similar to your preferences
                </p>

                <Button 
                  onClick={discoverArtists}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Star className="h-4 w-4" />
                  Discover Artists (5 credits)
                </Button>

                {discoveries && (
                  <div className="mt-6 space-y-3">
                    {discoveries.map((artist: any, idx: number) => (
                      <div key={idx} className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{artist.name}</h3>
                            <p className="text-sm text-muted-foreground">{artist.genre}</p>
                            <p className="text-sm mt-2">{artist.description}</p>
                          </div>
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                         <div className="mt-3">
                           <p className="text-xs text-muted-foreground">Top track:</p>
                           <p className="text-sm font-medium">{artist.topSong}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="karaoke" className="space-y-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mic className="h-6 w-6 text-primary" />
                Karaoke Mode with Vocal Coach
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="song">Song name</Label>
                  <Input
                    id="song"
                    placeholder="e.g. Bohemian Rhapsody"
                    value={karaokeSong}
                    onChange={(e) => setKaraokeSong(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={getVocalCoaching}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Get Vocal Coaching (8 credits)
                </Button>

                {vocalCoachTips && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg space-y-4">
                    <h3 className="font-bold text-lg">Vocal Coach Tips</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Vocal Range</p>
                        <p className="text-sm">{vocalCoachTips.vocalRange}</p>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Breathing Techniques</p>
                        <p className="text-sm">{vocalCoachTips.breathingTips}</p>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Challenging Parts</p>
                        <ul className="text-sm mt-2 space-y-1">
                          {vocalCoachTips.challenges?.map((tip: string, idx: number) => (
                            <li key={idx}>• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Recommended Exercises</p>
                        <p className="text-sm">{vocalCoachTips.warmUpExercises}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
          <h3 className="text-xl font-bold mb-4 text-center">Other Services</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-lg text-center cursor-pointer hover:shadow-xl hover:scale-105 hover:border-purple-500 transition-all duration-300" onClick={() => navigate('/ai-music-producer')}>
              <Music className="h-8 w-8 text-purple-500 mx-auto mb-2 transition-transform" />
              <h4 className="font-bold text-purple-600 dark:text-purple-400">✨ AI Music Producer</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Create original songs from text/mood with AI-generated melodies, beats & lyrics
              </p>
              <p className="text-xs text-purple-500 mt-2 font-semibold">Click to start creating →</p>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-bold">Premium Playlists</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Exclusive generated playlists with advanced features
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AIMusic;
