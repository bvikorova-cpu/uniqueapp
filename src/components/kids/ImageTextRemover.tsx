import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import { showImages } from "@/components/kids/ShowImages";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ImageInfo {
  name: string;
  url: string;
  processed: boolean;
  newUrl?: string;
}

// Helper function to convert image URL to base64
const imageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const ImageTextRemover = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<ImageInfo[]>([]);

  const processImages = async () => {
    setProcessing(true);
    setProgress(0);

    // List of all show images that need processing
    const imageUrls = [
      { name: "Alice in Wonderland", url: showImages.alice },
      { name: "Aladdin", url: showImages.aladdin },
      { name: "Beauty and the Beast", url: showImages.beautyandthebeast },
      { name: "Moana", url: showImages.moana },
      { name: "Tangled", url: showImages.tangled },
      { name: "Little Mermaid", url: showImages.thelittlemermaid },
      { name: "Toy Story", url: showImages.toystory },
      { name: "Finding Nemo", url: showImages.findingnemo },
      { name: "Incredibles", url: showImages.theincredibles },
      { name: "Cars", url: showImages.cars },
      { name: "Encanto", url: showImages.encanto },
      { name: "Coco", url: showImages.coco },
      { name: "Inside Out", url: showImages.insideout },
      { name: "Mulan", url: showImages.mulan },
      { name: "Zootopia", url: showImages.zootopia },
      { name: "Frozen", url: showImages.frozen },
      { name: "Lion King", url: showImages.lionking },
    ];

    const processedImages: ImageInfo[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageInfo = imageUrls[i];
      try {
        console.log(`Processing ${imageInfo.name}...`);

        // Convert image to base64 first
        const base64Image = await imageUrlToBase64(imageInfo.url);

        const { data, error } = await supabase.functions.invoke("remove-text-from-image", {
          body: { imageUrl: base64Image },
        });

        if (error) throw error;

        processedImages.push({
          name: imageInfo.name,
          url: imageInfo.url,
          processed: true,
          newUrl: data.editedImageUrl,
        });

        toast({
          title: "Success",
          description: `Processed ${imageInfo.name}`,
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${imageInfo.name}:`, error);
        processedImages.push({
          name: imageInfo.name,
          url: imageInfo.url,
          processed: false,
        });
        toast({
          title: "Error",
          description: `Failed to process ${imageInfo.name}`,
          variant: "destructive",
        });
      }

      setProgress(((i + 1) / imageUrls.length) * 100);
      setImages([...processedImages]);
    }

    setImages(processedImages);
    setProcessing(false);
    toast({
      title: "Complete",
      description: "All images processed!",
    });
  };

  const downloadImage = (base64Data: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `${fileName}-no-text.jpg`;
    link.click();
  };

  return (
    <>
      <FloatingHowItWorks title={"Image Text Remover - How it works"} steps={[{ title: 'Open', desc: 'Access the Image Text Remover section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Image Text Remover.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
