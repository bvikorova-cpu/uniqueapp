import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, Wand2, Image as ImageIcon } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PhotoRestoration = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [restoredUrl, setRestoredUrl] = useState<string>("");
  const [restorationType, setRestorationType] = useState<'colorize' | 'repair' | 'enhance'>('colorize');
  
  const { credits, isLoading, restorePhoto, isRestoring } = usePhotoCredits();

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
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl font-bold mb-4">AI Photo Restoration</h1>
          <p className="text-muted-foreground text-lg">
            Bring your old memories back to life with artificial intelligence
          </p>
          <div className="mt-4 inline-block px-6 py-2 bg-primary/10 rounded-full">
            <p className="text-sm">
              Available credits: <span className="font-bold text-primary">{credits?.credits_remaining || 0}</span>
            </p>
          </div>
        </div>

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
                <p className="text-3xl font-bold text-primary mb-4">$10</p>
                <Button variant="outline" className="w-full">Buy Now</Button>
              </div>
              <div className="border-2 border-primary rounded-lg p-4 text-center">
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">
                  MOST POPULAR
                </div>
                <p className="text-2xl font-bold mb-2">20 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">$30</p>
                <Button className="w-full">Buy Now</Button>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold mb-2">50 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">$60</p>
                <Button variant="outline" className="w-full">Buy Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoRestoration;
