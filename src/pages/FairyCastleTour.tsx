import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Award, Map, TrendingUp, BookOpen } from "lucide-react";
import { FairyPanoramaViewer } from "@/components/fairy-castles/FairyPanoramaViewer";
import { CastleRoomMiniMap } from "@/components/fairy-castles/CastleRoomMiniMap";
import { CastleProgressTracker } from "@/components/fairy-castles/CastleProgressTracker";
import { CastleCertificate } from "@/components/fairy-castles/CastleCertificate";
import { CastleQuiz } from "@/components/fairy-castles/CastleQuiz";
import { TourOnboarding, type TourGuideId } from "@/components/fairy-castles/TourOnboarding";
import { useQuery } from "@tanstack/react-query";
import { useCastleRooms, useStartTour, useCompleteRoom, useEarnStamp, useUserStamps } from "@/hooks/useFairyCastles";
import { useRoomCollectibles, useCollectDisneyItem, useUserDisneyCollectibles } from "@/hooks/useCollectibles";
import { useSaveCertificate } from "@/hooks/useCertificates";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function FairyCastleTour() {
  const { castleId } = useParams<{ castleId: string }>();
  const navigate = useNavigate();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [showFunFacts, setShowFunFacts] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [tourStartTime] = useState(Date.now());
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<TourGuideId>("explorer");

  const { rooms, isLoading: roomsLoading } = useCastleRooms(castleId!);
  const startTour = useStartTour();
  const completeRoom = useCompleteRoom();
  const earnStamp = useEarnStamp();
  const saveCertificate = useSaveCertificate();
  const { stamps: userStamps } = useUserStamps();
  const hasStamp = !!userStamps?.some((s: any) => s.castle_id === castleId);

  const currentRoom = rooms?.[currentRoomIndex];
  const { data: roomCollectibles } = useRoomCollectibles(currentRoom?.id || "");
  const { data: userCollectibles } = useUserDisneyCollectibles();
  const collectItem = useCollectDisneyItem();
  const collectedIds = userCollectibles?.map((item: any) => item.collectible_id) || [];

  const { data: castle } = useQuery({
    queryKey: ["castle", castleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fairy_castles")
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
    if (castle && !visit && tourStarted) {
      startTour.mutate({ castleId: castle.id, price: castle.price_coins });
    }
  }, [castle, visit, tourStarted]);

  // If user already visited, skip onboarding and restore last guide
  useEffect(() => {
    if (visit) {
      try {
        const saved = localStorage.getItem('fairy.guide') as TourGuideId | null;
        if (saved === 'princess' || saved === 'wizard' || saved === 'explorer') {
          setSelectedGuide(saved);
        }
      } catch {}
      setShowOnboarding(false);
      setTourStarted(true);
    }
  }, [visit]);

  const isLastRoom = currentRoomIndex === (rooms?.length || 0) - 1;
  const progress = ((currentRoomIndex + 1) / (rooms?.length || 1)) * 100;

  const handleNext = () => {
    setIsFading(true);

    setTimeout(() => {
      // Mark the current room as visited (once) regardless of whether it's last
      if (currentRoom && visit) {
        completeRoom.mutate({ visitId: visit.id, roomId: currentRoom.id });
      }

      if (isLastRoom) {
        if (castleId) {
          // Only award stamp if not already earned (DB has UNIQUE(user_id, castle_id))
          if (!hasStamp) {
            earnStamp.mutate({ castleId });
          }
          saveCertificate.mutate({
            castleId,
            completionTimeMs: Date.now() - tourStartTime,
            unlockedMilestones,
            totalRooms: rooms?.length || 0,
          });
        }
        // Show quiz before certificate
        setShowQuiz(true);
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

  const handleMilestoneUnlock = (percentage: number) => {
    setUnlockedMilestones((prev) => [...prev, percentage]);
  };

  const visitedRoomIds = visit?.rooms_visited || [];

  if (roomsLoading || !castle || !currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-purple-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            🏰
          </motion.div>
          <p className="text-white/70">Preparing your magical tour...</p>
        </div>
      </div>
    );
  }

  const getPanoramaUrl = () => {
    if (!castle || !currentRoom) return "/placeholder.svg";
    return currentRoom.panorama_url;
  };

  const getAmbientSound = () => {
    if (!currentRoom) return undefined;
    const roomName = currentRoom.room_name.toLowerCase();
    if (roomName.includes('garden') || roomName.includes('enchanted')) return 'https://cdn.pixabay.com/audio/2022/03/10/audio_d1718abf88.mp3';
    if (roomName.includes('library') || roomName.includes('book')) return 'https://cdn.pixabay.com/audio/2022/03/24/audio_c2eb9cb63b.mp3';
    if (roomName.includes('cave') || roomName.includes('dragon')) return 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';
    if (roomName.includes('chapel') || roomName.includes('royal')) return 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3';
    if (roomName.includes('ballroom') || roomName.includes('dance')) return 'https://cdn.pixabay.com/audio/2022/03/15/audio_21599d6316.mp3';
    if (roomName.includes('gallery') || roomName.includes('hall')) return 'https://cdn.pixabay.com/audio/2022/11/22/audio_a0c0b3d30f.mp3';
    if (roomName.includes('tower')) return 'https://cdn.pixabay.com/audio/2022/03/12/audio_4019d3ca55.mp3';
    return 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe5c87c.mp3';
  };

  const panoramaUrl = getPanoramaUrl();
  const ambientSound = getAmbientSound();

  const handleCollectItem = (collectibleId: string) => {
    if (castleId && currentRoom) {
      collectItem.mutate({ collectibleId, castleId, roomId: currentRoom.id });
    }
  };

  const handleStartTour = (guide: TourGuideId) => {
    setSelectedGuide(guide);
    try { localStorage.setItem('fairy.guide', guide); } catch {}
    setShowOnboarding(false);
    setTourStarted(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Tour Onboarding */}
      <TourOnboarding
        castleName={castle.name}
        castleCountry={castle.park_name}
        funFacts={castle.fun_facts || []}
        totalRooms={rooms?.length || 0}
        isVisible={showOnboarding}
        onStart={handleStartTour}
      />

      {/* Header */}
      <div className="absolute top-16 sm:top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/85 to-transparent p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/kids-channel/fairy-castles")}
              className="text-white hover:bg-white/20 px-2 sm:px-3 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
            <div className="text-white min-w-0">
              <h2 className="font-bold text-sm sm:text-xl truncate">{castle.name}</h2>
              <p className="text-xs sm:text-sm opacity-80 truncate">{currentRoom.room_name}</p>
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <Button onClick={() => setShowMiniMap(true)} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 sm:px-3">
              <Map className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Map</span>
            </Button>
            <Button onClick={() => setShowFunFacts(!showFunFacts)} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 sm:px-3">
              <Sparkles className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Facts</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div
            className="h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all"
            onClick={() => setShowProgress(true)}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-white text-sm">Room {currentRoomIndex + 1} of {rooms?.length}</p>
            <button
              onClick={() => setShowProgress(true)}
              className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <TrendingUp className="h-3 w-3" /> Progress
            </button>
          </div>
        </div>
      </div>

      {/* Panorama Viewer */}
      <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <FairyPanoramaViewer
          key={`${castleId}-${currentRoomIndex}-${selectedGuide}`}
          imageUrl={panoramaUrl}
          audioGuideText={currentRoom.audio_guide_text || ""}
          ambientSound={ambientSound}
          roomName={currentRoom.room_name}
          guide={selectedGuide}
          collectibles={roomCollectibles || []}
          onCollectItem={handleCollectItem}
          collectedIds={collectedIds}
        />
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        {currentRoomIndex > 0 && (
          <Button onClick={handlePrevious} variant="outline" className="bg-white/90 hover:bg-white rounded-xl">
            ← Previous
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 rounded-xl shadow-lg"
        >
          {isLastRoom ? (
            <><Award className="mr-2 h-5 w-5" /> Complete Tour</>
          ) : (
            "Next Room →"
          )}
        </Button>
      </div>

      {/* Fun Facts Panel */}
      {showFunFacts && castle.fun_facts && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-24 right-6 z-10"
        >
          <Card className="p-5 max-w-sm bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Did You Know?
            </h3>
            <ul className="space-y-2.5">
              {castle.fun_facts.map((fact: string, index: number) => (
                <li key={index} className="text-sm flex gap-2">
                  <span className="text-amber-500">✨</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
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

      {/* Progress Tracker */}
      <CastleProgressTracker
        currentRoomIndex={currentRoomIndex}
        totalRooms={rooms?.length || 0}
        visitedRoomIds={visitedRoomIds}
        startTime={tourStartTime}
        isVisible={showProgress}
        onClose={() => setShowProgress(false)}
        unlockedMilestones={unlockedMilestones}
        onMilestoneUnlock={handleMilestoneUnlock}
      />

      {/* Quiz after completion */}
      <CastleQuiz
        castleName={castle.name}
        funFacts={castle.fun_facts || []}
        isVisible={showQuiz}
        onComplete={(score) => {
          console.log("Quiz score:", score);
        }}
        onClose={() => {
          setShowQuiz(false);
          setShowCertificate(true);
        }}
      />

      {/* Certificate */}
      <CastleCertificate
        castleName={castle?.name || ""}
        completionTime={Date.now() - tourStartTime}
        unlockedMilestones={unlockedMilestones}
        totalRooms={rooms?.length || 0}
        isVisible={showCertificate}
        onClose={() => {
          setShowCertificate(false);
          navigate("/kids-channel/fairy-castles");
        }}
      />
    </div>
  );
}
