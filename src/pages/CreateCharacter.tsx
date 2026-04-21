import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-blonde-magic.png";
import confetti from "canvas-confetti";
import { TradingCard } from "@/components/character/TradingCard";
import { motion, AnimatePresence } from "framer-motion";

import { WizardHero } from "@/components/character/creator/WizardHero";
import { StepProgressBar } from "@/components/character/creator/StepProgressBar";
import { MagicalOptionCard } from "@/components/character/creator/MagicalOptionCard";
import { CharacterPreview3D } from "@/components/character/creator/CharacterPreview3D";
import { CharacterTemplates } from "@/components/character/creator/CharacterTemplates";
import { PowerCombination } from "@/components/character/creator/PowerCombination";
import { AchievementsTracker } from "@/components/character/creator/AchievementsTracker";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const hairColors = [
  { id: "brown", name: "Brown", emoji: "🟤" },
  { id: "black", name: "Black", emoji: "⚫" },
  { id: "blonde", name: "Blonde", emoji: "🟡" },
  { id: "red", name: "Red", emoji: "🔴" },
  { id: "blue", name: "Blue", emoji: "🔵" },
  { id: "pink", name: "Pink", emoji: "💗" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
];
const superPowers = [
  { id: "flying", name: "Flying", emoji: "🦅" },
  { id: "super-strength", name: "Super Strength", emoji: "💪" },
  { id: "invisibility", name: "Invisibility", emoji: "👻" },
  { id: "talking-to-animals", name: "Talk to Animals", emoji: "🦊" },
  { id: "magic-spells", name: "Magic Spells", emoji: "✨" },
  { id: "super-speed", name: "Super Speed", emoji: "⚡" },
];
const eyeColors = [
  { id: "blue", name: "Blue", emoji: "🔵" },
  { id: "green", name: "Green", emoji: "💚" },
  { id: "brown", name: "Brown", emoji: "🟤" },
  { id: "hazel", name: "Hazel", emoji: "🌰" },
  { id: "purple", name: "Purple", emoji: "💜" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
];
const costumeColors = [
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
  { id: "pink", name: "Pink", emoji: "💗" },
  { id: "blue", name: "Blue", emoji: "💙" },
  { id: "purple", name: "Purple", emoji: "💜" },
  { id: "red", name: "Red", emoji: "❤️" },
  { id: "gold", name: "Gold", emoji: "✨" },
];
const ageGroups = [
  { id: "kid", name: "Kid", emoji: "👧" },
  { id: "teen", name: "Teen", emoji: "🧒" },
  { id: "young-adult", name: "Young Adult", emoji: "🙋" },
];
const personalities = [
  { id: "brave", name: "Brave", emoji: "🦁" },
  { id: "kind", name: "Kind", emoji: "💖" },
  { id: "funny", name: "Funny", emoji: "😄" },
  { id: "smart", name: "Smart", emoji: "🧠" },
  { id: "adventurous", name: "Adventurous", emoji: "🗺️" },
  { id: "creative", name: "Creative", emoji: "🎨" },
];
const skinColors = [
  { id: "light", name: "Light", emoji: "🧑🏻" },
  { id: "medium-light", name: "Medium Light", emoji: "🧑🏼" },
  { id: "medium", name: "Medium", emoji: "🧑🏽" },
  { id: "medium-dark", name: "Medium Dark", emoji: "🧑🏾" },
  { id: "dark", name: "Dark", emoji: "🧑🏿" },
];
const genders = [
  { id: "hero", name: "Hero", emoji: "🦸" },
  { id: "heroine", name: "Heroine", emoji: "🦸‍♀️" },
  { id: "champion", name: "Champion", emoji: "⭐" },
];

const find = (arr: { id: string; name: string; emoji: string }[], id: string) =>
  arr.find((x) => x.id === id) || { id, name: id, emoji: "❓" };

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
  const [selectedSkinColor, setSelectedSkinColor] = useState("medium");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showTradingCard, setShowTradingCard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);

  const selections = {
    hair: find(hairColors, selectedHair),
    power: find(superPowers, selectedPower),
    eyes: find(eyeColors, selectedEyeColor),
    costume: find(costumeColors, selectedCostumeColor),
    personality: find(personalities, selectedPersonality),
    skin: find(skinColors, selectedSkinColor),
    gender: find(genders, selectedGender),
    age: find(ageGroups, selectedAgeGroup),
  };

  const playMagicalSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, audioContext.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + dur);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + dur);
    };
    playNote(523.25, 0, 0.3);
    playNote(659.25, 0.15, 0.35);
    playNote(783.99, 0.3, 0.4);
    playNote(1046.5, 0.45, 0.6);
    playNote(1318.51, 0.6, 0.3);
    playNote(1567.98, 0.75, 0.4);
  };

  const handleApplyTemplate = (presets: Record<string, string>, name: string) => {
    setSelectedHair(presets.hair);
    setSelectedPower(presets.power);
    setSelectedEyeColor(presets.eyes);
    setSelectedCostumeColor(presets.costume);
    setSelectedAgeGroup(presets.age);
    setSelectedPersonality(presets.personality);
    setSelectedGender(presets.gender);
    setSelectedSkinColor(presets.skin);
    setCharacterName(name);
    setCurrentStep(0);
    toast({ title: "Template Applied! ⚡", description: `${name} preset loaded — customize it!` });
  };

  const handleGenerateStory = async () => {
    if (!characterName.trim()) {
      toast({ title: "Name Required", description: "Give your hero a name first!", variant: "destructive" });
      return;
    }
    setIsGeneratingStory(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-character-story", {
        body: {
          characterName,
          hairColor: selections.hair.name,
          superpower: selections.power.name,
          eyeColor: selections.eyes.name,
          costumeColor: selections.costume.name,
          ageGroup: selections.age.name,
          personality: selections.personality.name,
        },
      });
      if (error) throw error;
      if (data?.story) {
        setGeneratedStory(data.story);
        toast({ title: "Story Created! 📖", description: `${characterName}'s adventure is ready!` });
      }
    } catch (error) {
      console.error("Error generating story:", error);
      toast({ title: "Generation Failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleCreateStory = async () => {
    if (!characterName.trim()) {
      toast({ title: "Name Required", description: "Please give your hero a name!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-character-image", {
        body: {
          characterName,
          hairColor: selections.hair.name,
          eyeColor: selections.eyes.name,
          costumeColor: selections.costume.name,
          superpower: selections.power.name,
          ageGroup: selections.age.name,
          personality: selections.personality.name,
          gender: selections.gender.name,
          skinColor: selections.skin.name,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        playMagicalSound();
        setCreatedCount((c) => c + 1);

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("created_characters").insert({
            user_id: user.id,
            name: characterName,
            hair_color: selectedHair,
            superpower: selectedPower,
            eye_color: selectedEyeColor,
            costume_color: selectedCostumeColor,
            age_group: selectedAgeGroup,
            personality: selectedPersonality,
            gender: selectedGender,
            image_url: data.imageUrl,
          });
        }
        toast({ title: "Character Created! 🎉", description: `${characterName} is ready for adventure!` });
      }
    } catch (error) {
      console.error("Error generating character:", error);
      toast({ title: "Generation Failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const stepContent = [
    // Step 0: Identity
    <div key="identity" className="space-y-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/60 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📝</span> Hero Name
        </h3>
        <Input
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="Enter a legendary name..."
          className="text-lg border-2 border-purple-200 focus:border-purple-400"
        />
      </div>
      <MagicalOptionCard label="Gender" labelEmoji="🦸" options={genders} selected={selectedGender} onSelect={setSelectedGender} columns={3} accentColor="indigo" />
      <MagicalOptionCard label="Age Group" labelEmoji="🎂" options={ageGroups} selected={selectedAgeGroup} onSelect={setSelectedAgeGroup} columns={3} accentColor="green" />
    </div>,
    // Step 1: Appearance
    <div key="appearance" className="space-y-4">
      <MagicalOptionCard label="Hair Color" labelEmoji="🎨" options={hairColors} selected={selectedHair} onSelect={setSelectedHair} columns={4} accentColor="pink" />
      <MagicalOptionCard label="Eye Color" labelEmoji="👁️" options={eyeColors} selected={selectedEyeColor} onSelect={setSelectedEyeColor} columns={3} accentColor="blue" />
      <MagicalOptionCard label="Skin Tone" labelEmoji="🎨" options={skinColors} selected={selectedSkinColor} onSelect={setSelectedSkinColor} columns={5} accentColor="amber" />
      <MagicalOptionCard label="Costume" labelEmoji="👗" options={costumeColors} selected={selectedCostumeColor} onSelect={setSelectedCostumeColor} columns={3} accentColor="purple" />
    </div>,
    // Step 2: Powers
    <div key="powers" className="space-y-4">
      <MagicalOptionCard label="Superpower" labelEmoji="⚡" options={superPowers} selected={selectedPower} onSelect={setSelectedPower} columns={2} accentColor="yellow" />
      <PowerCombination selectedPower={selectedPower} personality={selectedPersonality} />
    </div>,
    // Step 3: Personality + Create
    <div key="personality" className="space-y-4">
      <MagicalOptionCard label="Personality" labelEmoji="⭐" options={personalities} selected={selectedPersonality} onSelect={setSelectedPersonality} columns={2} accentColor="orange" />
      <AchievementsTracker characterCount={createdCount} hasStory={!!generatedStory} hasTradingCard={showTradingCard} />
    </div>,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 animate-fade-in">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate("/kids-channel")} className="hover:bg-white/70">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/kids-stories/character-gallery")} className="border-2 border-purple-300 hover:bg-white/70">
            🖼️ My Gallery
          </Button>
        </div>

        {/* Hero */}
        <WizardHero />

        <HeroRewardedAd sectionKey="page_createcharacter" />

        {/* Templates */}
        <CharacterTemplates onApplyTemplate={handleApplyTemplate} />

        {/* Main Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Wizard Form */}
          <div className="lg:col-span-3 space-y-6">
            <StepProgressBar currentStep={currentStep} onStepClick={setCurrentStep} />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {stepContent[currentStep]}
              </motion.div>
            </AnimatePresence>

            {/* Step Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} className="flex-1 py-6 text-lg border-2">
                  ← Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex-1 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  onClick={handleCreateStory}
                  disabled={isGenerating}
                  className="flex-1 py-6 text-lg bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 text-white font-bold shadow-2xl border-2 border-white/50 rounded-2xl"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-6 w-6" />
                      Create My Hero! 🚀
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Post-generation buttons */}
            {generatedImage && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <Button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="w-full py-6 text-lg bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-600 hover:to-orange-600 text-white font-bold shadow-xl rounded-2xl"
                >
                  {isGeneratingStory ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Writing Story...
                    </>
                  ) : (
                    "📖 Generate Backstory"
                  )}
                </Button>
                <Button
                  onClick={() => setShowTradingCard(!showTradingCard)}
                  className="w-full py-6 text-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold shadow-xl rounded-2xl"
                >
                  {showTradingCard ? "Hide Trading Card" : "🎴 Create Trading Card"}
                </Button>
              </motion.div>
            )}

            {/* Story display */}
            {generatedStory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">📖</span>
                  <h4 className="text-xl font-bold text-gray-800">{characterName}'s Story</h4>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedStory}</p>
              </motion.div>
            )}

            {/* Trading Card */}
            {showTradingCard && generatedImage && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TradingCard
                  characterName={characterName}
                  imageUrl={generatedImage}
                  hairColor={selections.hair.name}
                  eyeColor={selections.eyes.name}
                  superpower={selections.power.name}
                  costumeColor={selections.costume.name}
                  ageGroup={selections.age.name}
                  personality={selections.personality.name}
                  gender={selections.gender.name}
                  story={generatedStory || undefined}
                />
              </motion.div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-2">
            <CharacterPreview3D
              characterName={characterName}
              generatedImage={generatedImage}
              placeholderImage={heroImage}
              selections={selections}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
