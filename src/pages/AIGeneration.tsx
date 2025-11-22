import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Image as ImageIcon, Video, Music, Upload, Loader2, Download, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import ghibliImg from "@/assets/effects/ghibli.jpg";
import minecraftImg from "@/assets/effects/minecraft.jpg";
import vintagePhotoImg from "@/assets/effects/vintage-photo.jpg";
import watercolorImg from "@/assets/effects/watercolor.jpg";
import popArtImg from "@/assets/effects/pop-art.jpg";
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
import kawaiianimeImg from "@/assets/effects/kawaii-anime.jpg";
import underwaterDreamImg from "@/assets/effects/underwater-dream.jpg";
import goldenTouchImg from "@/assets/effects/golden-touch.jpg";
import timeTravelerImg from "@/assets/effects/time-traveler.jpg";
import neonCityImg from "@/assets/effects/neon-city.jpg";
import crystalWingsImg from "@/assets/effects/crystal-wings.jpg";
import shadowCloneImg from "@/assets/effects/shadow-clone.jpg";
import flowerPowerImg from "@/assets/effects/flower-power.jpg";
import stormWarriorImg from "@/assets/effects/storm-warrior.jpg";
import desertMirageImg from "@/assets/effects/desert-mirage.jpg";
import oceanWaveImg from "@/assets/effects/ocean-wave.jpg";
import cosmicEnergyImg from "@/assets/effects/cosmic-energy.jpg";
import fireDragonImg from "@/assets/effects/fire-dragon.jpg";
import iceDragonImg from "@/assets/effects/ice-dragon.jpg";
import lightningStrikeImg from "@/assets/effects/lightning-strike.jpg";
import mysticPortalImg from "@/assets/effects/mystic-portal.jpg";
import ancientWarriorImg from "@/assets/effects/ancient-warrior.jpg";
import futureSoldierImg from "@/assets/effects/future-soldier.jpg";
import fairyTaleImg from "@/assets/effects/fairy-tale.jpg";
import wildWestImg from "@/assets/effects/wild-west.jpg";
import spaceExplorerImg from "@/assets/effects/space-explorer.jpg";
import deepSeaImg from "@/assets/effects/deep-sea.jpg";
import mountainPeakImg from "@/assets/effects/mountain-peak.jpg";
import forestSpiritImg from "@/assets/effects/forest-spirit.jpg";
import cityLightsImg from "@/assets/effects/city-lights.jpg";
import sunsetGlowImg from "@/assets/effects/sunset-glow.jpg";
import moonlightImg from "@/assets/effects/moonlight.jpg";
import starlightImg from "@/assets/effects/starlight.jpg";
import rainbowBridgeImg from "@/assets/effects/rainbow-bridge.jpg";
import cloudNineImg from "@/assets/effects/cloud-nine.jpg";
import angelWingsImg from "@/assets/effects/angel-wings.jpg";
import demonWingsImg from "@/assets/effects/demon-wings.jpg";
import knightArmorImg from "@/assets/effects/knight-armor.jpg";
import samuraiArmorImg from "@/assets/effects/samurai-armor.jpg";
import vikingWarriorImg from "@/assets/effects/viking-warrior.jpg";
import pharaohGoldImg from "@/assets/effects/pharaoh-gold.jpg";
import greekStatueImg from "@/assets/effects/greek-statue.jpg";
import bronzeStatueImg from "@/assets/effects/bronze-statue.jpg";
import iceScultureImg from "@/assets/effects/ice-sculpture.jpg";
import stainedGlassImg from "@/assets/effects/stained-glass.jpg";
import mosaicTilesImg from "@/assets/effects/mosaic-tiles.jpg";
import origamiFoldImg from "@/assets/effects/origami-fold.jpg";
import paperCutoutImg from "@/assets/effects/paper-cutout.jpg";
import glitterBombImg from "@/assets/effects/glitter-bomb.jpg";
import cottonCandyImg from "@/assets/effects/cotton-candy.jpg";
import masqueradeImg from "@/assets/effects/masquerade.jpg";
import tikiMaskImg from "@/assets/effects/tiki-mask.jpg";
import sugarSkullImg from "@/assets/effects/sugar-skull.jpg";
import gothicCastleImg from "@/assets/effects/gothic-castle.jpg";
import medusaGazeImg from "@/assets/effects/medusa-gaze.jpg";


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
  { id: "kungfu-club", name: "Kungfu Club", category: "entertainment", image: kungfuClubImg, description: "Kung-fu club", isHot: true },
  { id: "bloom-magic", name: "Bloom Magic", category: "fanciful", image: bloomMagicImg, description: "Blooming magic", isHot: true },
  { id: "galaxy-portal", name: "Galaxy Portal", category: "fanciful", image: galaxyPortalImg, description: "Galaxy portal" },
  { id: "cyborg-transform", name: "Cyborg Transform", category: "heroes", image: cyborgTransformImg, description: "Cyborg transformation", isHot: true },
  { id: "ice-queen", name: "Ice Queen", category: "heroes", image: iceQueenImg, description: "Ice queen" },
  { id: "earth-zoom-in", name: "Earth Zoom In", category: "fanciful", image: earthZoomInImg, description: "Earth zoom in" },
  { id: "minecraft", name: "Minecraft", category: "entertainment", image: minecraftImg, description: "Minecraft transformation" },
  { id: "box-me", name: "Box Me", category: "entertainment", image: boxMeImg, description: "Box effect" },
  { id: "paper-fall", name: "Paper Fall", category: "fanciful", image: paperFallImg, description: "Falling paper" },
  { id: "style-me", name: "Style Me", category: "appearance", image: styleMeImg, description: "Style transformation" },
  { id: "ghibli", name: "Ghibli", category: "appearance", image: ghibliImg, description: "Ghibli style transformation" },
  { id: "ai-couple-hugging", name: "AI Couple Hugging", category: "interactions", image: aiCoupleHuggingImg, description: "Couple hugging" },
  { id: "nap-me", name: "Nap Me", category: "emotions", image: napMeImg, description: "Relaxation effect" },
  { id: "spin-360", name: "Spin 360", category: "fanciful", image: spin360Img, description: "360° rotation" },
  { id: "sexy-me", name: "Sexy Me", category: "appearance", image: sexyMeImg, description: "Sexy transformation" },
  { id: "gender-swap", name: "Gender Swap", category: "appearance", image: genderSwapImg, description: "Gender swap" },
  { id: "smile", name: "Smile", category: "emotions", image: smileImg, description: "Smile effect" },
  { id: "melt", name: "Melt", category: "fanciful", image: meltImg, description: "Melting" },
  { id: "watercolor", name: "Watercolor", category: "appearance", image: watercolorImg, description: "Watercolor effect" },
  { id: "paperman", name: "Paperman", category: "heroes", image: papermanImg, description: "Paper man" },
  { id: "pop-art", name: "Pop Art", category: "appearance", image: popArtImg, description: "Pop art style" },
  { id: "angel-wings", name: "Angel Wings", category: "fanciful", image: angelWingsImg, description: "Angel wings" },
  { id: "demon-wings", name: "Demon Wings", category: "fanciful", image: demonWingsImg, description: "Demon wings" },
  { id: "pet-lovers", name: "Pet Lovers", category: "pets", image: petLoversImg, description: "Pet lovers" },
  { id: "knight-armor", name: "Knight Armor", category: "heroes", image: knightArmorImg, description: "Knight armor" },
  { id: "samurai-armor", name: "Samurai Armor", category: "heroes", image: samuraiArmorImg, description: "Samurai armor" },
  { id: "send-roses", name: "Send Roses", category: "interactions", image: sendRosesImg, description: "Send roses", isHot: true },
  { id: "finger-heart", name: "Finger Heart", category: "emotions", image: fingerHeartImg, description: "Finger heart" },
  { id: "cartoon-doll", name: "Cartoon Doll", category: "appearance", image: cartoonDollImg, description: "Cartoon doll" },
  { id: "beast-companion", name: "Beast Companion", category: "pets", image: beastCompanionImg, description: "Beast companion" },
  { id: "bloom-doorobear", name: "Bloom Doorobear", category: "pets", image: bloomDoorobearImg, description: "Dooro bear" },
  { id: "french-kiss", name: "French Kiss", category: "interactions", image: frenchKissImg, description: "French kiss" },
  { id: "whos-arrested", name: "Who's arrested?", category: "entertainment", image: whosArrestedImg, description: "Who's arrested?" },
  { id: "warmth-of-jesus", name: "Warmth of Jesus", category: "heroes", image: warmthOfJesusImg, description: "Warmth of Jesus", isHot: true },
  { id: "wild-laugh", name: "Wild Laugh", category: "emotions", image: wildLaughImg, description: "Wild laugh" },
  { id: "surprised", name: "Surprised", category: "emotions", image: surprisedImg, description: "Surprised" },
  { id: "viking-warrior", name: "Viking Warrior", category: "heroes", image: vikingWarriorImg, description: "Viking warrior" },
  { id: "pharaoh-gold", name: "Pharaoh Gold", category: "heroes", image: pharaohGoldImg, description: "Golden pharaoh" },
  { id: "ai-kiss", name: "AI Kiss", category: "interactions", image: aiKissImg, description: "AI kiss" },
  { id: "holy-wings", name: "Holy Wings", category: "heroes", image: holyWingsImg, description: "Holy wings" },
  { id: "sheep-curls", name: "Sheep Curls", category: "pets", image: sheepCurlsImg, description: "Sheep curls", isHot: true },
  { id: "ai-muscle-generator", name: "AI Muscle Generator", category: "appearance", image: aiMuscleGeneratorImg, description: "AI muscle generator", isHot: true },
  { id: "squish-it", name: "Squish It", category: "fanciful", image: squishItImg, description: "Squish it", isHot: true },
  { id: "hair-growth-magic", name: "Hair Growth Magic", category: "appearance", image: hairGrowthMagicImg, description: "Hair growth magic", isHot: true },
  { id: "become-male", name: "Become Male", category: "appearance", image: becomeMaleImg, description: "Become male" },
  { id: "alive-art", name: "Alive Art", category: "fanciful", image: aliveArtImg, description: "Alive art" },
  { id: "become-female", name: "Become Female", category: "appearance", image: becomeFemaleImg, description: "Become female" },
  { id: "anything-robot", name: "Anything, Robot", category: "entertainment", image: anythingRobotImg, description: "Anything, robot", isHot: true },
  { id: "magic-sparkle", name: "Magic Sparkle", category: "fanciful", image: magicSparkleImg, description: "Magic sparkle", isHot: true },
  { id: "snow-globe", name: "Snow Globe", category: "fanciful", image: snowGlobeImg, description: "Snow globe" },
  { id: "butterfly-wings", name: "Butterfly Wings", category: "fanciful", image: butterflyWingsImg, description: "Butterfly wings" },
  { id: "vampire-mode", name: "Vampire Mode", category: "heroes", image: vampireModeImg, description: "Vampire mode" },
  { id: "plushie-party", name: "Plushie Party", category: "pets", image: plushiePartyImg, description: "Plushie party" },
  { id: "rainbow-aura", name: "Rainbow Aura", category: "fanciful", image: rainbowAuraImg, description: "Rainbow aura" },
  { id: "zombie-walk", name: "Zombie Walk", category: "entertainment", image: zombieWalkImg, description: "Zombie walk" },
  { id: "superhero-landing", name: "Superhero Landing", category: "heroes", image: superheroLandingImg, description: "Superhero landing" },
  { id: "crystal-freeze", name: "Crystal Freeze", category: "fanciful", image: crystalFreezeImg, description: "Crystal freeze" },
  { id: "greek-statue", name: "Greek Statue", category: "appearance", image: greekStatueImg, description: "Greek statue" },
  { id: "dragon-rider", name: "Dragon Rider", category: "heroes", image: dragonRiderImg, description: "Dragon rider", isHot: true },
  { id: "mermaid-tail", name: "Mermaid Tail", category: "fanciful", image: mermaidTailImg, description: "Mermaid tail" },
  { id: "ninja-stealth", name: "Ninja Stealth", category: "heroes", image: ninjaStealthImg, description: "Ninja stealth" },
  { id: "fairy-godmother", name: "Fairy Godmother", category: "fanciful", image: fairyGodmotherImg, description: "Fairy godmother" },
  { id: "pirate-adventure", name: "Pirate Adventure", category: "heroes", image: pirateAdventureImg, description: "Pirate adventure" },
  { id: "bubble-bounce", name: "Bubble Bounce", category: "fanciful", image: bubbleBounceImg, description: "Bubble bounce" },
  { id: "neon-glow", name: "Neon Glow", category: "fanciful", image: neonGlowImg, description: "Neon glow" },
  { id: "samurai-warrior", name: "Samurai Warrior", category: "heroes", image: samuraiWarriorImg, description: "Samurai warrior" },
  { id: "candy-land", name: "Candy Land", category: "fanciful", image: candyLandImg, description: "Candy land" },
  { id: "time-freeze", name: "Time Freeze", category: "fanciful", image: timeFreezeImg, description: "Time freeze" },
  { id: "fire-phoenix", name: "Fire Phoenix", category: "heroes", image: firePhoenixImg, description: "Fire phoenix", isHot: true },
  { id: "breakdance", name: "Breakdance", category: "dance", image: breakdanceImg, description: "Breakdance" },
  { id: "steampunk", name: "Steampunk", category: "appearance", image: steampunkImg, description: "Steampunk" },
  { id: "baby-filter", name: "Baby Filter", category: "appearance", image: babyFilterImg, description: "Baby filter" },
  { id: "old-age", name: "Old Age", category: "appearance", image: oldAgeImg, description: "Old age" },
  { id: "elf-ears", name: "Elf Ears", category: "fanciful", image: elfEarsImg, description: "Elf ears" },
  { id: "werewolf", name: "Werewolf", category: "heroes", image: werewolfImg, description: "Werewolf" },
  { id: "astronaut-space", name: "Astronaut Space", category: "heroes", image: astronautSpaceImg, description: "Astronaut space" },
  { id: "pixel-art", name: "Pixel Art", category: "appearance", image: pixelArtImg, description: "Pixel art" },
  { id: "oil-painting", name: "Oil Painting", category: "appearance", image: oilPaintingImg, description: "Oil painting" },
  { id: "comic-book", name: "Comic Book", category: "appearance", image: comicBookImg, description: "Comic book" },
  { id: "hologram", name: "Hologram", category: "fanciful", image: hologramImg, description: "Hologram" },
  { id: "ghost-spirit", name: "Ghost Spirit", category: "fanciful", image: ghostSpiritImg, description: "Ghost spirit" },
  { id: "clown-makeup", name: "Clown Makeup", category: "appearance", image: clownMakeupImg, description: "Clown makeup" },
  { id: "tribal-paint", name: "Tribal Paint", category: "appearance", image: tribalPaintImg, description: "Tribal paint" },
  { id: "bunny-ears", name: "Bunny Ears", category: "fanciful", image: bunnyEarsImg, description: "Bunny ears" },
  { id: "cat-whiskers", name: "Cat Whiskers", category: "pets", image: catWhiskersImg, description: "Cat whiskers" },
  { id: "dog-filter", name: "Dog Filter", category: "pets", image: dogFilterImg, description: "Dog filter" },
  { id: "unicorn-horn", name: "Unicorn Horn", category: "fanciful", image: unicornHornImg, description: "Unicorn horn" },
  { id: "devil-horns", name: "Devil Horns", category: "heroes", image: devilHornsImg, description: "Devil horns" },
  { id: "halo-angel", name: "Halo Angel", category: "heroes", image: haloAngelImg, description: "Halo angel" },
  { id: "matrix-code", name: "Matrix Code", category: "fanciful", image: matrixCodeImg, description: "Matrix code" },
  { id: "sunflower-crown", name: "Sunflower Crown", category: "fanciful", image: sunflowerCrownImg, description: "Sunflower crown" },
  { id: "rose-petals", name: "Rose Petals", category: "fanciful", image: rosePetalsImg, description: "Rose petals" },
  { id: "confetti-blast", name: "Confetti Blast", category: "fanciful", image: confettiBlastImg, description: "Confetti blast" },
  { id: "laser-eyes", name: "Laser Eyes", category: "heroes", image: laserEyesImg, description: "Laser eyes" },
  { id: "fire-breath", name: "Fire Breath", category: "heroes", image: fireBreathImg, description: "Fire breath" },
  { id: "water-splash", name: "Water Splash", category: "fanciful", image: waterSplashImg, description: "Water splash" },
  { id: "thunder-storm", name: "Thunder Storm", category: "fanciful", image: thunderStormImg, description: "Thunder storm" },
  { id: "cherry-blossom", name: "Cherry Blossom", category: "fanciful", image: cherryBlossomImg, description: "Cherry blossom" },
  { id: "autumn-leaves", name: "Autumn Leaves", category: "fanciful", image: autumnLeavesImg, description: "Autumn leaves" },
  { id: "tropical-paradise", name: "Tropical Paradise", category: "fanciful", image: tropicalParadiseImg, description: "Tropical paradise" },
  { id: "northern-lights", name: "Northern Lights", category: "fanciful", image: northernLightsImg, description: "Northern lights" },
  { id: "shooting-star", name: "Shooting Star", category: "fanciful", image: shootingStarImg, description: "Shooting star" },
  { id: "crown-jewels", name: "Crown Jewels", category: "fanciful", image: crownJewelsImg, description: "Crown jewels" },
  { id: "kawaii-anime", name: "Kawaii Anime", category: "appearance", image: kawaiianimeImg, description: "Kawaii anime" },
  { id: "underwater-dream", name: "Underwater Dream", category: "fanciful", image: underwaterDreamImg, description: "Underwater dream" },
  { id: "golden-touch", name: "Golden Touch", category: "appearance", image: goldenTouchImg, description: "Golden touch" },
  { id: "time-traveler", name: "Time Traveler", category: "heroes", image: timeTravelerImg, description: "Time traveler" },
  { id: "neon-city", name: "Neon City", category: "fanciful", image: neonCityImg, description: "Neon city" },
  { id: "crystal-wings", name: "Crystal Wings", category: "fanciful", image: crystalWingsImg, description: "Crystal wings" },
  { id: "shadow-clone", name: "Shadow Clone", category: "fanciful", image: shadowCloneImg, description: "Shadow clone" },
  { id: "flower-power", name: "Flower Power", category: "fanciful", image: flowerPowerImg, description: "Flower power" },
  { id: "medusa-gaze", name: "Medusa Gaze", category: "heroes", image: medusaGazeImg, description: "Medusa gaze" },
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
  
  // Nové efekty - 30 nových
  { id: "kawaii-anime", name: "Kawaii Anime", category: "appearance", image: kawaiianimeImg, description: "Roztomilé anime", isHot: true },
  { id: "underwater-dream", name: "Underwater Dream", category: "fanciful", image: underwaterDreamImg, description: "Podmorský sen" },
  { id: "golden-touch", name: "Golden Touch", category: "fanciful", image: goldenTouchImg, description: "Zlatý dotyk", isHot: true },
  { id: "time-traveler", name: "Time Traveler", category: "heroes", image: timeTravelerImg, description: "Cestovateľ časom" },
  { id: "neon-city", name: "Neon City", category: "fanciful", image: neonCityImg, description: "Neónové mesto" },
  { id: "crystal-wings", name: "Crystal Wings", category: "fanciful", image: crystalWingsImg, description: "Kryštálové krídla", isHot: true },
  { id: "shadow-clone", name: "Shadow Clone", category: "heroes", image: shadowCloneImg, description: "Tieňový klon" },
  { id: "flower-power", name: "Flower Power", category: "fanciful", image: flowerPowerImg, description: "Kvetinová sila" },
  { id: "storm-warrior", name: "Storm Warrior", category: "heroes", image: stormWarriorImg, description: "Búrkový bojovník", isHot: true },
  { id: "desert-mirage", name: "Desert Mirage", category: "fanciful", image: desertMirageImg, description: "Púštna miráž" },
  { id: "ocean-wave", name: "Ocean Wave", category: "fanciful", image: oceanWaveImg, description: "Oceánska vlna" },
  { id: "cosmic-energy", name: "Cosmic Energy", category: "heroes", image: cosmicEnergyImg, description: "Kosmická energia", isHot: true },
  { id: "fire-dragon", name: "Fire Dragon", category: "heroes", image: fireDragonImg, description: "Ohnivý drak", isHot: true },
  { id: "ice-dragon", name: "Ice Dragon", category: "heroes", image: iceDragonImg, description: "Ľadový drak", isHot: true },
  { id: "lightning-strike", name: "Lightning Strike", category: "heroes", image: lightningStrikeImg, description: "Úder blesku" },
  { id: "mystic-portal", name: "Mystic Portal", category: "fanciful", image: mysticPortalImg, description: "Mystický portál", isHot: true },
  { id: "ancient-warrior", name: "Ancient Warrior", category: "heroes", image: ancientWarriorImg, description: "Starovký bojovník" },
  { id: "future-soldier", name: "Future Soldier", category: "heroes", image: futureSoldierImg, description: "Budúci vojak" },
  { id: "fairy-tale", name: "Fairy Tale", category: "fanciful", image: fairyTaleImg, description: "Rozprávka" },
  { id: "wild-west", name: "Wild West", category: "entertainment", image: wildWestImg, description: "Divoký západ" },
  { id: "space-explorer", name: "Space Explorer", category: "heroes", image: spaceExplorerImg, description: "Vesmírny prieskumník" },
  { id: "deep-sea", name: "Deep Sea", category: "fanciful", image: deepSeaImg, description: "Hlboké more" },
  { id: "mountain-peak", name: "Mountain Peak", category: "fanciful", image: mountainPeakImg, description: "Horský vrchol" },
  { id: "forest-spirit", name: "Forest Spirit", category: "fanciful", image: forestSpiritImg, description: "Lesný duch" },
  { id: "city-lights", name: "City Lights", category: "entertainment", image: cityLightsImg, description: "Mestské svetlá" },
  { id: "sunset-glow", name: "Sunset Glow", category: "fanciful", image: sunsetGlowImg, description: "Žiara západu slnka" },
  { id: "moonlight", name: "Moonlight", category: "fanciful", image: moonlightImg, description: "Mesačné svetlo" },
  { id: "starlight", name: "Starlight", category: "fanciful", image: starlightImg, description: "Hviezdne svetlo", isHot: true },
  { id: "rainbow-bridge", name: "Rainbow Bridge", category: "fanciful", image: rainbowBridgeImg, description: "Dúhový most" },
  { id: "cloud-nine", name: "Cloud Nine", category: "fanciful", image: cloudNineImg, description: "Deviaty oblak" },
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
      toast.error("Please upload an image first!");
      return;
    }

    // Check if user has credits
    if (credits.credits_remaining <= 0) {
      toast.error("You don't have enough AI credits!", {
        action: {
          label: "Buy credits",
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
        toast.error("Failed to use AI credit");
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

      toast.info(`Applying ${effect.name}...`, { duration: 2000 });

      const { data, error } = await supabase.functions.invoke('apply-ai-effect', {
        body: {
          imageUrl: base64Image,
          effectId: effect.id,
          effectName: effect.name
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error calling function');
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error("Rate limit exceeded. Try again later.");
        } else if (data.error.includes('Payment required')) {
          toast.error("Insufficient credits in Lovable AI workspace.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.imageUrl) {
        setResultImage(data.imageUrl);
        toast.success(`${effect.name} effect successfully applied!`);
        await refreshCredits();
      } else {
        throw new Error('Failed to apply effect - no result');
      }
    } catch (error: any) {
      console.error('Error applying effect:', error);
      const errorMessage = error.message || 'Error applying effect';
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
      toast.error("Unsupported format. Use JPG, PNG or WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Image is too large. Maximum size is 10MB.");
      return;
    }

    setUploadedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Image successfully uploaded!");
  };

  const handleGenerateCustomImage = async () => {
    if (!customPrompt.trim()) {
      toast.error("Enter image description!");
      return;
    }

    if (credits.credits_remaining <= 0) {
      toast.error("You don't have enough AI credits!", {
        action: {
          label: "Buy credits",
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
        toast.error("Failed to use AI credit");
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
      toast.success("Image successfully generated!");
      await refreshCredits();

    } catch (error) {
      console.error('Error generating custom image:', error);
      toast.error("Failed to generate image. Try again.");
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
              AI Effects on Images
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your photos using advanced AI effects
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="font-semibold">{credits.credits_remaining} credits</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ai-credits-store')}
            >
              Buy credits
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: "all", label: "All" },
            { id: "interactions", label: "Interactions" },
            { id: "pets", label: "Pets" },
            { id: "appearance", label: "Appearance" },
            { id: "entertainment", label: "Entertainment" },
            { id: "heroes", label: "Heroes" },
            { id: "fanciful", label: "Fanciful" },
            { id: "dance", label: "Dance" },
            { id: "emotions", label: "Emotions" },
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
            <p className="text-muted-foreground">Applying AI effect... This may take 10-30 seconds.</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Please wait, AI is processing your image</p>
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
                <CardTitle>Result</CardTitle>
                <CardDescription>Your image with applied AI effect</CardDescription>
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
                    Download
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
                Upload File
              </CardTitle>
              <CardDescription>
                Upload your image to apply AI effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="file-upload" className="block">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP (max 10MB)
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
                      Remove
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
                Custom AI Generation
              </CardTitle>
              <CardDescription>
                Create a completely new image using AI based on your description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="custom-prompt" className="text-sm font-medium">
                  Describe the image you want to create
                </label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="For example: Beautiful sunset over mountains, realistic style, high quality..."
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
                    Generating image...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Image (1 credit)
                  </>
                )}
              </Button>

              {customGeneratedImage && (
                <div className="mt-6 border rounded-lg p-4 bg-background">
                  <div className="relative group">
                    <img
                      src={customGeneratedImage}
                      alt="Generated image"
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
                        toast.success("Image is downloading!");
                      }}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
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
              <CardTitle>How does it work?</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Generate or Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom AI image or upload your own
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Choose Effect</h3>
                <p className="text-sm text-muted-foreground">
                  Select AI effect from our library
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Download</h3>
                <p className="text-sm text-muted-foreground">
                  Get your transformed content
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
