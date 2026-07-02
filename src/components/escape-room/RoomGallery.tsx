import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import all room images
import hauntedManor from "@/assets/escape-rooms/haunted-manor.jpg";
import marsColony from "@/assets/escape-rooms/mars-colony.jpg";
import detectiveOffice from "@/assets/escape-rooms/detective-office.jpg";
import dragonLair from "@/assets/escape-rooms/dragon-lair.jpg";
import jungleExpedition from "@/assets/escape-rooms/jungle-expedition.jpg";
import mathChallenge from "@/assets/escape-rooms/math-challenge.jpg";
import corporateTeam from "@/assets/escape-rooms/corporate-team.jpg";
import vampireCastle from "@/assets/escape-rooms/vampire-castle.jpg";
import cyberpunkHeist from "@/assets/escape-rooms/cyberpunk-heist.jpg";
import sherlockStudy from "@/assets/escape-rooms/sherlock-study.jpg";
import wizardTower from "@/assets/escape-rooms/wizard-tower.jpg";
import pirateTreasure from "@/assets/escape-rooms/pirate-treasure.jpg";
import spaceStation from "@/assets/escape-rooms/space-station.jpg";
import hauntedAsylum from "@/assets/escape-rooms/haunted-asylum.jpg";
import egyptianTomb from "@/assets/escape-rooms/egyptian-tomb.jpg";
import timeParadox from "@/assets/escape-rooms/time-paradox.jpg";
import murderManor from "@/assets/escape-rooms/murder-manor.jpg";
import zombieShelter from "@/assets/escape-rooms/zombie-shelter.jpg";
import dragonMountain from "@/assets/escape-rooms/dragon-mountain.jpg";
import submarineEmergency from "@/assets/escape-rooms/submarine-emergency.jpg";
import witchCottage from "@/assets/escape-rooms/witch-cottage.jpg";
import bankHeist from "@/assets/escape-rooms/bank-heist.jpg";
import scienceLab from "@/assets/escape-rooms/science-lab.jpg";
import corporateEspionage from "@/assets/escape-rooms/corporate-espionage.jpg";
import arcticStation from "@/assets/escape-rooms/arctic-station.jpg";
import forbiddenLibrary from "@/assets/escape-rooms/forbidden-library.jpg";
import casinoHeist from "@/assets/escape-rooms/casino-heist.jpg";
import alienMothership from "@/assets/escape-rooms/alien-mothership.jpg";
import androidRevolution from "@/assets/escape-rooms/android-revolution.jpg";
import quantumLab from "@/assets/escape-rooms/quantum-lab.jpg";
import starshipBridge from "@/assets/escape-rooms/starship-bridge.jpg";
import cryogenicAwakening from "@/assets/escape-rooms/cryogenic-awakening.jpg";
import neuralNetwork from "@/assets/escape-rooms/neural-network.jpg";
import terraformingStation from "@/assets/escape-rooms/terraforming-station.jpg";
import deepSpaceMining from "@/assets/escape-rooms/deep-space-mining.jpg";
import vrPrison from "@/assets/escape-rooms/vr-prison.jpg";
import robotFactory from "@/assets/escape-rooms/robot-factory.jpg";
import cursedCarnival from "@/assets/escape-rooms/cursed-carnival.jpg";
import abandonedLab from "@/assets/escape-rooms/abandoned-lab.jpg";
import witchHunt from "@/assets/escape-rooms/witch-hunt.jpg";
import demonicPossession from "@/assets/escape-rooms/demonic-possession.jpg";
import serialKiller from "@/assets/escape-rooms/serial-killer.jpg";
import ghostShip from "@/assets/escape-rooms/ghost-ship.jpg";
import plagueDoctor from "@/assets/escape-rooms/plague-doctor.jpg";
import dollFactory from "@/assets/escape-rooms/doll-factory.jpg";
import catacombs from "@/assets/escape-rooms/catacombs.jpg";
import slaughterhouse from "@/assets/escape-rooms/slaughterhouse.jpg";
import artGallery from "@/assets/escape-rooms/art-gallery.jpg";
import coldCase from "@/assets/escape-rooms/cold-case.jpg";
import spyAcademy from "@/assets/escape-rooms/spy-academy.jpg";
import luxuryTrain from "@/assets/escape-rooms/luxury-train.jpg";
import secretSociety from "@/assets/escape-rooms/secret-society.jpg";
import jewelThief from "@/assets/escape-rooms/jewel-thief.jpg";
import fbiEvidence from "@/assets/escape-rooms/fbi-evidence.jpg";
import politicalScandal from "@/assets/escape-rooms/political-scandal.jpg";
import cardCounting from "@/assets/escape-rooms/card-counting.jpg";
import insuranceFraud from "@/assets/escape-rooms/insurance-fraud.jpg";
import unicornSanctuary from "@/assets/escape-rooms/unicorn-sanctuary.jpg";
import darkSorcerer from "@/assets/escape-rooms/dark-sorcerer.jpg";
import fairytaleCastle from "@/assets/escape-rooms/fairytale-castle.jpg";
import atlantisRising from "@/assets/escape-rooms/atlantis-rising.jpg";
import phoenixRebirth from "@/assets/escape-rooms/phoenix-rebirth.jpg";
import goblinMarket from "@/assets/escape-rooms/goblin-market.jpg";
import mermaidKingdom from "@/assets/escape-rooms/mermaid-kingdom.jpg";
import centaurProphecy from "@/assets/escape-rooms/centaur-prophecy.jpg";
import crystalCaverns from "@/assets/escape-rooms/crystal-caverns.jpg";
import vampireCouncil from "@/assets/escape-rooms/vampire-council.jpg";
import amazonJungle from "@/assets/escape-rooms/amazon-jungle.jpg";
import saharaDesert from "@/assets/escape-rooms/sahara-desert.jpg";
import mountEverest from "@/assets/escape-rooms/mount-everest.jpg";
import barrierReef from "@/assets/escape-rooms/barrier-reef.jpg";
import wildWest from "@/assets/escape-rooms/wild-west.jpg";
import volcanoIsland from "@/assets/escape-rooms/volcano-island.jpg";
import polarIce from "@/assets/escape-rooms/polar-ice.jpg";
import africanSafari from "@/assets/escape-rooms/african-safari.jpg";
import himalayanTemple from "@/assets/escape-rooms/himalayan-temple.jpg";
import rainforestCanopy from "@/assets/escape-rooms/rainforest-canopy.jpg";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Room {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  theme: string;
  price: number;
  duration_minutes: number;
  max_players: number;
  room_type: string;
  total_plays: number;
  rating: number;
  thumbnail_url: string | null;
}

