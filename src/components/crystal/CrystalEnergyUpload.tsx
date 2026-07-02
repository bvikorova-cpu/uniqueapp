import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function CrystalEnergyUpload() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `crystal-photos/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Photo uploaded successfully!");
      
      // Automatically start analysis
      await analyzeCrystal(publicUrl);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const analyzeCrystal = async (url: string) => {
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to analyze crystals");
        return;
      }

      const response = await supabase.functions.invoke('analyze-crystal-energy', {
        body: { imageUrl: url },
      });

      if (response.error) throw response.error;

      setReading(response.data.reading);
      toast.success("Energy analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze crystal");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Crystal Energy Upload'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Crystal Energy Upload panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Crystal Energy Analysis
          </CardTitle>
          <CardDescription>
            Upload a photo of your crystal to receive an AI-powered energy reading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crystal-photo">Upload Crystal Photo</Label>
            <div className="flex items-center gap-4">
              <Input
                id="crystal-photo"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || analyzing}
                className="flex-1"
              />
              <Button disabled={uploading || analyzing} size="icon" variant="outline">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Uploading photo...</p>}
            {analyzing && <p className="text-sm text-muted-foreground">Analyzing energy patterns...</p>}
          </div>

          {imageUrl && (
            <div className="space-y-4">
              <img
                src={imageUrl}
                alt="Uploaded crystal"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          {reading && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Energy Level</span>
                  <span className="text-2xl font-bold text-primary">{reading.energy_level}%</span>
                </div>
                <Progress value={reading.energy_level} className="h-2" />
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Energy Analysis
                </h4>
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-4 rounded-lg">
                  {reading.energy_analysis}
                </div>
              </div>

              {reading.recommended_crystals && reading.recommended_crystals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommended Crystals</h4>
                  <div className="flex flex-wrap gap-2">
                    {reading.recommended_crystals.map((crystal: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {crystal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
