import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Award } from "lucide-react";
import { PanoramaViewer } from "@/components/disney/PanoramaViewer";
import { useCastleRooms, useStartTour, useCompleteRoom, useEarnStamp } from "@/hooks/useDisneyCastles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DisneyCastleTour() {
  const { castleId } = useParams<{ castleId: string }>();
  const navigate = useNavigate();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [showFunFacts, setShowFunFacts] = useState(false);

  const { rooms, isLoading: roomsLoading } = useCastleRooms(castleId!);
  const startTour = useStartTour();
  const completeRoom = useCompleteRoom();
  const earnStamp = useEarnStamp();

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

  const currentRoom = rooms?.[currentRoomIndex];
  const isLastRoom = currentRoomIndex === (rooms?.length || 0) - 1;
  const progress = ((currentRoomIndex + 1) / (rooms?.length || 1)) * 100;

  const handleNext = () => {
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
    }
  };

  const handlePrevious = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(prev => prev - 1);
    }
  };

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

  // Placeholder panorama URL (will be replaced with actual images)
  const panoramaUrl = "/placeholder.svg";

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

          <Button
            onClick={() => setShowFunFacts(!showFunFacts)}
            variant="outline"
            className="bg-white/20 backdrop-blur-sm text-white border-white/30"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Fun Facts
          </Button>
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
      <PanoramaViewer
        imageUrl={panoramaUrl}
        audioGuideText={currentRoom.audio_guide_text || ""}
        hotspots={[
          {
            position: [100, 0, 0],
            label: "Next Room",
            nextRoomId: rooms?.[currentRoomIndex + 1]?.id,
          },
        ]}
        onHotspotClick={(hotspot) => {
          if (hotspot.nextRoomId) {
            handleNext();
          }
        }}
      />

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
    </div>
  );
}