interface RoomGalleryProps {
  onSelectRoom: (roomId: string) => void;
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-700 dark:text-green-300",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  hard: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  expert: "bg-red-500/20 text-red-700 dark:text-red-300"
};

const themeIcons = {
  horror: "👻",
  mystery: "🔍",
  "sci-fi": "🚀",
  adventure: "🗺️",
  fantasy: "🧙‍♂️",
  educational: "📚",
  corporate: "💼"
};

const roomImages: Record<string, string> = {
  "The Haunted Manor": hauntedManor, "Mars Colony Mystery": marsColony, "Detective's Office": detectiveOffice,
  "Dragon's Lair": dragonLair, "Jungle Expedition": jungleExpedition, "Math Challenge": mathChallenge,
  "Corporate Team Builder": corporateTeam, "Vampire Castle Nightmare": vampireCastle, "Cyberpunk Heist 2077": cyberpunkHeist,
  "Sherlock's Study": sherlockStudy, "Wizard's Tower": wizardTower, "Pirate Treasure Hunt": pirateTreasure,
  "Space Station Crisis": spaceStation, "Haunted Asylum": hauntedAsylum, "Ancient Egyptian Tomb": egyptianTomb,
  "Time Paradox Lab": timeParadox, "Murder at the Manor": murderManor, "Zombie Apocalypse Shelter": zombieShelter,
  "Dragon Mountain Quest": dragonMountain, "Submarine Emergency": submarineEmergency, "Witch's Cottage": witchCottage,
  "Bank Heist Masterplan": bankHeist, "Science Lab Outbreak": scienceLab, "Corporate Espionage": corporateEspionage,
  "Arctic Research Station": arcticStation, "Forbidden Library": forbiddenLibrary, "Casino Royale Heist": casinoHeist,
  "Alien Mothership Escape": alienMothership, "Android Revolution": androidRevolution, "Quantum Laboratory": quantumLab,
  "Starship Bridge Crisis": starshipBridge, "Cryogenic Awakening": cryogenicAwakening, "Neural Network Hack": neuralNetwork,
  "Terraforming Station": terraformingStation, "Deep Space Mining": deepSpaceMining, "Virtual Reality Prison": vrPrison,
  "Robot Factory Lockdown": robotFactory, "Cursed Carnival": cursedCarnival, "Abandoned Laboratory": abandonedLab,
  "Witch Hunt 1692": witchHunt, "Demonic Possession": demonicPossession, "Serial Killer Basement": serialKiller,
  "Ghost Ship": ghostShip, "Plague Doctor Nightmare": plagueDoctor, "Doll Factory": dollFactory,
  "Underground Catacombs": catacombs, "Slaughterhouse Secrets": slaughterhouse, "Art Gallery Heist": artGallery,
  "Cold Case Files": coldCase, "Spy Academy Final Exam": spyAcademy, "Luxury Train Mystery": luxuryTrain,
  "Secret Society Initiation": secretSociety, "Jewel Thief Challenge": jewelThief, "FBI Evidence Room": fbiEvidence,
  "Political Scandal": politicalScandal, "Casino Card Counting": cardCounting, "Insurance Fraud Investigation": insuranceFraud,
  "Unicorn Sanctuary": unicornSanctuary, "Dark Sorcerer Tower": darkSorcerer, "Fairy Tale Castle": fairytaleCastle,
  "Atlantis Rising": atlantisRising, "Phoenix Rebirth": phoenixRebirth, "Goblin Market": goblinMarket,
  "Mermaid Kingdom": mermaidKingdom, "Centaur Prophecy": centaurProphecy, "Crystal Caverns": crystalCaverns,
  "Vampire Council": vampireCouncil, "Amazon Jungle Expedition": amazonJungle, "Sahara Desert Survival": saharaDesert,
  "Mount Everest Climb": mountEverest, "Great Barrier Reef": barrierReef, "Wild West Shootout": wildWest,
  "Volcano Island": volcanoIsland, "Polar Ice Expedition": polarIce, "African Safari": africanSafari,
  "Himalayan Temple": himalayanTemple, "Rainforest Canopy": rainforestCanopy
};

