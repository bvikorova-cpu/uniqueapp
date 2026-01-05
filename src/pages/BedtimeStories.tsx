import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Star, Volume2, Clock, Play, Pause, Loader2, Languages } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BedtimeStories() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStory, setCurrentStory] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'en-US', name: 'English 🇬🇧', flag: '🇬🇧' },
    { code: 'sk-SK', name: 'Slovak 🇸🇰', flag: '🇸🇰' },
    { code: 'es-ES', name: 'Spanish 🇪🇸', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French 🇫🇷', flag: '🇫🇷' },
  ];

  const stories = [
    {
      id: 1,
      title: "Sleepy Cloud's Journey",
      emoji: "☁️",
      description: "Float away with a gentle cloud to dreamland",
      duration: "10 min",
      text: "Once upon a time, in a sky full of stars, there lived a small, fluffy cloud named Cotton. Cotton loved floating through the evening sky, watching the world below prepare for sleep. Every night, Cotton would drift over houses, sprinkling gentle dreams like stardust. Tonight, Cotton invites you on a special journey. Close your eyes and imagine you're floating on Cotton's soft, pillowy surface. Feel the gentle breeze as you drift higher and higher, past the twinkling stars. The moon smiles down at you, and the stars wink goodnight. Cotton carries you slowly, peacefully, through the velvet sky. Below, you can see tiny lights from cozy homes where families are tucking in for the night. The world is quiet and peaceful. Cotton whispers softly, 'Rest now, little one. Dream sweet dreams.' And as you float on this gentle cloud, you feel yourself drifting into the most peaceful sleep, safe and warm in the starlit sky."
    },
    {
      id: 2,
      title: "The Quiet Forest",
      emoji: "🌲",
      description: "Walk through a peaceful forest at night",
      duration: "15 min",
      text: "In a magical forest where the trees whisper lullabies, there's a special path that leads to the most peaceful place in the world. Tonight, you're invited to walk this gentle path. As you step into the forest, you notice how soft the moss feels beneath your feet. The tall trees sway gently, their leaves rustling like a soft song. Friendly owls hoot softly from their branches, saying goodnight. Fireflies dance around you, their tiny lights twinkling like floating stars. You walk deeper into the forest, and everything feels calm and safe. A gentle deer crosses your path, nodding hello before disappearing into the moonlit trees. You find a cozy spot beneath an ancient oak tree. The tree's branches form a perfect canopy above you, and through the leaves, you can see the stars twinkling. The forest hums its ancient lullaby, and all the animals settle down for the night. A rabbit snuggles into its burrow, a bird tucks its head under its wing. And you, too, feel sleepy. The forest wraps you in its peaceful embrace, and you drift off to sleep, surrounded by nature's gentle song."
    },
    {
      id: 3,
      title: "Starlight Adventures",
      emoji: "⭐",
      description: "Watch the stars twinkle and tell their stories",
      duration: "12 min",
      text: "High above the world, where the sky meets space, the stars gather every night to share their stories. Tonight, they want to tell you their favorite tale. Look up at the night sky and find the brightest star you can see. That's Stella, the storyteller star. Stella begins to speak in a voice like tinkling bells. 'Long ago,' she says, 'before any of us remember, the sky was empty and dark. Then, one by one, we stars were born, each with a special light to share.' As Stella talks, the other stars begin to glow brighter, adding their own sparkles to her story. The constellation of the Big Dipper dips down low, as if taking a bow. The Little Dipper twinkles with joy. 'Every night,' Stella continues, 'we watch over all the children of the world, keeping them safe while they sleep. We shine our light to guide sweet dreams to every bedroom.' As you listen to Stella's gentle voice, you feel your eyelids growing heavy. The stars seem to be singing now, a soft, wordless lullaby that fills the sky. One by one, they dim their lights just a little, creating the perfect darkness for sleep. And as you close your eyes, you know the stars will keep watch over you all night long."
    },
    {
      id: 4,
      title: "Ocean Dreams",
      emoji: "🌊",
      description: "Drift with gentle waves to sleep",
      duration: "20 min",
      text: "At the edge of a peaceful beach, where the sand is warm and soft, the ocean waves whisper their evening song. Tonight, the ocean invites you to float on its gentle waters. Imagine yourself lying on a magical raft that rocks softly with each wave. The water is warm and calm, like a cozy bath. As you float, you look up at the sky painted in shades of purple and pink. The sun has just set, leaving behind a canvas of beautiful colors. The waves lap gently against your raft, a soothing rhythm that sounds like a heartbeat. Below the surface, friendly fish swim in peaceful circles, their scales catching the last rays of sunlight. A dolphin jumps nearby, creating a perfect arc in the air before diving back down with barely a splash. The ocean rocks you gently, back and forth, back and forth. You hear the cry of seagulls settling down for the night. The lighthouse on the shore begins its nightly watch, its beam sweeping across the water. As the sky darkens and the stars appear, the ocean's lullaby grows softer. The waves seem to whisper, 'Sleep now, little one. The ocean will keep you safe.' And surrounded by the ocean's gentle embrace, you drift into the most peaceful sleep."
    },
    {
      id: 5,
      title: "Moonlight Garden",
      emoji: "🌸",
      description: "Visit a magical garden under the moonlight",
      duration: "15 min",
      text: "In a hidden corner of the world, there exists a garden that only appears at night. This is the Moonlight Garden, where flowers bloom in silver and white, and everything glows with a gentle light. Tonight, the garden's gate swings open just for you. As you step inside, you're surrounded by the sweet scent of night-blooming jasmine. The path beneath your feet is lined with smooth, glowing stones that light your way. On either side, white roses open their petals to catch the moonlight. In the center of the garden is a fountain where crystal-clear water dances and sparkles. Around it, soft grass invites you to sit and rest. As you settle down, butterflies with wings that shimmer like moonbeams flutter past. You hear the soft chirping of crickets, creating a peaceful symphony. The flowers seem to lean toward you, as if saying goodnight. A gentle breeze carries the scent of lavender and chamomile, herbs that invite peaceful sleep. The moon above shines its softest light, just bright enough to see the beauty around you, but dim enough to help you feel sleepy. As you lie back on the soft grass, looking up at the star-filled sky through the garden's archway, the flowers begin to hum their nightly lullaby. And in this magical garden, surrounded by moonlight and the whisper of petals, you drift off to the sweetest dreams."
    },
    {
      id: 6,
      title: "Cozy Bear's Lullaby",
      emoji: "🐻",
      description: "Snuggle up with a sleepy bear friend",
      duration: "10 min",
      text: "In a warm, cozy cave at the edge of a quiet forest, there lives a gentle bear named Honey. Honey is the sleepiest, coziest bear you'll ever meet, and tonight, Honey wants to share the secret to the perfect sleep. As evening falls, Honey prepares for bed in the most wonderful way. First, Honey fluffs up a pile of the softest leaves and moss, creating the perfect bed. Then, Honey fetches a warm blanket made from dandelion fluff, lighter than air and warmer than the sun. As Honey settles into bed, you're invited to curl up next to this gentle friend. Honey's fur is soft and warm, and you can feel Honey's slow, peaceful breathing. 'The secret to good sleep,' Honey whispers in a sleepy voice, 'is to think of all the things that make you happy.' And so Honey begins to think out loud about favorite things: the taste of sweet honey, the feeling of warm sunshine, the sound of birds singing, the smell of flowers in spring. As Honey lists each gentle thought, you feel more and more relaxed. Honey yawns, a big, sleepy bear yawn, and you find yourself yawning too. 'Time for sleep now,' Honey mumbles, already drifting off. And snuggled next to your bear friend, listening to Honey's gentle snores, you feel safe, warm, and ready for the most peaceful sleep. Sweet dreams, little one."
    }
  ];

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const startSleepTimer = () => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const fadeStartTime = (selectedDuration * 60 * 1000) - 30000; // Start fade 30 seconds before end
    
    sleepTimerRef.current = setTimeout(() => {
      let currentVolume = volume / 100;
      fadeIntervalRef.current = setInterval(() => {
        currentVolume -= 0.05;
        if (currentVolume <= 0) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          toast({
            title: "Sweet dreams! 🌙",
            description: "The story has gently ended. Sleep well!",
          });
        } else if (audioRef.current) {
          audioRef.current.volume = currentVolume;
        }
      }, 1000);
    }, fadeStartTime);
  };

  const handlePlayStory = async (storyId: number) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) {
      console.error('Story not found:', storyId);
      return;
    }

    console.log('Starting story generation for:', story.title);
    setIsGenerating(true);
    setCurrentStory(storyId);

    try {
      console.log('Invoking edge function with language:', language);
      const { data, error } = await supabase.functions.invoke('translate-and-generate-audio', {
        body: { text: story.text, language }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Edge function response received:', { 
        hasAudioContent: !!data?.audioContent,
        audioContentLength: data?.audioContent?.length 
      });

      if (!data || !data.audioContent) {
        throw new Error('No audio content received from server');
      }

      console.log('Decoding base64 audio...');
      try {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        console.log('Audio blob created, size:', audioBlob.size);
        
        const url = URL.createObjectURL(audioBlob);
        console.log('Audio URL created:', url);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        
        audioRef.current = new Audio(url);
        audioRef.current.volume = volume / 100;
        
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e);
          toast({
            title: "Playback Error",
            description: "Failed to play audio. Please try again.",
            variant: "destructive",
          });
          setIsPlaying(false);
        };
        
        audioRef.current.onended = () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
        };
        
        audioRef.current.onloadeddata = () => {
          console.log('Audio loaded, duration:', audioRef.current?.duration);
        };
        
        console.log('Starting audio playback...');
        try {
          await audioRef.current.play();
          console.log('Audio playback started successfully');
          setIsPlaying(true);
          startSleepTimer();
          
          toast({
            title: "Story started 🌙",
            description: `Now playing: ${story.title}`,
          });
        } catch (playError: any) {
          console.error('Audio play error:', playError);
          
          // Handle autoplay restrictions
          if (playError.name === 'NotAllowedError') {
            toast({
              title: "Click to play",
              description: "Please click the play button to start the story",
            });
          } else {
            throw playError;
          }
        }
      } catch (decodeError) {
        console.error('Base64 decode error:', decodeError);
        throw new Error('Failed to decode audio data');
      }
    } catch (error: any) {
      console.error('Error in handlePlayStory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate story audio. Please try again.",
        variant: "destructive",
      });
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentStory(null);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  };

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

          {/* Language Selection */}
          <Card className="bg-white/10 backdrop-blur-md border-2 border-purple-400/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Story Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[200px] bg-white/20 text-white border-purple-400/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
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

              {currentStory && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={stopStory}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Stop Story
                  </Button>
                </div>
              )}
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
                    onClick={() => handlePlayStory(story.id)}
                    disabled={isGenerating || currentStory === story.id}
                  >
                    {isGenerating && currentStory === story.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : currentStory === story.id ? (
                      <>
                        {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isPlaying ? 'Playing...' : 'Paused'}
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Listen Now
                      </>
                    )}
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
