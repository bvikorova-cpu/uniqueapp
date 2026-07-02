import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
          title: "Image generated",
          description: "Thumbnail was successfully generated and downloaded.",
        });
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to generate thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Video Thumbnail Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Thumbnail Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Thumbnail Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button
      onClick={generateThumbnail}
      disabled={isGenerating}
      size="sm"
      variant="outline"
      className="mt-2"
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate image"}
    </Button>
    </>
  );
};
