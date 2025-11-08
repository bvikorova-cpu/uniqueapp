import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Award, Map } from "lucide-react";
import { DisneyPanoramaViewer } from "@/components/disney/DisneyPanoramaViewer";
import { CastleRoomMiniMap } from "@/components/disney/CastleRoomMiniMap";
import { useCastleRooms, useStartTour, useCompleteRoom, useEarnStamp } from "@/hooks/useDisneyCastles";
import { useRoomCollectibles, useCollectDisneyItem, useUserDisneyCollectibles } from "@/hooks/useCollectibles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DisneyCastleTour() {
  const { castleId } = useParams<{ castleId: string }>();
  const navigate = useNavigate();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [showFunFacts, setShowFunFacts] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);

  const { rooms, isLoading: roomsLoading } = useCastleRooms(castleId!);
  const startTour = useStartTour();
  const completeRoom = useCompleteRoom();
  const earnStamp = useEarnStamp();
  
  const currentRoom = rooms?.[currentRoomIndex];
  const { data: roomCollectibles } = useRoomCollectibles(currentRoom?.id || "");
  const { data: userCollectibles } = useUserDisneyCollectibles();
  const collectItem = useCollectDisneyItem();
  const collectedIds = userCollectibles?.map((item: any) => item.collectible_id) || [];

  const { data: castle } = useQuery({
    queryKey: ["castle", castleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disney_castles")
        .select("*")
        .eq("id", castleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!castleId,
  });

  const { data: visit } = useQuery({
    queryKey: ["castle-visit", castleId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_castle_visits")
        .select("*")
        .eq("user_id", user.id)
        .eq("castle_id", castleId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!castleId,
  });

  useEffect(() => {
    if (castle && !visit) {
      startTour.mutate({ castleId: castle.id, price: castle.price_coins });
    }
  }, [castle, visit]);

  const isLastRoom = currentRoomIndex === (rooms?.length || 0) - 1;
  const progress = ((currentRoomIndex + 1) / (rooms?.length || 1)) * 100;

  const handleNext = () => {
    setIsFading(true);
    
    setTimeout(() => {
      if (currentRoom && visit) {
        completeRoom.mutate({ visitId: visit.id, roomId: currentRoom.id });
      }

      if (isLastRoom) {
        // Award stamp on completion
        if (castleId) {
          earnStamp.mutate({ castleId });
        }
        navigate("/kids-channel/disney-castles");
      } else {
        setCurrentRoomIndex(prev => prev + 1);
        setTimeout(() => setIsFading(false), 50);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentRoomIndex > 0) {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentRoomIndex(prev => prev - 1);
        setTimeout(() => setIsFading(false), 50);
      }, 300);
    }
  };

  const handleRoomSelect = (index: number) => {
    if (index === currentRoomIndex) return;
    
    setIsFading(true);
    setTimeout(() => {
      setCurrentRoomIndex(index);
      setTimeout(() => setIsFading(false), 50);
    }, 300);
  };

  const visitedRoomIds = visit?.rooms_visited || [];

  if (roomsLoading || !castle || !currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading magical tour...</p>
        </div>
      </div>
    );
  }

  // Panorama image based on castle
  const getPanoramaUrl = () => {
    if (!castle || !currentRoom) return "/placeholder.svg";
    
    // Import and use the actual panorama image
    return currentRoom.panorama_url;
  };

  // Ambient sound mapping based on room type
  const getAmbientSound = () => {
    if (!currentRoom) return undefined;
    
    const roomName = currentRoom.room_name.toLowerCase();
    
    // Map room types to ambient sounds
    if (roomName.includes('garden') || roomName.includes('enchanted')) {
      // Birds chirping, gentle breeze
      return 'https://cdn.pixabay.com/audio/2022/03/10/audio_d1718abf88.mp3';
    }
    if (roomName.includes('library') || roomName.includes('book')) {
      // Crackling fireplace
      return 'https://cdn.pixabay.com/audio/2022/03/24/audio_c2eb9cb63b.mp3';
    }
    if (roomName.includes('cave') || roomName.includes('dragon')) {
      // Mysterious cave ambience
      return 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';
    }
    if (roomName.includes('chapel') || roomName.includes('royal')) {
      // Soft choir/church bells
      return 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3';
    }
    if (roomName.includes('ballroom') || roomName.includes('dance')) {
      // Soft orchestral music
      return 'https://cdn.pixabay.com/audio/2022/03/15/audio_21599d6316.mp3';
    }
    if (roomName.includes('gallery') || roomName.includes('hall')) {
      // Gentle magical ambience
      return 'https://cdn.pixabay.com/audio/2022/11/22/audio_a0c0b3d30f.mp3';
    }
    if (roomName.includes('tower')) {
      // Wind sounds
      return 'https://cdn.pixabay.com/audio/2022/03/12/audio_4019d3ca55.mp3';
    }
    
    // Default magical ambience
    return 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe5c87c.mp3';
  };

  const panoramaUrl = getPanoramaUrl();
  const ambientSound = getAmbientSound();

  const handleCollectItem = (collectibleId: string) => {
    if (castleId && currentRoom) {
      collectItem.mutate({
        collectibleId,
        castleId,
        roomId: currentRoom.id,
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel/disney-castles")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Tour
            </Button>
            <div className="text-white">
              <h2 className="font-bold text-xl">{castle.name}</h2>
              <p className="text-sm opacity-80">{currentRoom.room_name}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowMiniMap(true)}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm text-white border-white/30"
            >
              <Map className="mr-2 h-4 w-4" />
              Map
            </Button>
            <Button
              onClick={() => setShowFunFacts(!showFunFacts)}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm text-white border-white/30"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Fun Facts
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-sm mt-1">
            Room {currentRoomIndex + 1} of {rooms?.length}
          </p>
        </div>
      </div>

      {/* Panorama Viewer */}
      <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <DisneyPanoramaViewer
          imageUrl={panoramaUrl}
          audioGuideText={currentRoom.audio_guide_text || ""}
          ambientSound={ambientSound}
          collectibles={roomCollectibles || []}
          onCollectItem={handleCollectItem}
          collectedIds={collectedIds}
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        {currentRoomIndex > 0 && (
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="bg-white/90 hover:bg-white"
          >
            Previous Room
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          {isLastRoom ? (
            <>
              <Award className="mr-2 h-5 w-5" />
              Complete Tour
            </>
          ) : (
            "Next Room →"
          )}
        </Button>
      </div>

      {/* Fun Facts Panel */}
      {showFunFacts && castle.fun_facts && (
        <Card className="absolute top-20 right-6 p-6 max-w-md bg-white/95 backdrop-blur-sm z-10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Did You Know?
          </h3>
          <ul className="space-y-3">
            {castle.fun_facts.map((fact: string, index: number) => (
              <li key={index} className="text-sm flex gap-2">
                <span className="text-yellow-500">✨</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Mini Map */}
      <CastleRoomMiniMap
        rooms={rooms || []}
        currentRoomIndex={currentRoomIndex}
        visitedRoomIds={visitedRoomIds}
        onRoomSelect={handleRoomSelect}
        isVisible={showMiniMap}
        onClose={() => setShowMiniMap(false)}
      />
    </div>
  );
}
