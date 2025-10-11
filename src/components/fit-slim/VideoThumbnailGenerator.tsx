import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoThumbnailGeneratorProps {
  videoTitle: string;
  videoId: number;
  category: "weight-loss" | "health";
}

export const VideoThumbnailGenerator = ({ videoTitle, videoId, category }: VideoThumbnailGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateThumbnail = async () => {
    setIsGenerating(true);
    try {
      console.log('Generating thumbnail for:', videoTitle);

      const { data, error } = await supabase.functions.invoke('generate-video-thumbnail', {
        body: { 
          title: videoTitle,
          category: category === "health" ? "health" : "workout"
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Download the image
        const link = document.createElement('a');
        link.href = data.imageUrl;
        link.download = `${videoTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Obrázok vygenerovaný",
          description: "Thumbnail bol úspešne vygenerovaný a stiahnutý.",
        });
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vygenerovať thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateThumbnail}
      disabled={isGenerating}
      size="sm"
      variant="outline"
      className="mt-2"
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? "Generuje sa..." : "Vygenerovať obrázok"}
    </Button>
  );
};
