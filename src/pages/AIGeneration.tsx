import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Image as ImageIcon, Video, Music, Upload, Loader2, Download, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import swayDanceImg from "@/assets/effects/sway-dance.jpg";
import waveDanceImg from "@/assets/effects/wave-dance.jpg";
import ghibliImg from "@/assets/effects/ghibli.jpg";
import minecraftImg from "@/assets/effects/minecraft.jpg";
import earthZoomOutImg from "@/assets/effects/earth-zoom-out.jpg";
import earthZoomInImg from "@/assets/effects/earth-zoom-in.jpg";
import boxMeImg from "@/assets/effects/box-me.jpg";
import paperFallImg from "@/assets/effects/paper-fall.jpg";
import styleMeImg from "@/assets/effects/style-me.jpg";
import napMeImg from "@/assets/effects/nap-me.jpg";
import spin360Img from "@/assets/effects/spin-360.jpg";
import aiCoupleHuggingImg from "@/assets/effects/ai-couple-hugging.jpg";
import myGirlfriendsssssImg from "@/assets/effects/my-girlfriendssss.jpg";
import myBoyfriendssssImg from "@/assets/effects/my-boyfriendssss.jpg";
import sexyMeImg from "@/assets/effects/sexy-me.jpg";
import genderSwapImg from "@/assets/effects/gender-swap.jpg";
import smileImg from "@/assets/effects/smile.jpg";
import bodyshakeImg from "@/assets/effects/bodyshake.jpg";
import meltImg from "@/assets/effects/melt.jpg";
import bloomMagicImg from "@/assets/effects/bloom-magic.jpg";
import papermanImg from "@/assets/effects/paperman.jpg";
import flyingImg from "@/assets/effects/flying.jpg";
import balloonFlyawayImg from "@/assets/effects/balloon-flyaway.jpg";
import expansionImg from "@/assets/effects/expansion.jpg";
import petLoversImg from "@/assets/effects/pet-lovers.jpg";
import flameCarpetImg from "@/assets/effects/flame-carpet.jpg";
import fashionStrideImg from "@/assets/effects/fashion-stride.jpg";
import sendRosesImg from "@/assets/effects/send-roses.jpg";
import fingerHeartImg from "@/assets/effects/finger-heart.jpg";
import cartoonDollImg from "@/assets/effects/cartoon-doll.jpg";
import beastCompanionImg from "@/assets/effects/beast-companion.jpg";
import bloomDoorobearImg from "@/assets/effects/bloom-doorobear.jpg";
import frenchKissImg from "@/assets/effects/french-kiss.jpg";
import whosArrestedImg from "@/assets/effects/whos-arrested.jpg";
import warmthOfJesusImg from "@/assets/effects/warmth-of-jesus.jpg";
import wildLaughImg from "@/assets/effects/wild-laugh.jpg";
import surprisedImg from "@/assets/effects/surprised.jpg";
import explosionImg from "@/assets/effects/explosion.jpg";
import facePunchImg from "@/assets/effects/face-punch.jpg";
import aiKissImg from "@/assets/effects/ai-kiss.jpg";
import kungfuClubImg from "@/assets/effects/kungfu-club.jpg";
import holyWingsImg from "@/assets/effects/holy-wings.jpg";
import sheepCurlsImg from "@/assets/effects/sheep-curls.jpg";
import aiMuscleGeneratorImg from "@/assets/effects/ai-muscle-generator.jpg";
import squishItImg from "@/assets/effects/squish-it.jpg";
import hairGrowthMagicImg from "@/assets/effects/hair-growth-magic.jpg";
import becomeMaleImg from "@/assets/effects/become-male.jpg";
import aliveArtImg from "@/assets/effects/alive-art.jpg";
import becomeFemaleImg from "@/assets/effects/become-female.jpg";
import anythingRobotImg from "@/assets/effects/anything-robot.jpg";
import magicSparkleImg from "@/assets/effects/magic-sparkle.jpg";
import cyborgTransformImg from "@/assets/effects/cyborg-transform.jpg";
import snowGlobeImg from "@/assets/effects/snow-globe.jpg";
import butterflyWingsImg from "@/assets/effects/butterfly-wings.jpg";
import vampireModeImg from "@/assets/effects/vampire-mode.jpg";
import plushiePartyImg from "@/assets/effects/plushie-party.jpg";
import rainbowAuraImg from "@/assets/effects/rainbow-aura.jpg";
import zombieWalkImg from "@/assets/effects/zombie-walk.jpg";
import superheroLandingImg from "@/assets/effects/superhero-landing.jpg";
import crystalFreezeImg from "@/assets/effects/crystal-freeze.jpg";
import discoBallImg from "@/assets/effects/disco-ball.jpg";
import dragonRiderImg from "@/assets/effects/dragon-rider.jpg";
import mermaidTailImg from "@/assets/effects/mermaid-tail.jpg";
import ninjaStealthImg from "@/assets/effects/ninja-stealth.jpg";
import fairyGodmotherImg from "@/assets/effects/fairy-godmother.jpg";
import pirateAdventureImg from "@/assets/effects/pirate-adventure.jpg";
import bubbleBounceImg from "@/assets/effects/bubble-bounce.jpg";
import neonGlowImg from "@/assets/effects/neon-glow.jpg";
import samuraiWarriorImg from "@/assets/effects/samurai-warrior.jpg";
import candyLandImg from "@/assets/effects/candy-land.jpg";
import timeFreezeImg from "@/assets/effects/time-freeze.jpg";
import firePhoenixImg from "@/assets/effects/fire-phoenix.jpg";
import iceQueenImg from "@/assets/effects/ice-queen.jpg";
import breakdanceImg from "@/assets/effects/breakdance.jpg";
import galaxyPortalImg from "@/assets/effects/galaxy-portal.jpg";
import steampunkImg from "@/assets/effects/steampunk.jpg";
import babyFilterImg from "@/assets/effects/baby-filter.jpg";
import oldAgeImg from "@/assets/effects/old-age.jpg";
import elfEarsImg from "@/assets/effects/elf-ears.jpg";
import werewolfImg from "@/assets/effects/werewolf.jpg";
import astronautSpaceImg from "@/assets/effects/astronaut-space.jpg";
import pixelArtImg from "@/assets/effects/pixel-art.jpg";
import oilPaintingImg from "@/assets/effects/oil-painting.jpg";
import comicBookImg from "@/assets/effects/comic-book.jpg";
import hologramImg from "@/assets/effects/hologram.jpg";
import ghostSpiritImg from "@/assets/effects/ghost-spirit.jpg";
import clownMakeupImg from "@/assets/effects/clown-makeup.jpg";
import tribalPaintImg from "@/assets/effects/tribal-paint.jpg";
import bunnyEarsImg from "@/assets/effects/bunny-ears.jpg";
import catWhiskersImg from "@/assets/effects/cat-whiskers.jpg";
import dogFilterImg from "@/assets/effects/dog-filter.jpg";
import unicornHornImg from "@/assets/effects/unicorn-horn.jpg";
import devilHornsImg from "@/assets/effects/devil-horns.jpg";
import haloAngelImg from "@/assets/effects/halo-angel.jpg";
import matrixCodeImg from "@/assets/effects/matrix-code.jpg";
import sunflowerCrownImg from "@/assets/effects/sunflower-crown.jpg";
import rosePetalsImg from "@/assets/effects/rose-petals.jpg";
import confettiBlastImg from "@/assets/effects/confetti-blast.jpg";
import laserEyesImg from "@/assets/effects/laser-eyes.jpg";
import fireBreathImg from "@/assets/effects/fire-breath.jpg";
import waterSplashImg from "@/assets/effects/water-splash.jpg";
import thunderStormImg from "@/assets/effects/thunder-storm.jpg";
import cherryBlossomImg from "@/assets/effects/cherry-blossom.jpg";
import autumnLeavesImg from "@/assets/effects/autumn-leaves.jpg";
import tropicalParadiseImg from "@/assets/effects/tropical-paradise.jpg";
import northernLightsImg from "@/assets/effects/northern-lights.jpg";
import shootingStarImg from "@/assets/effects/shooting-star.jpg";
import crownJewelsImg from "@/assets/effects/crown-jewels.jpg";

