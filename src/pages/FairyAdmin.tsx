import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Check, X } from "lucide-react";
import { CastlePanoramaGenerator } from "@/components/fairy-castles/CastlePanoramaGenerator";
import { useFairyCastles, useCastleRooms } from "@/hooks/useFairyCastles";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const FairyAdmin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCastleId, setSelectedCastleId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const { castles, isLoading: castlesLoading } = useFairyCastles();
  const { rooms, isLoading: selectedRoomsLoading } = useCastleRooms(selectedCastleId || "");

  useEffect(() => {
    if (castles && castles.length > 0) {
      loadAllRooms();
    }
  }, [castles]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    // Simple admin check - you can enhance this with proper role-based access
    setIsAdmin(true);
  };

  const loadAllRooms = async () => {
    setRoomsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fairy_castle_rooms')
        .select(`
          *,
          fairy_castles (
            name,
            park_name
          )
        `)
        .order('castle_id')
        .order('order_index');

      if (error) throw error;
      setAllRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    
    try {
      toast.info('Starting bulk panorama generation...', {
        description: 'Generating all missing panoramas for all castles'
      });

      const { data, error } = await supabase.functions.invoke('bulk-generate-panoramas');
      
      if (error) {
        throw error;
      }

      toast.success('Bulk generation started!', {
        description: `Processing ${data.total_rooms} rooms. Estimated time: ${data.estimated_time_minutes} minutes. Check edge function logs for progress.`
      });
    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error('Failed to start bulk generation', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsBulkGenerating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking access...</p>
      </div>
    );
  }

  const selectedCastle = castles?.find(c => c.id === selectedCastleId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-disney-primary/5 to-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel/fairy-castles")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to castles
          </Button>
          <h1 className="text-3xl font-bold">Fairy Castles - Admin</h1>
        </div>

        {!selectedCastleId ? (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-2">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Bulk Panorama Generation
              </h2>
              <p className="text-muted-foreground mb-4">
                Generate all missing panoramas for all castles at once. This process runs in the background and may take 30+ minutes depending on the number of rooms.
              </p>
              <Button
                onClick={handleBulkGenerate}
                disabled={isBulkGenerating}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isBulkGenerating ? 'Starting...' : 'Generate all panoramas'}
              </Button>
            </Card>

            <h2 className="text-xl font-semibold mb-4">Castle and Room Overview</h2>
            {castlesLoading || roomsLoading ? (
              <p>Loading castles...</p>
            ) : (
              <div className="space-y-6">
                {castles?.map((castle) => {
                  const castleRooms = allRooms.filter(r => r.castle_id === castle.id);
                  const roomsWithPanoramas = castleRooms.filter(r => r.panorama_url);
                  const totalRooms = castleRooms.length;

                  return (
                    <Card key={castle.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{castle.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{castle.park_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={roomsWithPanoramas.length === totalRooms ? "default" : "secondary"}>
                              {roomsWithPanoramas.length} / {totalRooms} rooms have panorama
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCastleId(castle.id)}
                        >
                          Generate panoramas
                        </Button>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold text-sm mb-2">Rooms:</h4>
                        <div className="grid gap-2">
                          {castleRooms.map((room) => (
                            <div
                              key={room.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {room.panorama_url ? (
                                  <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                  <X className="w-5 h-5 text-red-500" />
                                )}
                                <div>
                                  <p className="font-medium">{room.room_name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {room.description}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={room.panorama_url ? "default" : "outline"}>
                                {room.panorama_url ? "Done" : "Missing"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCastleId(null)}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to castle selection
            </Button>

            {selectedCastle && rooms && (
              <CastlePanoramaGenerator
                castle={selectedCastle}
                rooms={rooms}
                onRoomUpdated={() => {
                  // Refresh rooms
                  window.location.reload();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FairyAdmin;
