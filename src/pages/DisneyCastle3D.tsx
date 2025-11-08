import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import { Castle3DViewer } from "@/components/disney/Castle3DViewer";
import { useQuery } from "@tanstack/react-query";
import { useCastleRooms } from "@/hooks/useDisneyCastles";
import { supabase } from "@/integrations/supabase/client";

export default function DisneyCastle3D() {
  const { castleId } = useParams<{ castleId: string }>();
  const navigate = useNavigate();

  const { rooms, isLoading: roomsLoading } = useCastleRooms(castleId!);

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

  if (roomsLoading || !castle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D castle...</p>
        </div>
      </div>
    );
  }

  const roomsWithPanoramas = rooms?.filter(r => r.panorama_url) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-950">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel/disney-castles")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Späť na zámky
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{castle.name}</h1>
              <p className="text-muted-foreground">{castle.park_name}</p>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/kids-channel/disney-castles/${castleId}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Play className="mr-2 h-4 w-4" />
            Štart prehliadky
          </Button>
        </div>

        {/* 3D Viewer */}
        <Card className="p-6 mb-6">
          <Castle3DViewer castleName={castle.name} rooms={roomsWithPanoramas} />
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <h2 className="text-xl font-bold mb-4">Ako používať 3D zámok</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖱️</span>
              <div>
                <p className="font-semibold">Otáčanie</p>
                <p className="text-sm text-muted-foreground">
                  Ťahaj myšou alebo prstom pre otáčanie zámku
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-semibold">Zoom</p>
                <p className="text-sm text-muted-foreground">
                  Použi koliesko myši alebo gesto na zooming
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👆</span>
              <div>
                <p className="font-semibold">Kliknutie</p>
                <p className="text-sm text-muted-foreground">
                  Klikni na farebnú miestnosť pre zobrazenie 360° panorámy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold">Zlaté miestnosti</p>
                <p className="text-sm text-muted-foreground">
                  Pri navedení myšou sa miestnosť zvýrazní zlatou farbou
                </p>
              </div>
            </div>
          </div>

          {roomsWithPanoramas.length < (rooms?.length || 0) && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Niektoré miestnosti ešte nemajú vygenerované panorámy. Zobrazujú sa len miestnosti s panorámami ({roomsWithPanoramas.length}/{rooms?.length}).
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