type EffectCategory = "all" | "interactions" | "pets" | "appearance" | "entertainment" | "heroes" | "fanciful" | "dance" | "emotions";

interface AIEffect {
  id: string;
  name: string;
  category: EffectCategory;
  image: string;
  description: string;
  isHot?: boolean;
}

const aiEffects: AIEffect[] = [
  { id: "magic-sparkle", name: "Magic Sparkle", category: "fanciful", image: magicSparkleImg, description: "Magické iskry", isHot: true },
  { id: "fire-phoenix", name: "Fire Phoenix", category: "heroes", image: firePhoenixImg, description: "Ohnivý fénix", isHot: true },
  { id: "dragon-rider", name: "Dragon Rider", category: "heroes", image: dragonRiderImg, description: "Jazdec na drakovi", isHot: true },
  { id: "neon-glow", name: "Neon Glow", category: "fanciful", image: neonGlowImg, description: "Neónová žiara", isHot: true },
  { id: "astronaut-space", name: "Astronaut Space", category: "heroes", image: astronautSpaceImg, description: "Astronaut vo vesmíre", isHot: true },
  { id: "earth-zoom-in", name: "Earth Zoom In", category: "fanciful", image: earthZoomInImg, description: "Priblíženie Zeme" },
  { id: "minecraft", name: "Minecraft", category: "entertainment", image: minecraftImg, description: "Minecraft transformácia" },
  { id: "box-me", name: "Box Me", category: "entertainment", image: boxMeImg, description: "Box efekt" },
  { id: "paper-fall", name: "Paper Fall", category: "fanciful", image: paperFallImg, description: "Padajúci papier" },
  { id: "style-me", name: "Style Me", category: "appearance", image: styleMeImg, description: "Štýlová transformácia" },
  { id: "ghibli", name: "Ghibli", category: "appearance", image: ghibliImg, description: "Ghibli štýl transformácia" },
  { id: "ai-couple-hugging", name: "AI Couple Hugging", category: "interactions", image: aiCoupleHuggingImg, description: "Objímanie páru" },
  { id: "nap-me", name: "Nap Me", category: "emotions", image: napMeImg, description: "Relaxačný efekt" },
  { id: "spin-360", name: "Spin 360", category: "fanciful", image: spin360Img, description: "360° rotácia" },
  { id: "sexy-me", name: "Sexy Me", category: "appearance", image: sexyMeImg, description: "Sexi transformácia" },
  { id: "gender-swap", name: "Gender Swap", category: "appearance", image: genderSwapImg, description: "Výmena pohlavia" },
  { id: "smile", name: "Smile", category: "emotions", image: smileImg, description: "Úsmev efekt" },
  { id: "bodyshake", name: "Bodyshake", category: "dance", image: bodyshakeImg, description: "Trasenie telom" },
  { id: "melt", name: "Melt", category: "fanciful", image: meltImg, description: "Topenie sa" },
  { id: "bloom-magic", name: "Bloom Magic", category: "fanciful", image: bloomMagicImg, description: "Kúzlo kvitnutia", isHot: true },
  { id: "paperman", name: "Paperman", category: "heroes", image: papermanImg, description: "Papierový muž" },
  { id: "flying", name: "Flying", category: "fanciful", image: flyingImg, description: "Lietanie", isHot: true },
  { id: "balloon-flyaway", name: "Balloon Flyaway", category: "fanciful", image: balloonFlyawayImg, description: "Balóny odletia" },
  { id: "expansion", name: "Expansion", category: "fanciful", image: expansionImg, description: "Expanzia" },
  { id: "pet-lovers", name: "Pet Lovers", category: "pets", image: petLoversImg, description: "Milovníci zvierat" },
  { id: "flame-carpet", name: "Flame Carpet", category: "fanciful", image: flameCarpetImg, description: "Plameňový koberec" },
  { id: "fashion-stride", name: "Fashion Stride", category: "appearance", image: fashionStrideImg, description: "Módny krok" },
  { id: "send-roses", name: "Send Roses", category: "interactions", image: sendRosesImg, description: "Poslať ruže", isHot: true },
  { id: "finger-heart", name: "Finger Heart", category: "emotions", image: fingerHeartImg, description: "Prstové srdce" },
  { id: "cartoon-doll", name: "Cartoon Doll", category: "appearance", image: cartoonDollImg, description: "Kreslená bábika" },
  { id: "beast-companion", name: "Beast Companion", category: "pets", image: beastCompanionImg, description: "Spoločník zviera" },
  { id: "bloom-doorobear", name: "Bloom Doorobear", category: "pets", image: bloomDoorobearImg, description: "Dooro medveď" },
  { id: "french-kiss", name: "French Kiss", category: "interactions", image: frenchKissImg, description: "Francúzsky bozk" },
  { id: "whos-arrested", name: "Who's arrested?", category: "entertainment", image: whosArrestedImg, description: "Kto je zatknutý?" },
  { id: "warmth-of-jesus", name: "Warmth of Jesus", category: "heroes", image: warmthOfJesusImg, description: "Teplo Ježiša", isHot: true },
  { id: "wild-laugh", name: "Wild Laugh", category: "emotions", image: wildLaughImg, description: "Divý smiech" },
  { id: "surprised", name: "Surprised", category: "emotions", image: surprisedImg, description: "Prekvapený" },
  { id: "explosion", name: "Explosion", category: "fanciful", image: explosionImg, description: "Explózia" },
  { id: "face-punch", name: "Face Punch", category: "entertainment", image: facePunchImg, description: "Facka" },
  { id: "ai-kiss", name: "AI Kiss", category: "interactions", image: aiKissImg, description: "AI bozk" },
  { id: "kungfu-club", name: "Kungfu Club", category: "entertainment", image: kungfuClubImg, description: "Kung-fu klub", isHot: true },
  { id: "holy-wings", name: "Holy Wings", category: "heroes", image: holyWingsImg, description: "Sväté krídla" },
  { id: "sheep-curls", name: "Sheep Curls", category: "pets", image: sheepCurlsImg, description: "Ovčie kučery", isHot: true },
  { id: "ai-muscle-generator", name: "AI Muscle Generator", category: "appearance", image: aiMuscleGeneratorImg, description: "AI generátor svalov", isHot: true },
  { id: "squish-it", name: "Squish It", category: "fanciful", image: squishItImg, description: "Stlač to", isHot: true },
  { id: "hair-growth-magic", name: "Hair Growth Magic", category: "appearance", image: hairGrowthMagicImg, description: "Kúzlo rastu vlasov", isHot: true },
  { id: "become-male", name: "Become Male", category: "appearance", image: becomeMaleImg, description: "Staň sa mužom" },
  { id: "alive-art", name: "Alive Art", category: "fanciful", image: aliveArtImg, description: "Živé umenie" },
  { id: "become-female", name: "Become Female", category: "appearance", image: becomeFemaleImg, description: "Staň sa ženou" },
  { id: "anything-robot", name: "Anything, Robot", category: "entertainment", image: anythingRobotImg, description: "Čokoľvek, robot", isHot: true },
  
  // Nové efekty
  { id: "magic-sparkle", name: "Magic Sparkle", category: "fanciful", image: magicSparkleImg, description: "Magické iskry", isHot: true },
  { id: "cyborg-transform", name: "Cyborg Transform", category: "heroes", image: cyborgTransformImg, description: "Kyborg transformácia", isHot: true },
  { id: "snow-globe", name: "Snow Globe", category: "fanciful", image: snowGlobeImg, description: "Snežná guľa" },
  { id: "butterfly-wings", name: "Butterfly Wings", category: "fanciful", image: butterflyWingsImg, description: "Motýlie krídla" },
  { id: "vampire-mode", name: "Vampire Mode", category: "heroes", image: vampireModeImg, description: "Upírsky režim" },
  { id: "plushie-party", name: "Plushie Party", category: "pets", image: plushiePartyImg, description: "Párty plyšákov" },
  
  { id: "rainbow-aura", name: "Rainbow Aura", category: "fanciful", image: rainbowAuraImg, description: "Dúhová aura" },
  { id: "zombie-walk", name: "Zombie Walk", category: "entertainment", image: zombieWalkImg, description: "Zombie chôdza" },
  { id: "superhero-landing", name: "Superhero Landing", category: "heroes", image: superheroLandingImg, description: "Pristátie superhrdinu" },
  { id: "crystal-freeze", name: "Crystal Freeze", category: "fanciful", image: crystalFreezeImg, description: "Kryštálové zamrznutie" },
  { id: "disco-ball", name: "Disco Ball", category: "dance", image: discoBallImg, description: "Disco guľa" },
  { id: "dragon-rider", name: "Dragon Rider", category: "heroes", image: dragonRiderImg, description: "Jazdec na drakovi", isHot: true },
  { id: "mermaid-tail", name: "Mermaid Tail", category: "fanciful", image: mermaidTailImg, description: "Morský chvost" },
  { id: "ninja-stealth", name: "Ninja Stealth", category: "heroes", image: ninjaStealthImg, description: "Ninja nenápadnosť" },
  { id: "fairy-godmother", name: "Fairy Godmother", category: "fanciful", image: fairyGodmotherImg, description: "Dobrá víla" },
  { id: "pirate-adventure", name: "Pirate Adventure", category: "entertainment", image: pirateAdventureImg, description: "Pirátske dobrodružstvo" },
  { id: "bubble-bounce", name: "Bubble Bounce", category: "fanciful", image: bubbleBounceImg, description: "Skákanie v bublinách" },
  { id: "neon-glow", name: "Neon Glow", category: "fanciful", image: neonGlowImg, description: "Neónová žiara", isHot: true },
  { id: "samurai-warrior", name: "Samurai Warrior", category: "heroes", image: samuraiWarriorImg, description: "Samurajský bojovník" },
  { id: "candy-land", name: "Candy Land", category: "entertainment", image: candyLandImg, description: "Cukrová krajina" },
  { id: "time-freeze", name: "Time Freeze", category: "fanciful", image: timeFreezeImg, description: "Zastavenie času" },
  { id: "fire-phoenix", name: "Fire Phoenix", category: "heroes", image: firePhoenixImg, description: "Ohnivý fénix", isHot: true },
  { id: "ice-queen", name: "Ice Queen", category: "heroes", image: iceQueenImg, description: "Ľadová kráľovná" },
  { id: "breakdance", name: "Breakdance", category: "dance", image: breakdanceImg, description: "Breakdance" },
  { id: "galaxy-portal", name: "Galaxy Portal", category: "fanciful", image: galaxyPortalImg, description: "Galaktický portál" },
  { id: "steampunk", name: "Steampunk", category: "appearance", image: steampunkImg, description: "Steampunk štýl" },
  { id: "baby-filter", name: "Baby Filter", category: "appearance", image: babyFilterImg, description: "Detský filter" },
  { id: "old-age", name: "Old Age", category: "appearance", image: oldAgeImg, description: "Staroba" },
  { id: "elf-ears", name: "Elf Ears", category: "fanciful", image: elfEarsImg, description: "Elfie uši" },
  { id: "werewolf", name: "Werewolf", category: "heroes", image: werewolfImg, description: "Vlkodlak" },
  { id: "astronaut-space", name: "Astronaut Space", category: "heroes", image: astronautSpaceImg, description: "Astronaut vo vesmíre", isHot: true },
  { id: "pixel-art", name: "Pixel Art", category: "entertainment", image: pixelArtImg, description: "Pixel art" },
  { id: "oil-painting", name: "Oil Painting", category: "appearance", image: oilPaintingImg, description: "Olejomaľba" },
  { id: "comic-book", name: "Comic Book", category: "entertainment", image: comicBookImg, description: "Komiks" },
  { id: "hologram", name: "Hologram", category: "fanciful", image: hologramImg, description: "Hologram" },
  { id: "ghost-spirit", name: "Ghost Spirit", category: "fanciful", image: ghostSpiritImg, description: "Duch" },
  { id: "clown-makeup", name: "Clown Makeup", category: "entertainment", image: clownMakeupImg, description: "Klaunský make-up" },
  { id: "tribal-paint", name: "Tribal Paint", category: "appearance", image: tribalPaintImg, description: "Kmeňové maľovanie" },
  { id: "bunny-ears", name: "Bunny Ears", category: "pets", image: bunnyEarsImg, description: "Zajačie uši" },
  { id: "cat-whiskers", name: "Cat Whiskers", category: "pets", image: catWhiskersImg, description: "Mačacie fúzy" },
  { id: "dog-filter", name: "Dog Filter", category: "pets", image: dogFilterImg, description: "Psí filter" },
  { id: "unicorn-horn", name: "Unicorn Horn", category: "fanciful", image: unicornHornImg, description: "Jednorožcový roh" },
  { id: "devil-horns", name: "Devil Horns", category: "entertainment", image: devilHornsImg, description: "Diablove rohy" },
  { id: "halo-angel", name: "Halo Angel", category: "heroes", image: haloAngelImg, description: "Svätožiara anjela" },
  { id: "matrix-code", name: "Matrix Code", category: "entertainment", image: matrixCodeImg, description: "Matrix kód", isHot: true },
  { id: "sunflower-crown", name: "Sunflower Crown", category: "appearance", image: sunflowerCrownImg, description: "Slnečnicová koruna" },
  { id: "rose-petals", name: "Rose Petals", category: "interactions", image: rosePetalsImg, description: "Ružové lupene" },
  { id: "confetti-blast", name: "Confetti Blast", category: "fanciful", image: confettiBlastImg, description: "Konfetový výbuch" },
  { id: "laser-eyes", name: "Laser Eyes", category: "heroes", image: laserEyesImg, description: "Laserové oči" },
  { id: "fire-breath", name: "Fire Breath", category: "heroes", image: fireBreathImg, description: "Ohnivý dych" },
  { id: "water-splash", name: "Water Splash", category: "fanciful", image: waterSplashImg, description: "Vodný šplech" },
  { id: "thunder-storm", name: "Thunder Storm", category: "fanciful", image: thunderStormImg, description: "Búrka s bleskami" },
  { id: "cherry-blossom", name: "Cherry Blossom", category: "appearance", image: cherryBlossomImg, description: "Čerešňový kvet" },
  { id: "autumn-leaves", name: "Autumn Leaves", category: "fanciful", image: autumnLeavesImg, description: "Jesenné lístie" },
  { id: "tropical-paradise", name: "Tropical Paradise", category: "fanciful", image: tropicalParadiseImg, description: "Tropický raj" },
  { id: "northern-lights", name: "Northern Lights", category: "fanciful", image: northernLightsImg, description: "Polárna žiara", isHot: true },
  { id: "shooting-star", name: "Shooting Star", category: "fanciful", image: shootingStarImg, description: "Padajúca hviezda" },
  { id: "crown-jewels", name: "Crown Jewels", category: "appearance", image: crownJewelsImg, description: "Korunové klenoty" },
];

