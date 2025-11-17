import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ARTISTS = [
  "Freddie Mercury",
  "Elvis Presley", 
  "Michael Jackson",
  "Whitney Houston",
  "David Bowie",
  "Amy Winehouse",
  "Prince",
  "Kurt Cobain",
  "Jim Morrison",
  "Janis Joplin",
  "Bob Marley",
  "John Lennon",
  "Tupac Shakur",
  "The Notorious B.I.G.",
  "Frank Sinatra",
  "Aretha Franklin",
  "Jimi Hendrix",
  "Johnny Cash"
];

const GenerateArtistImages = () => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentArtist, setCurrentArtist] = useState("");
  const { toast } = useToast();

  const generateAllImages = async () => {
    setGenerating(true);
    setProgress(0);

    for (let i = 0; i < ARTISTS.length; i++) {
      const artist = ARTISTS[i];
      setCurrentArtist(artist);
      
      try {
        // Generate image
        const { data, error } = await supabase.functions.invoke('generate-artist-image', {
          body: { artistName: artist }
        });

        if (error) throw error;

        if (data?.imageUrl) {
          // Update database with generated image
          const { error: updateError } = await supabase
            .from('holographic_concerts')
            .update({ thumbnail_url: data.imageUrl })
            .eq('artist_name', artist);

          if (updateError) throw updateError;

          console.log(`✓ Generated image for ${artist}`);
        }

        setProgress(((i + 1) / ARTISTS.length) * 100);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error generating image for ${artist}:`, error);
        toast({
          title: `Failed to generate ${artist}`,
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    }

    setGenerating(false);
    setCurrentArtist("");
    toast({
      title: "✨ All Artist Images Generated!",
      description: "All legendary artist portraits have been created",
    });
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Generate Artist Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate AI portraits for all {ARTISTS.length} legendary artists
        </p>
        
        {generating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-400">Generating {currentArtist}...</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={generateAllImages}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate All Images
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GenerateArtistImages;
