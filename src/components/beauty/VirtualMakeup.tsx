import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const VirtualMakeup = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [makeupStyle, setMakeupStyle] = useState("glam");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageUrl(""); // Clear URL if file is selected
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to upload images");
        return null;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('beauty-photos')
        .upload(fileName, imageFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('beauty-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleTransform = async () => {
    let finalImageUrl = imageUrl;

    // If file is selected, upload it first
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) return;
      finalImageUrl = uploadedUrl;
    }

    if (!finalImageUrl) {
      toast.error("Please upload an image or enter URL");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use this feature");
        return;
      }

      const { data, error } = await supabase.functions.invoke('beauty-transformation', {
        body: {
          imageUrl: finalImageUrl,
          transformationType: 'makeup',
          styleApplied: makeupStyle
        }
      });

      if (error) throw error;

      setResult(data.transformedImage);
      refresh();
      toast.success("Makeup applied successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to apply makeup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Virtual Makeup works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-pink-500" />
          Virtual Makeup Try-On
        </h2>
        <p className="text-muted-foreground mb-6">
          Upload a selfie and AI will apply different makeup looks. Cost: 5 credits
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image-file">Upload Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-full max-w-xs rounded-lg" />
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div>
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!!imageFile}
            />
          </div>

          <div>
            <Label htmlFor="makeup-style">Makeup Style</Label>
            <Select value={makeupStyle} onValueChange={setMakeupStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glam">💄 Glam (Dramatic)</SelectItem>
                <SelectItem value="natural">🌸 Natural (Fresh)</SelectItem>
                <SelectItem value="smokey">🖤 Smokey Eyes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleTransform} 
            disabled={loading || uploading || (credits?.credits_remaining ?? 0) < 5}
            className="w-full"
          >
            {uploading ? "Uploading..." : loading ? "Applying makeup..." : "Apply Makeup (5 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Result</h3>
          <img 
            src={result} 
            alt="Makeup transformation" 
            className="w-full rounded-lg"
          />
        </Card>
      )}
    </div>
    </>
    );
};
