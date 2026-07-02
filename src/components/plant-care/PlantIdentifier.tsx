import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Sparkles, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const { credits, refresh } = useAICredits();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!selectedImage) return;

    if ((credits?.credits_remaining || 0) < 3) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 3 credits to identify a plant.",
        variant: "destructive"
      });
      return;
    }

    setIsIdentifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('beauty-photos')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('beauty-photos')
        .getPublicUrl(fileName);

      // Call AI function
      const { data, error } = await supabase.functions.invoke('identify-plant', {
        body: { imageUrl: publicUrl }
      });

      if (error) throw error;

      setResult(data.identification);
      await refresh();
      
      toast({
        title: "Plant Identified!",
        description: `Identified as ${data.identification.commonName}`,
      });
    } catch (error: any) {
      console.error('Error identifying plant:', error);
      toast({
        title: "Identification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSaveToGarden = async () => {
    if (!result) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('plants')
        .insert({
          user_id: user.id,
          name: result.commonName,
          scientific_name: result.scientificName,
          common_name: result.commonName,
          plant_type: result.plantType,
          image_url: result.image_url,
          identified_from_photo: true,
          care_instructions: result.care_tips
        });

      if (error) throw error;

      toast({
        title: "Plant Saved!",
        description: "Added to your garden collection.",
      });
    } catch (error: any) {
      console.error('Error saving plant:', error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Plant Identifier - How it works"} steps={[{ title: 'Open', desc: 'Access the Plant Identifier section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Plant Identifier.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Camera className="h-6 w-6 text-green-500" />
          Upload Plant Photo
        </h2>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload a photo of your plant
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full"
          />

          <Button
            onClick={handleIdentify}
            disabled={!selectedImage || isIdentifying || (credits?.credits_remaining || 0) < 3}
            className="w-full"
          >
            {isIdentifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Identify Plant (3 credits)
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Credits remaining: {credits?.credits_remaining || 0}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Identification Results</h2>

        {result ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-green-600">{result.commonName}</h3>
              <p className="text-sm italic text-muted-foreground">{result.scientificName}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Plant Type</h4>
              <p className="text-sm">{result.plantType}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Care Instructions</h4>
              <div className="space-y-2 text-sm">
                <p><strong>💧 Watering:</strong> {result.care_tips?.watering}</p>
                <p><strong>☀️ Light:</strong> {result.care_tips?.light}</p>
                <p><strong>🌡️ Temperature:</strong> {result.care_tips?.temperature}</p>
              </div>
            </div>

            {result.additional_info && (
              <div>
                <h4 className="font-semibold mb-2">Interesting Facts</h4>
                <p className="text-sm">{result.additional_info}</p>
              </div>
            )}

            <Button onClick={handleSaveToGarden} className="w-full">
              Save to My Garden
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Leaf className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Upload and identify a plant to see results</p>
          </div>
        )}
      </Card>
    </div>
    </>
  );
};