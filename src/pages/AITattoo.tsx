import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Download, Heart, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

interface TattooDesign {
  id: string;
  design_url: string;
  prompt: string;
  style: string;
  placement?: string;
  is_favorite: boolean;
  created_at: string;
}

const AITattoo = () => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [colorScheme, setColorScheme] = useState("blackgrey");
  const [placement, setPlacement] = useState("");
  const [size, setSize] = useState("medium");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designs, setDesigns] = useState<TattooDesign[]>([]);
  const [bodyPhoto, setBodyPhoto] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 50 });
  const [previewScale, setPreviewScale] = useState(100);

  const styles = [
    { value: "realistic", label: "Realistic" },
    { value: "tribal", label: "Tribal" },
    { value: "watercolor", label: "Watercolor" },
    { value: "geometric", label: "Geometric" },
    { value: "blackwork", label: "Blackwork" },
    { value: "traditional", label: "Traditional" },
    { value: "japanese", label: "Japanese" },
    { value: "minimalist", label: "Minimalist" },
  ];

  const placements = [
    { value: "arm", label: "Arm" },
    { value: "shoulder", label: "Shoulder" },
    { value: "back", label: "Back" },
    { value: "chest", label: "Chest" },
    { value: "leg", label: "Leg" },
    { value: "wrist", label: "Wrist" },
    { value: "ankle", label: "Ankle" },
    { value: "neck", label: "Neck" },
  ];

  const checkCredits = (required: number) => {
    if (credits.credits_remaining < required) {
      toast.error(`You need ${required} credits. Redirecting...`);
      setTimeout(() => navigate('/ai-credits'), 1500);
      return false;
    }
    return true;
  };

  const generateTattoo = async () => {
    if (!prompt) {
      toast.error("Please describe your tattoo design");
      return;
    }
    if (!checkCredits(8)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tattoo', {
        body: { prompt, style, colorScheme, placement, size }
      });

      if (error) throw error;
      
      setGeneratedImage(data.imageUrl);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_tattoo_designs').insert({
          user_id: user.id,
          prompt,
          style,
          placement,
          size,
          color_scheme: colorScheme,
          design_url: data.imageUrl,
          credits_used: 8
        });
      }

      await refresh();
      toast.success("Tattoo design generated!");
      loadDesigns();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Error generating tattoo");
    } finally {
      setLoading(false);
    }
  };

  const loadDesigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_tattoo_designs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading designs:', error);
      return;
    }

    setDesigns(data || []);
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    await supabase
      .from('ai_tattoo_designs')
      .update({ is_favorite: !currentState })
      .eq('id', id);
    
    loadDesigns();
    toast.success(!currentState ? "Added to favorites" : "Removed from favorites");
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const handleBodyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBodyPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Tattoo Designer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Design your perfect custom tattoo with AI
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Credits: {credits.credits_remaining}</span>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6" onValueChange={(v) => v === "gallery" && loadDesigns()}>
          <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview">Placement Preview</TabsTrigger>
            <TabsTrigger value="gallery">My Designs</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Design Your Tattoo</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Describe Your Tattoo</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., A phoenix rising from flames with detailed feathers"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color Scheme</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blackgrey">Black & Grey</SelectItem>
                        <SelectItem value="color">Color</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Placement</Label>
                    <Select value={placement} onValueChange={setPlacement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {placements.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={generateTattoo}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Tattoo Design (8 credits)
                    </>
                  )}
                </Button>

                {generatedImage && (
                  <div className="mt-6 space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated tattoo" 
                      className="w-full rounded-lg border-2 border-primary"
                    />
                    <Button
                      onClick={() => downloadImage(generatedImage, `tattoo-${Date.now()}.png`)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download High-Res
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Placement Preview</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="body-photo">Upload Photo of Body Part</Label>
                  <Input
                    id="body-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleBodyPhotoUpload}
                  />
                </div>

                {bodyPhoto && generatedImage && (
                  <div className="relative border-2 border-dashed border-primary rounded-lg p-4">
                    <img src={bodyPhoto} alt="Body" className="w-full rounded" />
                    <img 
                      src={generatedImage}
                      alt="Tattoo overlay"
                      className="absolute cursor-move"
                      style={{
                        left: `${previewPosition.x}%`,
                        top: `${previewPosition.y}%`,
                        transform: `translate(-50%, -50%) scale(${previewScale / 100})`,
                        maxWidth: '40%',
                        opacity: 0.9
                      }}
                      draggable
                      onDragEnd={(e) => {
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (rect) {
                          setPreviewPosition({
                            x: ((e.clientX - rect.left) / rect.width) * 100,
                            y: ((e.clientY - rect.top) / rect.height) * 100
                          });
                        }
                      }}
                    />
                    <div className="mt-4">
                      <Label>Size: {previewScale}%</Label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={previewScale}
                        onChange={(e) => setPreviewScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {!bodyPhoto && (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Upload a photo to preview tattoo placement</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={design.design_url} 
                    alt={design.prompt}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {design.prompt}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                      <span className="bg-primary/10 px-2 py-1 rounded">{design.style}</span>
                      {design.placement && (
                        <span className="bg-secondary/50 px-2 py-1 rounded">{design.placement}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFavorite(design.id, design.is_favorite)}
                        className="flex-1"
                      >
                        <Heart className={`h-4 w-4 ${design.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(design.design_url, `tattoo-${design.id}.png`)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {designs.length === 0 && (
                <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No designs yet. Create your first tattoo!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AITattoo;