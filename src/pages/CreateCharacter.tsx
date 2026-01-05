import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-blonde-magic.png";
import confetti from "canvas-confetti";
import { TradingCard } from "@/components/character/TradingCard";

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characterName, setCharacterName] = useState("");
  const [selectedHair, setSelectedHair] = useState("blonde");
  const [selectedPower, setSelectedPower] = useState("magic-spells");
  const [selectedEyeColor, setSelectedEyeColor] = useState("blue");
  const [selectedCostumeColor, setSelectedCostumeColor] = useState("rainbow");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("kid");
  const [selectedPersonality, setSelectedPersonality] = useState("brave");
  const [selectedGender, setSelectedGender] = useState("hero");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showTradingCard, setShowTradingCard] = useState(false);

  const hairColors = [
    { id: "brown", name: "Brown", emoji: "🟤" },
    { id: "black", name: "Black", emoji: "⚫" },
    { id: "blonde", name: "Blonde", emoji: "🟡" },
    { id: "red", name: "Red", emoji: "🔴" },
    { id: "blue", name: "Blue", emoji: "🔵" },
    { id: "pink", name: "Pink", emoji: "💗" },
    { id: "rainbow", name: "Rainbow", emoji: "🌈" }
  ];

  const superPowers = [
    { id: "flying", name: "Flying", emoji: "🦅" },
    { id: "super-strength", name: "Super Strength", emoji: "💪" },
    { id: "invisibility", name: "Invisibility", emoji: "👻" },
    { id: "talking-to-animals", name: "Talk to Animals", emoji: "🦊" },
    { id: "magic-spells", name: "Magic Spells", emoji: "✨" },
    { id: "super-speed", name: "Super Speed", emoji: "⚡" }
  ];

  const eyeColors = [
    { id: "blue", name: "Blue", emoji: "🔵" },
    { id: "green", name: "Green", emoji: "💚" },
    { id: "brown", name: "Brown", emoji: "🟤" },
    { id: "hazel", name: "Hazel", emoji: "🌰" },
    { id: "purple", name: "Purple", emoji: "💜" },
    { id: "rainbow", name: "Rainbow", emoji: "🌈" }
  ];

  const costumeColors = [
    { id: "rainbow", name: "Rainbow", emoji: "🌈" },
    { id: "pink", name: "Pink", emoji: "💗" },
    { id: "blue", name: "Blue", emoji: "💙" },
    { id: "purple", name: "Purple", emoji: "💜" },
    { id: "red", name: "Red", emoji: "❤️" },
    { id: "gold", name: "Gold", emoji: "✨" }
  ];

  const ageGroups = [
    { id: "kid", name: "Kid", emoji: "👧" },
    { id: "teen", name: "Teen", emoji: "🧒" },
    { id: "young-adult", name: "Young Adult", emoji: "🙋" }
  ];

  const personalities = [
    { id: "brave", name: "Brave", emoji: "🦁" },
    { id: "kind", name: "Kind", emoji: "💖" },
    { id: "funny", name: "Funny", emoji: "😄" },
    { id: "smart", name: "Smart", emoji: "🧠" },
    { id: "adventurous", name: "Adventurous", emoji: "🗺️" },
    { id: "creative", name: "Creative", emoji: "🎨" }
  ];

  const genders = [
    { id: "hero", name: "Hero", emoji: "🦸" },
    { id: "heroine", name: "Heroine", emoji: "🦸‍♀️" },
    { id: "champion", name: "Champion", emoji: "⭐" }
  ];

  const playMagicalSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create magical chime sound with multiple notes
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Create fade out effect
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    // Play a magical ascending arpeggio (C-E-G-C)
    playNote(523.25, 0, 0.3);      // C5
    playNote(659.25, 0.15, 0.35);  // E5
    playNote(783.99, 0.3, 0.4);    // G5
    playNote(1046.50, 0.45, 0.6);  // C6
    
    // Add sparkle effect with higher notes
    playNote(1318.51, 0.6, 0.3);   // E6
    playNote(1567.98, 0.75, 0.4);  // G6
  };

  const handleGenerateStory = async () => {
    if (!characterName.trim()) {
      toast({
        title: "Character Required",
        description: "Please create a character first!",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingStory(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-character-story', {
        body: {
          characterName,
          hairColor: hairColors.find(h => h.id === selectedHair)?.name || selectedHair,
          superpower: superPowers.find(p => p.id === selectedPower)?.name || selectedPower,
          eyeColor: eyeColors.find(e => e.id === selectedEyeColor)?.name || selectedEyeColor,
          costumeColor: costumeColors.find(c => c.id === selectedCostumeColor)?.name || selectedCostumeColor,
          ageGroup: ageGroups.find(a => a.id === selectedAgeGroup)?.name || selectedAgeGroup,
          personality: personalities.find(p => p.id === selectedPersonality)?.name || selectedPersonality
        }
      });

      if (error) throw error;

      if (data?.story) {
        setGeneratedStory(data.story);
        toast({
          title: "Story Created! 📖",
          description: `${characterName}'s adventure is ready!`
        });
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleCreateStory = async () => {
    if (!characterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please give your hero a name!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const powerName = superPowers.find(p => p.id === selectedPower)?.name || "superhero";
      const hairName = hairColors.find(h => h.id === selectedHair)?.name || "brown hair";
      
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: {
          characterName,
          characterType: `${powerName} character with ${hairName}`
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        
        // Play magical celebration sound
        playMagicalSound();
        
        // Trigger confetti celebration
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
        
        // Save character to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: saveError } = await supabase
            .from('created_characters')
            .insert({
              user_id: user.id,
              name: characterName,
              hair_color: selectedHair,
              superpower: selectedPower,
              eye_color: selectedEyeColor,
              costume_color: selectedCostumeColor,
              age_group: selectedAgeGroup,
              personality: selectedPersonality,
              gender: selectedGender,
              image_url: data.imageUrl
            });

          if (saveError) {
            console.error('Error saving character:', saveError);
          }
        }
        
        toast({
          title: "Character Created! 🎉",
          description: `${characterName} is ready for adventure!`
        });
      }
    } catch (error) {
      console.error('Error generating character:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate character image",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 animate-fade-in">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel")}
            className="hover:bg-white/70 hover-scale transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/kids-stories/character-gallery")}
            className="hover:bg-white/70 hover-scale transition-all border-2 border-purple-300"
          >
            🖼️ My Gallery
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl mb-8 animate-scale-in overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/30 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-300/30 to-transparent rounded-full -ml-12 -mb-12" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-fade-in">
                Create Your Hero! 🦸‍♀️✨
              </CardTitle>
              <CardDescription className="text-xl text-gray-700 font-medium">
                Design your own character and become the star of your story!
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Character Preview */}
            <Card className="bg-gradient-to-br from-white to-purple-50 border-4 border-purple-300 shadow-2xl hover-scale transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  {generatedImage ? (
                    <div className="rounded-3xl overflow-hidden shadow-2xl mb-6 animate-scale-in border-4 border-yellow-300 relative">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 animate-pulse">
                          <Sparkles className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div className="absolute top-8 right-6 animate-pulse" style={{ animationDelay: "0.3s" }}>
                          <Sparkles className="h-6 w-6 text-pink-400" />
                        </div>
                        <div className="absolute bottom-8 left-8 animate-pulse" style={{ animationDelay: "0.6s" }}>
                          <Sparkles className="h-7 w-7 text-purple-400" />
                        </div>
                        <div className="absolute bottom-4 right-4 animate-pulse" style={{ animationDelay: "0.9s" }}>
                          <Sparkles className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                      <img 
                        src={generatedImage} 
                        alt={characterName || "Generated Hero"} 
                        className="w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="rounded-3xl overflow-hidden shadow-2xl mb-6 animate-scale-in border-4 border-yellow-300">
                      <img 
                        src={heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {generatedStory && (
                    <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-300 shadow-lg animate-fade-in">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-3xl">📖</span>
                          <h4 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {characterName}'s Story
                          </h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {generatedStory}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Trading Card */}
                  {showTradingCard && generatedImage && (
                    <div className="mt-6 animate-fade-in">
                      <TradingCard
                        characterName={characterName}
                        imageUrl={generatedImage}
                        hairColor={hairColors.find(h => h.id === selectedHair)?.name || selectedHair}
                        eyeColor={eyeColors.find(e => e.id === selectedEyeColor)?.name || selectedEyeColor}
                        superpower={superPowers.find(p => p.id === selectedPower)?.name || selectedPower}
                        costumeColor={costumeColors.find(c => c.id === selectedCostumeColor)?.name || selectedCostumeColor}
                        ageGroup={ageGroups.find(a => a.id === selectedAgeGroup)?.name || selectedAgeGroup}
                        personality={personalities.find(p => p.id === selectedPersonality)?.name || selectedPersonality}
                        gender={genders.find(g => g.id === selectedGender)?.name || selectedGender}
                        story={generatedStory || undefined}
                      />
                    </div>
                  )}
                  
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {characterName || "Your Hero"}
                  </h3>
                  
                  <div className="space-y-2 text-base">
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Hair: {hairColors.find(h => h.id === selectedHair)?.emoji} {hairColors.find(h => h.id === selectedHair)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Power: {superPowers.find(p => p.id === selectedPower)?.emoji} {superPowers.find(p => p.id === selectedPower)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Eyes: {eyeColors.find(e => e.id === selectedEyeColor)?.emoji} {eyeColors.find(e => e.id === selectedEyeColor)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Costume: {costumeColors.find(c => c.id === selectedCostumeColor)?.emoji} {costumeColors.find(c => c.id === selectedCostumeColor)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Age: {ageGroups.find(a => a.id === selectedAgeGroup)?.emoji} {ageGroups.find(a => a.id === selectedAgeGroup)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        {personalities.find(p => p.id === selectedPersonality)?.emoji} {personalities.find(p => p.id === selectedPersonality)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Customization */}
            <div className="space-y-6">
              {/* Name Input */}
              <Card className="bg-white/95 border-3 border-blue-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 block">
                    What's your hero's name? 📝
                  </Label>
                  <Input
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter a cool name..."
                    className="text-lg mt-2 border-2 border-blue-200 focus:border-purple-400 transition-colors"
                  />
                </CardContent>
              </Card>

              {/* Hair Color Selection */}
              <Card className="bg-white/95 border-3 border-pink-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 block">
                    Choose Hair Color 🎨
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {hairColors.map((hair) => (
                      <Button
                        key={hair.id}
                        variant={selectedHair === hair.id ? "default" : "outline"}
                        onClick={() => setSelectedHair(hair.id)}
                        className={`h-20 text-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedHair === hair.id ? "bg-gradient-to-br from-purple-500 to-pink-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{hair.emoji}</span>
                        <span className="text-xs font-semibold">{hair.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Superpower Selection */}
              <Card className="bg-white/95 border-3 border-yellow-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 block">
                    Choose Superpower 🦸‍♀️
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {superPowers.map((power) => (
                      <Button
                        key={power.id}
                        variant={selectedPower === power.id ? "default" : "outline"}
                        onClick={() => setSelectedPower(power.id)}
                        className={`h-24 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedPower === power.id ? "bg-gradient-to-br from-blue-500 to-purple-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-yellow-400"
                        }`}
                      >
                        <span className="text-4xl mb-1 animate-pulse">{power.emoji}</span>
                        <span className="text-xs text-center font-semibold">{power.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Eye Color Selection */}
              <Card className="bg-white/95 border-3 border-blue-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 block">
                    Choose Eye Color 👁️
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {eyeColors.map((eye) => (
                      <Button
                        key={eye.id}
                        variant={selectedEyeColor === eye.id ? "default" : "outline"}
                        onClick={() => setSelectedEyeColor(eye.id)}
                        className={`h-20 text-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedEyeColor === eye.id ? "bg-gradient-to-br from-blue-500 to-cyan-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{eye.emoji}</span>
                        <span className="text-xs font-semibold">{eye.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Costume Color Selection */}
              <Card className="bg-white/95 border-3 border-purple-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 block">
                    Choose Costume Color 👗
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {costumeColors.map((costume) => (
                      <Button
                        key={costume.id}
                        variant={selectedCostumeColor === costume.id ? "default" : "outline"}
                        onClick={() => setSelectedCostumeColor(costume.id)}
                        className={`h-20 text-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedCostumeColor === costume.id ? "bg-gradient-to-br from-purple-500 to-pink-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{costume.emoji}</span>
                        <span className="text-xs font-semibold">{costume.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Selection */}
              <Card className="bg-white/95 border-3 border-green-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4 block">
                    Choose Age 🎂
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {ageGroups.map((age) => (
                      <Button
                        key={age.id}
                        variant={selectedAgeGroup === age.id ? "default" : "outline"}
                        onClick={() => setSelectedAgeGroup(age.id)}
                        className={`h-20 text-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedAgeGroup === age.id ? "bg-gradient-to-br from-green-500 to-teal-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-green-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{age.emoji}</span>
                        <span className="text-xs font-semibold">{age.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personality Selection */}
              <Card className="bg-white/95 border-3 border-orange-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4 block">
                    Choose Personality ⭐
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {personalities.map((personality) => (
                      <Button
                        key={personality.id}
                        variant={selectedPersonality === personality.id ? "default" : "outline"}
                        onClick={() => setSelectedPersonality(personality.id)}
                        className={`h-20 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedPersonality === personality.id ? "bg-gradient-to-br from-orange-500 to-red-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-orange-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{personality.emoji}</span>
                        <span className="text-xs text-center font-semibold">{personality.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender Selection */}
              <Card className="bg-white/95 border-3 border-indigo-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 block">
                    Choose Gender 🦸
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {genders.map((gender) => (
                      <Button
                        key={gender.id}
                        variant={selectedGender === gender.id ? "default" : "outline"}
                        onClick={() => setSelectedGender(gender.id)}
                        className={`h-20 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedGender === gender.id ? "bg-gradient-to-br from-indigo-500 to-purple-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{gender.emoji}</span>
                        <span className="text-xs text-center font-semibold">{gender.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Create Story Button */}
              <Button
                onClick={handleCreateStory}
                disabled={isGenerating}
                className="w-full text-2xl py-9 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 text-white font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-4 border-white/50 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-7 w-7 animate-spin" />
                    Creating Your Adventure...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-7 w-7 animate-bounce" />
                    Start My Adventure! 🚀
                  </>
                )}
              </Button>

              {/* Generate Backstory Button */}
              {generatedImage && (
                <Button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="w-full text-xl py-7 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-600 hover:to-orange-600 text-white font-bold shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 border-3 border-white/50 rounded-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isGeneratingStory ? (
                    <>
                      <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                      Writing Story...
                    </>
                  ) : (
                    <>
                      📖 Generate Backstory
                    </>
                  )}
                </Button>
              )}

              {/* Generate Trading Card Button */}
              {generatedImage && (
                <Button
                  onClick={() => setShowTradingCard(!showTradingCard)}
                  className="w-full text-xl py-7 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold shadow-xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 border-3 border-white/50 rounded-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-red-300/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {showTradingCard ? "Hide Trading Card" : "🎴 Create Trading Card"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
