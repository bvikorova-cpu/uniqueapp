import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

interface ImageInfo {
  name: string;
  url: string;
  processed: boolean;
  newUrl?: string;
}

export const ImageTextRemover = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<ImageInfo[]>([]);

  const processImages = async () => {
    setProcessing(true);
    setProgress(0);

    // List of all show images that need processing
    const imageUrls = [
      { name: "Alice in Wonderland", url: "/src/assets/kids/alice-show.jpg" },
      { name: "Aladdin", url: "/src/assets/kids-shows/aladdin-cute.jpg" },
      { name: "Beauty and the Beast", url: "/src/assets/kids-shows/beauty-beast-cute.jpg" },
      { name: "Moana", url: "/src/assets/kids-shows/moana-cute.jpg" },
      { name: "Tangled", url: "/src/assets/kids-shows/tangled-cute.jpg" },
      { name: "Little Mermaid", url: "/src/assets/kids-shows/little-mermaid-cute.jpg" },
      { name: "Toy Story", url: "/src/assets/kids-shows/toy-story-cute.jpg" },
      { name: "Finding Nemo", url: "/src/assets/kids-shows/finding-nemo-cute.jpg" },
      { name: "Incredibles", url: "/src/assets/kids-shows/incredibles-cute.jpg" },
      { name: "Cars", url: "/src/assets/kids-shows/cars-cute.jpg" },
      { name: "Encanto", url: "/src/assets/kids-shows/encanto-cute.jpg" },
      { name: "Coco", url: "/src/assets/kids-shows/coco-cute.jpg" },
      { name: "Inside Out", url: "/src/assets/kids-shows/inside-out-cute.jpg" },
      { name: "Mulan", url: "/src/assets/kids-shows/mulan-cute.jpg" },
      { name: "Zootopia", url: "/src/assets/kids-shows/zootopia-cute.jpg" },
      { name: "Frozen", url: "/src/assets/kids-shows/frozen-cute.jpg" },
      { name: "Lion King", url: "/src/assets/kids-shows/lion-king-cute.jpg" },
    ];

    const processedImages: ImageInfo[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageInfo = imageUrls[i];
      try {
        console.log(`Processing ${imageInfo.name}...`);

        // Convert local path to full URL for the edge function
        const fullUrl = `${window.location.origin}${imageInfo.url}`;

        const { data, error } = await supabase.functions.invoke("remove-text-from-image", {
          body: { imageUrl: fullUrl },
        });

        if (error) throw error;

        processedImages.push({
          name: imageInfo.name,
          url: imageInfo.url,
          processed: true,
          newUrl: data.editedImageUrl,
        });

        toast.success(`Processed ${imageInfo.name}`);
      } catch (error) {
        console.error(`Error processing ${imageInfo.name}:`, error);
        processedImages.push({
          name: imageInfo.name,
          url: imageInfo.url,
          processed: false,
        });
        toast.error(`Failed to process ${imageInfo.name}`);
      }

      setProgress(((i + 1) / imageUrls.length) * 100);
    }

    setImages(processedImages);
    setProcessing(false);
    toast.success("All images processed!");
  };

  const downloadImage = (base64Data: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `${fileName}-no-text.jpg`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Remove Text from Images</h2>
        <p className="text-muted-foreground mb-6">
          This tool will process all show images and remove any text or titles from them using AI.
        </p>

        <Button
          onClick={processImages}
          disabled={processing}
          className="mb-6"
        >
          {processing ? "Processing..." : "Start Processing"}
        </Button>

        {processing && (
          <div className="mb-6">
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.name} className="p-4">
                <h3 className="font-semibold mb-2">{image.name}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Original</p>
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  {image.newUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Processed</p>
                      <img
                        src={image.newUrl}
                        alt={`${image.name} processed`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => downloadImage(image.newUrl!, image.name)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                  {!image.processed && images.length > 0 && (
                    <p className="text-xs text-red-500">Failed to process</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
