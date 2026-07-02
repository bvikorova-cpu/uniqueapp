import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      toast.info("🎨 Generating 360° panorama...", {
        description: `Creating image for ${room.room_name}`,
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
          toast.error("Rate limit exceeded", {
            description: "Too many requests. Try again later."
          });
        } else if (data.error.includes('Payment required')) {
          toast.error("Credits required", {
            description: "Add credits to Lovable workspace."
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      // Update room with new panorama URL
      const { error: updateError } = await supabase
        .from('fairy_castle_rooms')
        .update({ panorama_url: data.imageUrl })
        .eq('id', room.id);

      if (updateError) throw updateError;

      toast.success("✨ Panorama generated!", {
        description: `${room.room_name} now has AI 360° image`,
      });

      onRoomUpdated();

    } catch (error) {
      console.error('Error generating panorama:', error);
      toast.error("Error generating", {
        description: error instanceof Error ? error.message : "Unknown error"
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
    <>
      <FloatingHowItWorks title={"Castle Panorama Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Panorama Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Panorama Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-disney-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-disney-accent" />
          AI 360° Panorama Generator
        </CardTitle>
        <CardDescription>
          Generate realistic panoramic images for rooms using OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">
              {castle.name} ({castle.park_name})
            </p>
            <p className="text-xs text-muted-foreground">
              {roomsNeedingPanoramas} of {rooms.length} rooms need panorama
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate All
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
                      Generating
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {hasCustomPanorama ? "Regenerate" : "Generate"}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium">💡 Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Uses OpenAI for image generation</li>
            <li>Images are automatically uploaded to Supabase Storage</li>
            <li>May take 10-30 seconds per image</li>
            <li>Watch for rate limits - 2s pause between requests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
