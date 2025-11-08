import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CastlePanoramaGenerator } from "@/components/disney/CastlePanoramaGenerator";
import { useDisneyCastles, useCastleRooms } from "@/hooks/useDisneyCastles";

const DisneyAdmin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCastleId, setSelectedCastleId] = useState<string | null>(null);
  const { castles, isLoading: castlesLoading } = useDisneyCastles();
  const { rooms, isLoading: roomsLoading } = useCastleRooms(selectedCastleId || "");

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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Vyber zámok</h2>
            {castlesLoading ? (
              <p>Načítavam zámky...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {castles?.map((castle) => (
                  <Button
                    key={castle.id}
                    variant="outline"
                    className="h-auto p-4 justify-start text-left"
                    onClick={() => setSelectedCastleId(castle.id)}
                  >
                    <div>
                      <p className="font-semibold">{castle.name}</p>
                      <p className="text-sm text-muted-foreground">{castle.park_name}</p>
                    </div>
                  </Button>
                ))}
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
