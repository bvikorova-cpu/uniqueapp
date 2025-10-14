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
    { value: "happy", label: "Šťastný", icon: "😊" },
    { value: "sad", label: "Smutný", icon: "😢" },
    { value: "energetic", label: "Energický", icon: "⚡" },
    { value: "relaxed", label: "Relaxovaný", icon: "😌" },
    { value: "focused", label: "Sústredený", icon: "🎯" },
    { value: "romantic", label: "Romantický", icon: "💕" },
  ];

  const activities = [
    { value: "workout", label: "Cvičenie", icon: "💪" },
    { value: "study", label: "Štúdium", icon: "📚" },
    { value: "party", label: "Párty", icon: "🎉" },
    { value: "sleep", label: "Spánok", icon: "😴" },
    { value: "work", label: "Práca", icon: "💼" },
    { value: "meditation", label: "Meditácia", icon: "🧘" },
  ];

  const checkCredits = (required: number) => {
    if (credits.credits_remaining < required) {
      toast.error(`Potrebujete ${required} kreditov. Presmerovanie...`);
      setTimeout(() => navigate('/ai-credits'), 1500);
      return false;
    }
    return true;
  };

  const generatePlaylist = async () => {
    if (!mood && !activity) {
      toast.error("Vyberte náladu alebo aktivitu");
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
      toast.success("Playlist vytvorený!");
    } catch (error: any) {
      toast.error(error.message || "Chyba pri generovaní playlistu");
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
      toast.success("Terapeutická session vytvorená!");
    } catch (error: any) {
      toast.error(error.message || "Chyba pri generovaní session");
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
      toast.success("Noví umelci objavení!");
    } catch (error: any) {
      toast.error(error.message || "Chyba pri hľadaní umelcov");
    } finally {
      setLoading(false);
    }
  };

  const getVocalCoaching = async () => {
    if (!karaokeSong) {
      toast.error("Zadajte názov skladby");
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
      toast.success("AI Vocal Coach pripravený!");
    } catch (error: any) {
      toast.error(error.message || "Chyba pri generovaní tipov");
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
              AI Music & Playlist Curator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vaša osobná AI hudobná asistenka pre dokonalú hudobnú skúsenosť
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Kredit: {credits.credits_remaining}</span>
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
                Vytvor Playlist podľa Nálady
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Vyber svoju náladu</Label>
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
                  <Label>Alebo aktivitu</Label>
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
                  Generuj Playlist (5 kreditov)
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
                  AI vytvorí personalizovanú hudobnú terapiu pre váš aktuálny emocionálny stav
                </p>

                <Button 
                  onClick={generateTherapySession}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Začni Therapy Session (10 kreditov)
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
                          <p className="text-xs text-primary mt-1">Trvanie: {exercise.duration}</p>
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
                Discover Nových Umelcov
              </h2>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  AI nájde nových umelcov podobných vašim preferenciám
                </p>

                <Button 
                  onClick={discoverArtists}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Star className="h-4 w-4" />
                  Objav Umelcov (5 kreditov)
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
                          <p className="text-xs text-muted-foreground">Top skladba:</p>
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
                Karaoke Mode s AI Vocal Coach
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="song">Názov skladby</Label>
                  <Input
                    id="song"
                    placeholder="Napr. Bohemian Rhapsody"
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
                  Získaj Vocal Coaching (8 kreditov)
                </Button>

                {vocalCoachTips && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg space-y-4">
                    <h3 className="font-bold text-lg">AI Vocal Coach Tips</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Rozsah skladby</p>
                        <p className="text-sm">{vocalCoachTips.vocalRange}</p>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Dychové techniky</p>
                        <p className="text-sm">{vocalCoachTips.breathingTips}</p>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Ťažké časti</p>
                        <ul className="text-sm mt-2 space-y-1">
                          {vocalCoachTips.challenges?.map((tip: string, idx: number) => (
                            <li key={idx}>• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-background rounded">
                        <p className="font-medium text-sm text-primary">Odporúčané cvičenia</p>
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
          <h3 className="text-xl font-bold mb-4 text-center">Premium Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-bold">Premium Playlists</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Exkluzívne AI generované playlists s rozšírenými funkciami
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <Music className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold">AI Music Generation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Vytvorte si vlastnú originálnu hudbu pomocou AI
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-bold">Unlimited Sessions</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Neobmedzený prístup k therapy sessions a vocal coaching
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