const RoomGallery = ({ onSelectRoom }: RoomGalleryProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, [selectedTheme]);

  const fetchRooms = async () => {
    try {
      let query = supabase
        .from("escape_rooms")
        .select("*")
        .eq("is_published", true)
        .order("total_plays", { ascending: false });

      if (selectedTheme !== "all") {
        query = query.eq("theme", selectedTheme);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load escape rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRoom = async (roomId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to play escape rooms",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-escape-room-checkout', {
        body: { roomId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Room Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        <Button
          variant={selectedTheme === "all" ? "default" : "outline"}
          onClick={() => setSelectedTheme("all")}
          className="h-12"
        >
          🎯 All Themes
        </Button>
        {Object.keys(themeIcons).map((theme) => (
          <Button
            key={theme}
            variant={selectedTheme === theme ? "default" : "outline"}
            onClick={() => setSelectedTheme(theme)}
            className="h-12 capitalize"
          >
            {themeIcons[theme as keyof typeof themeIcons]} {theme}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No rooms available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-all overflow-hidden">
              {roomImages[room.title] && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={roomImages[room.title]} 
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={difficultyColors[room.difficulty as keyof typeof difficultyColors]}>
                      {room.difficulty}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{themeIcons[room.theme as keyof typeof themeIcons]}</span>
                  {room.title}
                </CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {room.duration_minutes}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {room.max_players}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    {room.rating.toFixed(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold">€10</span>
                  </div>
                  <Button onClick={() => handlePlayRoom(room.id)}>
                    Buy & Play
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  {room.total_plays} plays • {room.room_type}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default RoomGallery;
