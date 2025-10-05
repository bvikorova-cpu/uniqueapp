import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Image as ImageIcon, Video, Music, Upload } from "lucide-react";
import { toast } from "sonner";
import swayDanceImg from "@/assets/effects/sway-dance.jpg";
import waveDanceImg from "@/assets/effects/wave-dance.jpg";
import ghibliImg from "@/assets/effects/ghibli.jpg";
import minecraftImg from "@/assets/effects/minecraft.jpg";
import earthZoomImg from "@/assets/effects/earth-zoom.jpg";
import boxMeImg from "@/assets/effects/box-me.jpg";
import paperFallImg from "@/assets/effects/paper-fall.jpg";
import styleMeImg from "@/assets/effects/style-me.jpg";
import napMeImg from "@/assets/effects/nap-me.jpg";
import spin360Img from "@/assets/effects/spin-360.jpg";

type EffectCategory = "all" | "dance" | "appearance" | "entertainment" | "fanciful" | "emotions";

interface AIEffect {
  id: string;
  name: string;
  category: EffectCategory;
  image: string;
  description: string;
}

const aiEffects: AIEffect[] = [
  { id: "sway-dance", name: "Sway Dance", category: "dance", image: swayDanceImg, description: "Tancujte so štýlom" },
  { id: "wave-dance", name: "Wave Dance", category: "dance", image: waveDanceImg, description: "Vlnový tanec" },
  { id: "ghibli", name: "Ghibli štýl", category: "appearance", image: ghibliImg, description: "Transformácia do Ghibli štýlu" },
  { id: "minecraft", name: "Minecraft", category: "entertainment", image: minecraftImg, description: "Minecraft transformácia" },
  { id: "earth-zoom", name: "Earth Zoom", category: "fanciful", image: earthZoomImg, description: "Zem priblíženie/oddialenie" },
  { id: "box-me", name: "Box Me", category: "entertainment", image: boxMeImg, description: "Box efekt" },
  { id: "paper-fall", name: "Paper Fall", category: "fanciful", image: paperFallImg, description: "Padajúci papier" },
  { id: "style-me", name: "Style Me", category: "appearance", image: styleMeImg, description: "Štýlová transformácia" },
  { id: "nap-me", name: "Nap Me", category: "emotions", image: napMeImg, description: "Relaxačný efekt" },
  { id: "spin-360", name: "Spin 360", category: "fanciful", image: spin360Img, description: "360° rotácia" },
];

const AIGeneration = () => {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>("all");
  const [activeTab, setActiveTab] = useState<"video" | "image">("video");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredEffects = selectedCategory === "all" 
    ? aiEffects 
    : aiEffects.filter(effect => effect.category === selectedCategory);

  const handleEffectClick = (effect: AIEffect) => {
    toast.info(`${effect.name} efekt bude čoskoro dostupný!`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
    
    const isValidImage = validImageTypes.includes(file.type);
    const isValidVideo = validVideoTypes.includes(file.type);

    if (!isValidImage && !isValidVideo) {
      toast.error("Nepodporovaný formát súboru. Použite JPG, PNG, MP4 alebo MOV.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("Súbor je príliš veľký. Maximálna veľkosť je 50MB.");
      return;
    }

    setUploadedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Súbor úspešne nahratý!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Efekty
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformujte svoje videá a obrázky pomocou AI efektov
          </p>
        </div>

        {/* Tabs for Video/Image */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "video" | "image")} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Obrázok
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: "all", label: "Všetky" },
            { id: "dance", label: "Tanec" },
            { id: "appearance", label: "Vzhľad" },
            { id: "entertainment", label: "Zábava" },
            { id: "fanciful", label: "Fantazijné" },
            { id: "emotions", label: "Emócie" },
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id as EffectCategory)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Effects Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {filteredEffects.map((effect) => (
            <Card
              key={effect.id}
              className="cursor-pointer hover:shadow-elegant transition-all group"
              onClick={() => handleEffectClick(effect)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                  <img 
                    src={effect.image} 
                    alt={effect.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-sm text-center mb-1">{effect.name}</h3>
                <p className="text-xs text-muted-foreground text-center">{effect.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Nahrať súbor
              </CardTitle>
              <CardDescription>
                Nahrajte svoj obrázok alebo video pre aplikáciu AI efektov
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="file-upload" className="block">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Kliknite pre nahranie alebo presuňte súbory sem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Podporované formáty: JPG, PNG, MP4, MOV (max 50MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,video/mp4,video/mov,video/avi"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {previewUrl && uploadedFile && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-2">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {uploadedFile.type.startsWith('image/') && (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-64 rounded-lg object-contain"
                        />
                      )}
                      {uploadedFile.type.startsWith('video/') && (
                        <video
                          src={previewUrl}
                          controls
                          className="max-h-64 rounded-lg"
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Odstrániť
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ako to funguje?</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Nahrajte</h3>
                <p className="text-sm text-muted-foreground">
                  Vyberte svoj obrázok alebo video
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Vyberte efekt</h3>
                <p className="text-sm text-muted-foreground">
                  Zvoľte AI efekt z našej knižnice
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Stiahnite</h3>
                <p className="text-sm text-muted-foreground">
                  Získajte váš transformovaný obsah
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGeneration;
