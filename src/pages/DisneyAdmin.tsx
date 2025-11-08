import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Check, X } from "lucide-react";
import { CastlePanoramaGenerator } from "@/components/disney/CastlePanoramaGenerator";
import { useDisneyCastles, useCastleRooms } from "@/hooks/useDisneyCastles";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DisneyAdmin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCastleId, setSelectedCastleId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const { castles, isLoading: castlesLoading } = useDisneyCastles();
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
        .from('disney_castle_rooms')
        .select(`
          *,
          disney_castles (
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
      toast.error('Nepodarilo sa načítať miestnosti');
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    
    try {
      toast.info('Spúšťam bulk generáciu panorám...', {
        description: 'Vygenerujem všetky chýbajúce panorámy pre všetky zámky'
      });

      const { data, error } = await supabase.functions.invoke('bulk-generate-panoramas');
      
      if (error) {
        throw error;
      }

      toast.success('Bulk generácia spustená!', {
        description: `Spracúvam ${data.total_rooms} miestností. Odhadovaný čas: ${data.estimated_time_minutes} minút. Skontroluj edge function logs pre progress.`
      });
    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error('Nepodarilo sa spustiť bulk generáciu', {
        description: error instanceof Error ? error.message : 'Neznáma chyba'
      });
    } finally {
      setIsBulkGenerating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Kontrolujem prístup...</p>
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
            onClick={() => navigate("/kids-channel/disney-castles")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na zámky
          </Button>
          <h1 className="text-3xl font-bold">Disney Zámky - Admin</h1>
        </div>

        {!selectedCastleId ? (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-2">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Bulk Generácia Panorám
              </h2>
              <p className="text-muted-foreground mb-4">
                Vygeneruj všetky chýbajúce panorámy pre všetky zámky naraz. Tento proces beží na pozadí a môže trvať 30+ minút v závislosti od počtu miestností.
              </p>
              <Button
                onClick={handleBulkGenerate}
                disabled={isBulkGenerating}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isBulkGenerating ? 'Spúšťam...' : 'Generovať všetky panorámy'}
              </Button>
            </Card>

            <h2 className="text-xl font-semibold mb-4">Prehľad zámkov a miestností</h2>
            {castlesLoading || roomsLoading ? (
              <p>Načítavam zámky...</p>
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
                              {roomsWithPanoramas.length} / {totalRooms} miestností má panorámu
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCastleId(castle.id)}
                        >
                          Generovať panorámy
                        </Button>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold text-sm mb-2">Miestnosti:</h4>
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
                                {room.panorama_url ? "Hotové" : "Chýba"}
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
              Späť na výber zámku
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

export default DisneyAdmin;
