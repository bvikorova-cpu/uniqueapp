import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, Image as ImageIcon, Video, Music, Upload, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

type EffectCategory = "all" | "interactions" | "pets" | "appearance" | "entertainment" | "heroes" | "fanciful" | "dance" | "emotions";

interface AIEffect {
  id: string;
  name: string;
  category: EffectCategory;
  image: string;
  description: string;
  isHot?: boolean;
}

const aiEffects: AIEffect[] = [
  { id: "sway-dance", name: "Sway Dance", category: "dance", image: swayDanceImg, description: "Tancujte so štýlom" },
  { id: "my-girlfriendssss", name: "My Girlfriendssss", category: "interactions", image: swayDanceImg, description: "Vytvorte romantický moment" },
  { id: "my-boyfriendssss", name: "My Boyfriendssss", category: "interactions", image: swayDanceImg, description: "Vytvorte romantický moment" },
  { id: "earth-zoom-out", name: "Earth Zoom Out", category: "fanciful", image: earthZoomImg, description: "Oddialenie Zeme" },
  { id: "wave-dance", name: "Wave Dance", category: "dance", image: waveDanceImg, description: "Vlnový tanec" },
  { id: "earth-zoom-in", name: "Earth Zoom In", category: "fanciful", image: earthZoomImg, description: "Priblíženie Zeme" },
  { id: "minecraft", name: "Minecraft", category: "entertainment", image: minecraftImg, description: "Minecraft transformácia" },
  { id: "box-me", name: "Box Me", category: "entertainment", image: boxMeImg, description: "Box efekt" },
  { id: "paper-fall", name: "Paper Fall", category: "fanciful", image: paperFallImg, description: "Padajúci papier" },
  { id: "style-me", name: "Style Me", category: "appearance", image: styleMeImg, description: "Štýlová transformácia" },
  { id: "ghibli", name: "Ghibli", category: "appearance", image: ghibliImg, description: "Ghibli štýl transformácia" },
  { id: "ai-couple-hugging", name: "AI Couple Hugging", category: "interactions", image: swayDanceImg, description: "Objímanie páru" },
  { id: "nap-me", name: "Nap Me", category: "emotions", image: napMeImg, description: "Relaxačný efekt" },
  { id: "spin-360", name: "Spin 360", category: "fanciful", image: spin360Img, description: "360° rotácia" },
  { id: "sexy-me", name: "Sexy Me", category: "appearance", image: styleMeImg, description: "Sexi transformácia" },
  { id: "gender-swap", name: "Gender Swap", category: "appearance", image: styleMeImg, description: "Výmena pohlavia" },
  { id: "smile", name: "Smile", category: "emotions", image: napMeImg, description: "Úsmev efekt" },
  { id: "bodyshake", name: "Bodyshake", category: "dance", image: waveDanceImg, description: "Trasenie telom" },
  { id: "melt", name: "Melt", category: "fanciful", image: paperFallImg, description: "Topenie sa" },
  { id: "bloom-magic", name: "Bloom Magic", category: "fanciful", image: paperFallImg, description: "Kúzlo kvitnutia", isHot: true },
  { id: "paperman", name: "Paperman", category: "heroes", image: boxMeImg, description: "Papierový muž" },
  { id: "flying", name: "Flying", category: "fanciful", image: paperFallImg, description: "Lietanie", isHot: true },
  { id: "balloon-flyaway", name: "Balloon Flyaway", category: "fanciful", image: paperFallImg, description: "Balóny odletia" },
  { id: "expansion", name: "Expansion", category: "fanciful", image: earthZoomImg, description: "Expanzia" },
  { id: "pet-lovers", name: "Pet Lovers", category: "pets", image: swayDanceImg, description: "Milovníci zvierat" },
  { id: "flame-carpet", name: "Flame Carpet", category: "fanciful", image: paperFallImg, description: "Plameňový koberec" },
  { id: "fashion-stride", name: "Fashion Stride", category: "appearance", image: styleMeImg, description: "Módny krok" },
  { id: "send-roses", name: "Send Roses", category: "interactions", image: swayDanceImg, description: "Poslať ruže", isHot: true },
  { id: "finger-heart", name: "Finger Heart", category: "emotions", image: napMeImg, description: "Prstové srdce" },
  { id: "cartoon-doll", name: "Cartoon Doll", category: "appearance", image: ghibliImg, description: "Kreslená bábika" },
  { id: "beast-companion", name: "Beast Companion", category: "pets", image: swayDanceImg, description: "Spoločník zviera" },
  { id: "bloom-doorobear", name: "Bloom Doorobear", category: "pets", image: swayDanceImg, description: "Dooro medveď" },
  { id: "french-kiss", name: "French Kiss", category: "interactions", image: swayDanceImg, description: "Francúzsky bozk" },
  { id: "whos-arrested", name: "Who's arrested?", category: "entertainment", image: boxMeImg, description: "Kto je zatknutý?" },
  { id: "warmth-of-jesus", name: "Warmth of Jesus", category: "heroes", image: paperFallImg, description: "Teplo Ježiša", isHot: true },
  { id: "wild-laugh", name: "Wild Laugh", category: "emotions", image: napMeImg, description: "Divý smiech" },
  { id: "surprised", name: "Surprised", category: "emotions", image: napMeImg, description: "Prekvapený" },
  { id: "explosion", name: "Explosion", category: "fanciful", image: paperFallImg, description: "Explózia" },
  { id: "face-punch", name: "Face Punch", category: "entertainment", image: boxMeImg, description: "Facka" },
  { id: "ai-kiss", name: "AI Kiss", category: "interactions", image: swayDanceImg, description: "AI bozk" },
  { id: "kungfu-club", name: "Kungfu Club", category: "entertainment", image: boxMeImg, description: "Kung-fu klub", isHot: true },
  { id: "holy-wings", name: "Holy Wings", category: "heroes", image: paperFallImg, description: "Sväté krídla" },
  { id: "sheep-curls", name: "Sheep Curls", category: "pets", image: swayDanceImg, description: "Ovčie kučery", isHot: true },
  { id: "ai-muscle-generator", name: "AI Muscle Generator", category: "appearance", image: styleMeImg, description: "AI generátor svalov", isHot: true },
  { id: "squish-it", name: "Squish It", category: "fanciful", image: boxMeImg, description: "Stlač to", isHot: true },
  { id: "hair-growth-magic", name: "Hair Growth Magic", category: "appearance", image: styleMeImg, description: "Kúzlo rastu vlasov", isHot: true },
  { id: "become-male", name: "Become Male", category: "appearance", image: styleMeImg, description: "Staň sa mužom" },
  { id: "alive-art", name: "Alive Art", category: "fanciful", image: ghibliImg, description: "Živé umenie" },
  { id: "become-female", name: "Become Female", category: "appearance", image: styleMeImg, description: "Staň sa ženou" },
  { id: "anything-robot", name: "Anything, Robot", category: "entertainment", image: minecraftImg, description: "Čokoľvek, robot", isHot: true },
];

