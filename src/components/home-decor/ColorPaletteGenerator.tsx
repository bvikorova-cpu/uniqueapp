import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Palette, Loader2, Lightbulb, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ColorPaletteGeneratorProps {
  subscription: any;
  onBack: () => void;
}

export function ColorPaletteGenerator({ subscription, onBack }: ColorPaletteGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [roomType, setRoomType] = useState("");
  const [mood, setMood] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast({ title: "Missing Photo", description: "Please upload a room photo", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('home-designs').upload(fileName, selectedImage);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('home-designs').getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke('home-color-palette', {
        body: { roomImageUrl: publicUrl, roomType, mood }
      });

      if (error) throw error;
      setResult(data.paletteData);
      toast({ title: "✨ Palette Generated!", description: "Your custom color palette is ready" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasSubscription = subscription?.subscribed || false;

  return (
    <>
      <FloatingHowItWorks title="How Color Palette Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Color Palette Generator
          </h2>
          <p className="text-muted-foreground">Upload a room photo and get a professional color palette</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Generate Palette</CardTitle>
          <CardDescription>8 credits per analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Room Photo *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Room" className="max-w-full h-48 object-contain mx-auto rounded-lg" />
                  <Button variant="outline" size="sm" onClick={() => { setSelectedImage(null); setImagePreview(""); }}>Change Photo</Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Input type="file" accept="image/*" onChange={handleImageSelect} className="max-w-xs mx-auto" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="dining">Dining Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desired Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm & Serene</SelectItem>
                  <SelectItem value="energetic">Energetic & Vibrant</SelectItem>
                  <SelectItem value="cozy">Cozy & Warm</SelectItem>
                  <SelectItem value="elegant">Elegant & Luxurious</SelectItem>
                  <SelectItem value="natural">Natural & Earthy</SelectItem>
                  <SelectItem value="minimalist">Minimalist & Clean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!hasSubscription ? (
            <Card className="bg-muted/50 p-6 text-center">
              <Palette className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Pro Designer Required</h3>
              <p className="text-muted-foreground text-sm">Subscribe to generate AI color palettes</p>
            </Card>
          ) : (
            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Colors...</> : <><Palette className="mr-2 h-5 w-5" /> Generate Color Palette</>}
            </Button>
          )}
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="backdrop-blur-xl bg-card/80">
            <CardHeader>
              <CardTitle>Your Color Palette</CardTitle>
              {result.mood && <CardDescription>{result.mood}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              {result.palette?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.palette.map((color: any, idx: number) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      className="text-center space-y-2">
                      <div className="w-full aspect-square rounded-xl shadow-lg border" style={{ backgroundColor: color.hex }} />
                      <p className="font-medium text-sm">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.hex}</p>
                      <p className="text-xs text-muted-foreground">{color.usage}</p>
                      {color.percentage && <p className="text-xs font-semibold">{color.percentage}%</p>}
                    </motion.div>
                  ))}
                </div>
              )}

              {result.complementary_materials && (
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Complementary Materials</h4>
                    <p className="text-sm text-muted-foreground">{result.complementary_materials.join(", ")}</p>
                  </div>
                </div>
              )}

              {result.lighting_tips && (
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Lighting Tips</h4>
                    <p className="text-sm text-muted-foreground">{result.lighting_tips}</p>
                  </div>
                </div>
              )}

              {result.seasonal_variation && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Seasonal Variation</h4>
                  <p className="text-sm text-muted-foreground">{result.seasonal_variation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
}
