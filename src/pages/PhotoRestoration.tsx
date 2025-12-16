import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, Wand2, Image as ImageIcon, Info, Star, Zap, CheckCircle } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PhotoRestoration = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [restoredUrl, setRestoredUrl] = useState<string>("");
  const [restorationType, setRestorationType] = useState<'colorize' | 'repair' | 'enhance'>('colorize');
  
  const { credits, isLoading, restorePhoto, isRestoring, purchaseCredits } = usePhotoCredits();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRestoredUrl("");
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }

    try {
      // Upload original photo
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('old-photos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('old-photos')
        .getPublicUrl(fileName);

      // Call restore function
      restorePhoto({ imageUrl: publicUrl, restorationType }, {
        onSuccess: (data) => {
          setRestoredUrl(data.restoredImageUrl);
          toast.success("Photo successfully restored!");
          
          // Save to database
          supabase.from('old_photos').insert({
            user_id: user.id,
            original_url: publicUrl,
            restored_url: data.restoredImageUrl,
            restoration_type: restorationType,
            credits_used: 1
          });
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error("Error uploading photo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">AI Photo Restoration</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Bring your old memories back to life with artificial intelligence
          </p>
          <div className="mt-4 inline-block px-6 py-2 bg-primary/10 rounded-full">
            <p className="text-sm">
              Available credits: <span className="font-bold text-primary">{credits?.credits_remaining || 0}</span>
            </p>
          </div>
        </div>

        <Card className="p-4 sm:p-6 mb-8 bg-gradient-to-r from-purple-500/10 via-primary/10 to-purple-500/10 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is AI Photo Restoration?</h3>
              <p className="text-sm text-muted-foreground">
                AI Photo Restoration uses advanced artificial intelligence to breathe new life into your old, damaged, or faded photographs. Whether you have precious family memories in black and white, photos with scratches and tears, or images that have lost their sharpness over time, our AI can help restore them to their former glory.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                How to Use
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• Choose a restoration type (Colorize, Repair, or Enhance)</li>
                <li>• Upload your old or damaged photo</li>
                <li>• Click "Restore Photo" to process</li>
                <li>• Download your restored image</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Restoration Types
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Colorization: Add realistic colors to B&W photos</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Repair: Remove scratches, tears, and damage</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Enhancement: Improve clarity and sharpness</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Key Features:</strong> AI-powered restoration • Automatic colorization • Scratch and damage removal • Quality enhancement • Download restored photos • All restoration types cost just 1 credit
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${restorationType === 'colorize' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setRestorationType('colorize')}
          >
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Colorization</CardTitle>
              <CardDescription>
                Add colors to black and white photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">1 credit</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${restorationType === 'repair' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setRestorationType('repair')}
          >
            <CardHeader>
              <Wand2 className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Repair</CardTitle>
              <CardDescription>
                Remove scratches and damage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">1 credit</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${restorationType === 'enhance' ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setRestorationType('enhance')}
          >
            <CardHeader>
              <ImageIcon className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Enhancement</CardTitle>
              <CardDescription>
                Improve quality and sharpness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">1 credit</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Original Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Original" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Upload an old photo</p>
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Select Photo</span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}
              </div>
              {selectedFile && (
                <Button 
                  className="w-full mt-4" 
                  onClick={handleRestore}
                  disabled={isRestoring || !credits || credits.credits_remaining < 1}
                >
                  {isRestoring ? "Restoring..." : "Restore Photo"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restored Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {restoredUrl ? (
                  <img src={restoredUrl} alt="Restored" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Restored photo will appear here
                    </p>
                  </div>
                )}
              </div>
              {restoredUrl && (
                <a href={restoredUrl} download>
                  <Button variant="outline" className="w-full mt-4">
                    Download Restored Photo
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need More Credits?</CardTitle>
            <CardDescription>Choose the right package for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold mb-2">5 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€10</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => purchaseCredits(5, 10)}
                >
                  Buy Now
                </Button>
              </div>
              <div className="border-2 border-primary rounded-lg p-4 text-center">
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">
                  MOST POPULAR
                </div>
                <p className="text-2xl font-bold mb-2">20 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€30</p>
                <Button 
                  className="w-full"
                  onClick={() => purchaseCredits(20, 30)}
                >
                  Buy Now
                </Button>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold mb-2">50 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€60</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => purchaseCredits(50, 60)}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoRestoration;