const AIGeneration = () => {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>("all");
  const [activeTab, setActiveTab] = useState<"video" | "image">("video");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const filteredEffects = selectedCategory === "all" 
    ? aiEffects 
    : aiEffects.filter(effect => effect.category === selectedCategory);

  const handleEffectClick = async (effect: AIEffect) => {
    if (!uploadedFile || !previewUrl) {
      toast.error("Najprv nahrajte obrázok alebo video!");
      return;
    }

    if (uploadedFile.type.startsWith('video/')) {
      toast.info("Video efekty budú čoskoro dostupné!");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('apply-ai-effect', {
        body: {
          imageUrl: base64Image,
          effectId: effect.id,
          effectName: effect.name
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setResultImage(data.imageUrl);
        toast.success(`${effect.name} efekt úspešne aplikovaný!`);
      } else {
        throw new Error('Nepodarilo sa aplikovať efekt');
      }
    } catch (error: any) {
      console.error('Error applying effect:', error);
      toast.error(error.message || 'Chyba pri aplikovaní efektu');
    } finally {
      setIsProcessing(false);
    }
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
            { id: "interactions", label: "Interakcie" },
            { id: "pets", label: "Zvieratá" },
            { id: "appearance", label: "Vzhľad" },
            { id: "entertainment", label: "Zábava" },
            { id: "heroes", label: "Hrdinovia" },
            { id: "fanciful", label: "Fantazijné" },
            { id: "dance", label: "Tanec" },
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
        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Aplikujem efekt na váš súbor...</p>
          </div>
        )}

        {!isProcessing && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {filteredEffects.map((effect) => (
              <Card
                key={effect.id}
                className="cursor-pointer hover:shadow-elegant transition-all group relative overflow-hidden"
                onClick={() => handleEffectClick(effect)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <img 
                      src={effect.image} 
                      alt={effect.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {effect.isHot && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      HOT
                    </div>
                  )}
                  <div className="p-3 bg-background">
                    <h3 className="font-semibold text-sm text-center">{effect.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Result Section */}
        {resultImage && (
          <div className="mt-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Výsledok</CardTitle>
                <CardDescription>Váš obrázok s aplikovaným AI efektom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <img 
                    src={resultImage} 
                    alt="Result" 
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resultImage;
                      link.download = `ai-effect-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Stiahnuť
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