const AIGeneration = () => {
  const navigate = useNavigate();
  const { credits, useCredit, refresh: refreshCredits } = useAICredits();
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>("all");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processingEffect, setProcessingEffect] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customGeneratedImage, setCustomGeneratedImage] = useState<string | null>(null);

  const filteredEffects = selectedCategory === "all" 
    ? aiEffects 
    : aiEffects.filter(effect => effect.category === selectedCategory);

  const handleEffectClick = async (effect: AIEffect) => {
    if (!uploadedFile || !previewUrl) {
      toast.error("Najprv nahrajte obrázok!");
      return;
    }

    // Check if user has credits
    if (credits.credits_remaining <= 0) {
      toast.error("Nemáte dostatok AI kreditov!", {
        action: {
          label: "Kúpiť kredity",
          onClick: () => navigate('/ai-credits-store')
        }
      });
      return;
    }

    setIsProcessing(true);
    setProcessingEffect(effect.id);
    setResultImage(null);

    try {
      // Use AI credit
      const creditUsed = await useCredit('effect', `Applied ${effect.name} effect`);
      
      if (!creditUsed) {
        toast.error("Nepodarilo sa použiť AI kredit");
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      const base64Image = await base64Promise;

      toast.info(`Aplikujem ${effect.name}...`, { duration: 2000 });

      const { data, error } = await supabase.functions.invoke('apply-ai-effect', {
        body: {
          imageUrl: base64Image,
          effectId: effect.id,
          effectName: effect.name
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Chyba pri volaní funkcie');
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error("Prekročený limit požiadaviek. Skúste neskôr.");
        } else if (data.error.includes('Payment required')) {
          toast.error("Nedostatok kreditov v Lovable AI workspace.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.imageUrl) {
        setResultImage(data.imageUrl);
        toast.success(`${effect.name} efekt úspešne aplikovaný!`);
        await refreshCredits();
      } else {
        throw new Error('Nepodarilo sa aplikovať efekt - žiadny výsledok');
      }
    } catch (error: any) {
      console.error('Error applying effect:', error);
      const errorMessage = error.message || 'Chyba pri aplikovaní efektu';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingEffect(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (!validImageTypes.includes(file.type)) {
      toast.error("Nepodporovaný formát. Použite JPG, PNG alebo WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 10MB.");
      return;
    }

    setUploadedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Obrázok úspešne nahratý!");
  };

  const handleGenerateCustomImage = async () => {
    if (!customPrompt.trim()) {
      toast.error("Zadajte popis obrázka!");
      return;
    }

    if (credits.credits_remaining <= 0) {
      toast.error("Nemáte dostatok AI kreditov!", {
        action: {
          label: "Kúpiť kredity",
          onClick: () => navigate('/ai-credits-store')
        }
      });
      return;
    }

    setIsGeneratingCustom(true);
    setCustomGeneratedImage(null);

    try {
      const creditUsed = await useCredit('custom_generation', `Generated custom image: ${customPrompt.substring(0, 50)}`);
      
      if (!creditUsed) {
        toast.error("Nepodarilo sa použiť AI kredit");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-custom-image', {
        body: { prompt: customPrompt }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCustomGeneratedImage(data.imageUrl);
      toast.success("Obrázok úspešne vygenerovaný!");
      await refreshCredits();

    } catch (error) {
      console.error('Error generating custom image:', error);
      toast.error("Nepodarilo sa vygenerovať obrázok. Skúste to znova.");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Efekty na Obrázky
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformujte svoje fotky pomocou pokročilých AI efektov
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="font-semibold">{credits.credits_remaining} kreditov</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ai-credits-store')}
            >
              Kúpiť kredity
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: "all", label: "Všetky" },
            { id: "interactions", label: "Interakcie" },
            { id: "pets", label: "Zvieratá" },
            { id: "appearance", label: "Vzhľad" },
            { id: "entertainment", label: "Zábava" },
            { id: "heroes", label: "Hrdinovia" },
            { id: "fanciful", label: "Fantazijné" },
            { id: "dance", label: "Tanec" },
            { id: "emotions", label: "Emócie" },
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id as EffectCategory)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Effects Grid */}
        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Aplikujem AI efekt... Toto môže trvať 10-30 sekúnd.</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Prosím čakajte, AI spracováva váš obrázok</p>
          </div>
        )}

        {!isProcessing && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {filteredEffects.map((effect) => (
              <Card
                key={effect.id}
                className={`cursor-pointer hover:shadow-elegant transition-all group relative overflow-hidden ${
                  isProcessing && processingEffect === effect.id ? 'ring-2 ring-primary' : ''
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => handleEffectClick(effect)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <img 
                      src={effect.image} 
                      alt={effect.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {effect.isHot && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      HOT
                    </div>
                  )}
                  <div className="p-3 bg-background">
                    <h3 className="font-semibold text-sm text-center">{effect.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Result Section */}
        {resultImage && (
          <div className="mt-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Výsledok</CardTitle>
                <CardDescription>Váš obrázok s aplikovaným AI efektom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <img 
                    src={resultImage} 
                    alt="Result" 
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resultImage;
                      link.download = `ai-effect-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Stiahnuť
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Nahrať súbor
              </CardTitle>
              <CardDescription>
                Nahrajte svoj obrázok pre aplikáciu AI efektov
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="file-upload" className="block">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Kliknite pre nahratie obrázka
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Podporované formáty: JPG, PNG, WEBP (max 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {previewUrl && uploadedFile && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-2">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Odstrániť
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Custom Image Generation Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Vlastné AI generovanie
              </CardTitle>
              <CardDescription>
                Vytvorte úplne nový obrázok pomocou AI podľa vášho popisu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="custom-prompt" className="text-sm font-medium">
                  Popíšte obrázok, ktorý chcete vytvoriť
                </label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Napríklad: Krásny západ slnka nad horami, realistický štýl, vysoká kvalita..."
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGeneratingCustom}
                />
              </div>
              
              <Button
                onClick={handleGenerateCustomImage}
                disabled={isGeneratingCustom || !customPrompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGeneratingCustom ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generujem obrázok...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Vygenerovať obrázok (1 kredit)
                  </>
                )}
              </Button>

              {customGeneratedImage && (
                <div className="mt-6 border rounded-lg p-4 bg-background">
                  <div className="relative group">
                    <img
                      src={customGeneratedImage}
                      alt="Vygenerovaný obrázok"
                      className="w-full rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = customGeneratedImage;
                        link.download = `ai-generated-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Obrázok sa sťahuje!");
                      }}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Stiahnuť
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ako to funguje?</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Vygenerujte alebo nahrajte</h3>
                <p className="text-sm text-muted-foreground">
                  Vytvorte vlastný obrázok AI alebo nahrajte svoj
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Vyberte efekt</h3>
                <p className="text-sm text-muted-foreground">
                  Zvoľte AI efekt z našej knižnice
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Stiahnite</h3>
                <p className="text-sm text-muted-foreground">
                  Získajte váš transformovaný obsah
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGeneration;
