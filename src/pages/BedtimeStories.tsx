import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Moon, Volume2, Clock, Play, Pause, Loader2, Languages, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

// New components
import { NightSkyBackground } from "@/components/kids/bedtime/NightSkyBackground";
import { EnchantedStoryCard } from "@/components/kids/bedtime/EnchantedStoryCard";
import { AmbientSoundMixer } from "@/components/kids/bedtime/AmbientSoundMixer";
import { BedtimeStreak } from "@/components/kids/bedtime/BedtimeStreak";
import { StoryConstellationMap } from "@/components/kids/bedtime/StoryConstellationMap";
import { CustomStoryGenerator } from "@/components/kids/bedtime/CustomStoryGenerator";

export default function BedtimeStories() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStory, setCurrentStory] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [visitedStories, setVisitedStories] = useState<Set<number>>(new Set());
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const [streak, setStreak] = useState(0);
  const [dreamTokens, setDreamTokens] = useState(0);

  // Load progress from DB
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("kids_bedtime_progress")
        .select("story_id, rating, listened_at")
        .eq("user_id", session.user.id);
      if (!data) return;

      setVisitedStories(new Set(data.map((r: any) => parseInt(r.story_id, 10))));
      const r: Record<number, number> = {};
      let tokens = 0;
      data.forEach((row: any) => {
        if (row.rating) {
          r[parseInt(row.story_id, 10)] = row.rating;
          tokens += row.rating;
        }
      });
      setRatings(r);
      setDreamTokens(tokens + data.length); // 1 token per listen + bonus per star

      // Compute consecutive-day streak ending today
      const dayKeys = new Set(
        data.map((row: any) => (row.listened_at || "").slice(0, 10)).filter(Boolean)
      );
      let s = 0;
      const cursor = new Date();
      // allow start from yesterday if not listened today
      if (!dayKeys.has(cursor.toISOString().slice(0, 10))) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
        s++;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreak(s);
    })();
  }, []);

  const languages = [
    { code: 'en-US', name: 'English 🇬🇧' },
    { code: 'sk-SK', name: 'Slovak 🇸🇰' },
    { code: 'es-ES', name: 'Spanish 🇪🇸' },
    { code: 'fr-FR', name: 'French 🇫🇷' },
  ];

  const stories = [
    { id: 1, title: "Sleepy Cloud's Journey", emoji: "☁️", description: "Float away with a gentle cloud to dreamland", duration: "10 min", text: "Once upon a time, in a sky full of stars, there lived a small, fluffy cloud named Cotton. Cotton loved floating through the evening sky, watching the world below prepare for sleep. Every night, Cotton would drift over houses, sprinkling gentle dreams like stardust. Tonight, Cotton invites you on a special journey. Close your eyes and imagine you're floating on Cotton's soft, pillowy surface. Feel the gentle breeze as you drift higher and higher, past the twinkling stars. The moon smiles down at you, and the stars wink goodnight. Cotton carries you slowly, peacefully, through the velvet sky. Below, you can see tiny lights from cozy homes where families are tucking in for the night. The world is quiet and peaceful. Cotton whispers softly, 'Rest now, little one. Dream sweet dreams.' And as you float on this gentle cloud, you feel yourself drifting into the most peaceful sleep, safe and warm in the starlit sky." },
    { id: 2, title: "The Quiet Forest", emoji: "🌲", description: "Walk through a peaceful forest at night", duration: "15 min", text: "In a magical forest where the trees whisper lullabies, there's a special path that leads to the most peaceful place in the world. Tonight, you're invited to walk this gentle path. As you step into the forest, you notice how soft the moss feels beneath your feet. The tall trees sway gently, their leaves rustling like a soft song. Friendly owls hoot softly from their branches, saying goodnight. Fireflies dance around you, their tiny lights twinkling like floating stars. You walk deeper into the forest, and everything feels calm and safe. A gentle deer crosses your path, nodding hello before disappearing into the moonlit trees. You find a cozy spot beneath an ancient oak tree. The tree's branches form a perfect canopy above you, and through the leaves, you can see the stars twinkling. The forest hums its ancient lullaby, and all the animals settle down for the night. A rabbit snuggles into its burrow, a bird tucks its head under its wing. And you, too, feel sleepy. The forest wraps you in its peaceful embrace, and you drift off to sleep, surrounded by nature's gentle song." },
    { id: 3, title: "Starlight Adventures", emoji: "⭐", description: "Watch the stars twinkle and tell their stories", duration: "12 min", text: "High above the world, where the sky meets space, the stars gather every night to share their stories. Tonight, they want to tell you their favorite tale. Look up at the night sky and find the brightest star you can see. That's Stella, the storyteller star. Stella begins to speak in a voice like tinkling bells. 'Long ago,' she says, 'before any of us remember, the sky was empty and dark. Then, one by one, we stars were born, each with a special light to share.' As Stella talks, the other stars begin to glow brighter, adding their own sparkles to her story. The constellation of the Big Dipper dips down low, as if taking a bow. 'Every night,' Stella continues, 'we watch over all the children of the world, keeping them safe while they sleep. We shine our light to guide sweet dreams to every bedroom.' As you listen to Stella's gentle voice, you feel your eyelids growing heavy. The stars seem to be singing now, a soft, wordless lullaby that fills the sky. And as you close your eyes, you know the stars will keep watch over you all night long." },
    { id: 4, title: "Ocean Dreams", emoji: "🌊", description: "Drift with gentle waves to sleep", duration: "20 min", text: "At the edge of a peaceful beach, where the sand is warm and soft, the ocean waves whisper their evening song. Tonight, the ocean invites you to float on its gentle waters. Imagine yourself lying on a magical raft that rocks softly with each wave. The water is warm and calm, like a cozy bath. As you float, you look up at the sky painted in shades of purple and pink. The waves lap gently against your raft, a soothing rhythm that sounds like a heartbeat. Below the surface, friendly fish swim in peaceful circles. A dolphin jumps nearby, creating a perfect arc before diving back down. The ocean rocks you gently, back and forth. As the sky darkens and the stars appear, the ocean's lullaby grows softer. The waves whisper, 'Sleep now, little one.' And surrounded by the ocean's gentle embrace, you drift into the most peaceful sleep." },
    { id: 5, title: "Moonlight Garden", emoji: "🌸", description: "Visit a magical garden under the moonlight", duration: "15 min", text: "In a hidden corner of the world, there exists a garden that only appears at night. This is the Moonlight Garden, where flowers bloom in silver and white, and everything glows with a gentle light. Tonight, the garden's gate swings open just for you. As you step inside, you're surrounded by the sweet scent of night-blooming jasmine. The path beneath your feet is lined with smooth, glowing stones. White roses open their petals to catch the moonlight. In the center is a fountain where crystal-clear water dances and sparkles. Butterflies with wings that shimmer like moonbeams flutter past. A gentle breeze carries the scent of lavender and chamomile. The moon shines its softest light. As you lie back on the soft grass, the flowers begin to hum their nightly lullaby. And in this magical garden, surrounded by moonlight and the whisper of petals, you drift off to the sweetest dreams." },
    { id: 6, title: "Cozy Bear's Lullaby", emoji: "🐻", description: "Snuggle up with a sleepy bear friend", duration: "10 min", text: "In a warm, cozy cave at the edge of a quiet forest, there lives a gentle bear named Honey. Tonight, Honey wants to share the secret to the perfect sleep. As evening falls, Honey fluffs up a pile of the softest leaves and moss, creating the perfect bed. Then fetches a warm blanket made from dandelion fluff. You're invited to curl up next to this gentle friend. 'The secret to good sleep,' Honey whispers, 'is to think of all the things that make you happy.' And so Honey begins: the taste of sweet honey, the feeling of warm sunshine, the sound of birds singing. As Honey lists each gentle thought, you feel more and more relaxed. 'Time for sleep now,' Honey mumbles, already drifting off. And snuggled next to your bear friend, you feel safe, warm, and ready for the most peaceful sleep. Sweet dreams, little one." },
  ];

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const startSleepTimer = () => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    const fadeStartTime = (selectedDuration * 60 * 1000) - 30000;
    sleepTimerRef.current = setTimeout(() => {
      let currentVolume = volume / 100;
      fadeIntervalRef.current = setInterval(() => {
        currentVolume -= 0.05;
        if (currentVolume <= 0) {
          if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
          setIsPlaying(false);
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          toast({ title: "Sweet dreams! 🌙", description: "The story has gently ended. Sleep well!" });
        } else if (audioRef.current) {
          audioRef.current.volume = currentVolume;
        }
      }, 1000);
    }, fadeStartTime);
  };

  const handlePlayStory = async (storyId: number) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    setIsGenerating(true);
    setCurrentStory(storyId);
    setVisitedStories(prev => new Set(prev).add(storyId));

    // Persist visited
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("kids_bedtime_progress").upsert(
          { user_id: session.user.id, story_id: String(storyId), listened_at: new Date().toISOString() },
          { onConflict: "user_id,story_id" }
        );
      }
    } catch (e) { console.warn("progress save failed", e); }

    try {
      const { data, error } = await supabase.functions.invoke('kids-story-tts', {
        body: { text: story.text, voice: 'nova' }
      });
      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume / 100;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        toast({ title: "Playback Error", description: "Failed to play audio.", variant: "destructive" });
        setIsPlaying(false);
      };

      await audioRef.current.play();
      setIsPlaying(true);
      startSleepTimer();
      toast({ title: "Story started 🌙", description: `Now playing: ${story.title}` });
    } catch (error: any) {
      console.error('Error:', error);
      toast({ title: "Error", description: error.message || "Failed to generate story audio.", variant: "destructive" });
      setCurrentStory(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    } else {
      audioRef.current.play();
      startSleepTimer();
    }
    setIsPlaying(!isPlaying);
  };

  const stopStory = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    setCurrentStory(null);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-blue-950 relative overflow-hidden">
      <Navbar />
      <NightSkyBackground />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Button variant="ghost" onClick={() => navigate("/kids-channel")} className="mb-6 hover:bg-white/10 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kids Channel
        </Button>

        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🌙
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
              Bedtime Stories
            </h1>
            <p className="text-lg text-purple-200/80">Calming stories to help you drift off to dreamland</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Audio Controls */}
              <Card className="bg-white/5 backdrop-blur-md border-purple-400/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Language */}
                    <div>
                      <label className="text-purple-200 text-sm font-semibold flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4" /> Language
                      </label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-white/10 text-white border-purple-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Volume */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-purple-200 text-sm font-semibold flex items-center gap-2">
                          <Volume2 className="w-4 h-4" /> Volume
                        </label>
                        <span className="text-purple-300 text-xs">{volume}%</span>
                      </div>
                      <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} />
                    </div>

                    {/* Timer */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-purple-200 text-sm font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Sleep Timer
                        </label>
                        <span className="text-purple-300 text-xs">{selectedDuration} min</span>
                      </div>
                      <Slider value={[selectedDuration]} onValueChange={(v) => setSelectedDuration(v[0])} min={5} max={30} step={5} />
                    </div>
                  </div>

                  {/* Now Playing */}
                  {currentStory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          className="text-2xl"
                          animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {stories.find(s => s.id === currentStory)?.emoji}
                        </motion.span>
                        <div>
                          <p className="text-white text-sm font-bold">{stories.find(s => s.id === currentStory)?.title}</p>
                          <p className="text-purple-300 text-xs">
                            {isPlaying ? "♪ Playing..." : "Paused"} • Fades in {selectedDuration} min
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={togglePlayPause} className="bg-purple-500/30 hover:bg-purple-500/50 text-white border-0">
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" onClick={stopStory} className="bg-red-500/30 hover:bg-red-500/50 text-white border-0">
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stories.map((story, index) => (
                  <EnchantedStoryCard
                    key={story.id}
                    story={story}
                    index={index}
                    isPlaying={isPlaying}
                    isGenerating={isGenerating}
                    isCurrentStory={currentStory === story.id}
                    rating={ratings[story.id] || 0}
                    onPlay={() => handlePlayStory(story.id)}
                    onRate={async (r) => {
                      setRatings(prev => ({ ...prev, [story.id]: r }));
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) {
                        await supabase.from("kids_bedtime_progress").upsert(
                          { user_id: session.user.id, story_id: String(story.id), rating: r, listened_at: new Date().toISOString() },
                          { onConflict: "user_id,story_id" }
                        );
                      }
                    }}
                  />
                ))}
              </div>

              {/* Sweet Dreams footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-6"
              >
                <p className="text-purple-300/60 text-sm">
                  🌙 Dark mode • 🔇 Gentle fade-out • ✨ Relaxing stories • 💤 Sweet dreams
                </p>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-4 bg-white/5 backdrop-blur-md border-purple-400/20 shadow-xl">
                <BedtimeStreak currentStreak={streak} dreamTokens={dreamTokens} storiesListened={visitedStories.size} />
              </Card>

              <Card className="p-4 bg-white/5 backdrop-blur-md border-purple-400/20 shadow-xl">
                <StoryConstellationMap
                  stories={stories}
                  visitedStories={visitedStories}
                />
              </Card>

              <Card className="p-4 bg-white/5 backdrop-blur-md border-purple-400/20 shadow-xl">
                <AmbientSoundMixer />
              </Card>

              <Card className="p-4 bg-white/5 backdrop-blur-md border-purple-400/20 shadow-xl">
                <CustomStoryGenerator
                  onGenerate={async (story) => {
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }
                      const { data, error } = await supabase.functions.invoke("kids-story-generate", {
                        body: { prompt: story.text, title: story.title },
                      });
                      if (error) throw error;
                      toast({ title: "✨ Story Created!", description: data?.title || story.title });
                    } catch {
                      toast({ title: "Story generation failed", description: "Please try again later.", variant: "destructive" });
                    }
                  }}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
