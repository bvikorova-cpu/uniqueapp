import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface Room {
  id: string;
  room_name: string;
  description: string | null;
  panorama_url: string;
}

interface Castle {
  id: string;
  name: string;
  park_name: string;
}

interface CastlePanoramaGeneratorProps {
  castle: Castle;
  rooms: Room[];
  onRoomUpdated: () => void;
}

export const CastlePanoramaGenerator = ({ castle, rooms, onRoomUpdated }: CastlePanoramaGeneratorProps) => {
  const [generatingRoomId, setGeneratingRoomId] = useState<string | null>(null);

  const generatePanorama = async (room: Room) => {
    setGeneratingRoomId(room.id);
    
    try {
      toast.info("🎨 Generujem 360° panorámu...", {
        description: `Vytváranie obrazu pre ${room.room_name}`,
      });

      const { data, error } = await supabase.functions.invoke('generate-castle-panorama', {
        body: {
          roomName: room.room_name,
          castleName: `${castle.name} (${castle.park_name})`,
          description: room.description,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error("Limit prekročený", {
            description: "Príliš veľa požiadaviek. Skúste neskôr."
          });
        } else if (data.error.includes('Payment required')) {
          toast.error("Potrebné kredity", {
            description: "Pridajte kredity do Lovable workspace."
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      // Update room with new panorama URL
      const { error: updateError } = await supabase
        .from('disney_castle_rooms')
        .update({ panorama_url: data.imageUrl })
        .eq('id', room.id);

      if (updateError) throw updateError;

      toast.success("✨ Panoráma vygenerovaná!", {
        description: `${room.room_name} má teraz AI 360° obraz`,
      });

      onRoomUpdated();

    } catch (error) {
      console.error('Error generating panorama:', error);
      toast.error("Chyba pri generovaní", {
        description: error instanceof Error ? error.message : "Neznáma chyba"
      });
    } finally {
      setGeneratingRoomId(null);
    }
  };

  const generateAllPanoramas = async () => {
    for (const room of rooms) {
      if (!room.panorama_url || room.panorama_url === '/placeholder.svg') {
        await generatePanorama(room);
        // Wait 2 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const roomsNeedingPanoramas = rooms.filter(
    r => !r.panorama_url || r.panorama_url === '/placeholder.svg'
  ).length;

  return (
    <Card className="border-disney-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-disney-accent" />
          AI Generátor 360° Panorám
        </CardTitle>
        <CardDescription>
          Vygenerujte realistické panoramatické obrázky pre miestnosti pomocou Lovable AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">
              {castle.name} ({castle.park_name})
            </p>
            <p className="text-xs text-muted-foreground">
              {roomsNeedingPanoramas} z {rooms.length} miestností potrebuje panorámu
            </p>
          </div>
          {roomsNeedingPanoramas > 0 && (
            <Button
              onClick={generateAllPanoramas}
              disabled={generatingRoomId !== null}
              variant="outline"
              size="sm"
            >
              {generatingRoomId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generujem...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generovať všetky
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {rooms.map((room) => {
            const hasCustomPanorama = room.panorama_url && !room.panorama_url.includes('placeholder');
            const isGenerating = generatingRoomId === room.id;

            return (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {hasCustomPanorama ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-dashed border-muted-foreground rounded-full shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{room.room_name}</p>
                    {room.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {room.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => generatePanorama(room)}
                  disabled={isGenerating || generatingRoomId !== null}
                  size="sm"
                  variant={hasCustomPanorama ? "outline" : "default"}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generujem
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {hasCustomPanorama ? "Regenerovať" : "Generovať"}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium">💡 Poznámky:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Používa Lovable AI (Google Gemini Flash Image)</li>
            <li>Obrázky sú automaticky nahrané do Supabase Storage</li>
            <li>Môže trvať 10-30 sekúnd na jeden obrázok</li>
            <li>Pozor na rate limits - medzi požiadavkami je 2s pauza</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
