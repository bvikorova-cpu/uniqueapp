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
import earthZoomOutImg from "@/assets/effects/earth-zoom-out.jpg";
import earthZoomInImg from "@/assets/effects/earth-zoom-in.jpg";
import boxMeImg from "@/assets/effects/box-me.jpg";
import paperFallImg from "@/assets/effects/paper-fall.jpg";
import styleMeImg from "@/assets/effects/style-me.jpg";
import napMeImg from "@/assets/effects/nap-me.jpg";
import spin360Img from "@/assets/effects/spin-360.jpg";
import aiCoupleHuggingImg from "@/assets/effects/ai-couple-hugging.jpg";
import myGirlfriendsssssImg from "@/assets/effects/my-girlfriendssss.jpg";
import myBoyfriendssssImg from "@/assets/effects/my-boyfriendssss.jpg";
import sexyMeImg from "@/assets/effects/sexy-me.jpg";
import genderSwapImg from "@/assets/effects/gender-swap.jpg";
import smileImg from "@/assets/effects/smile.jpg";
import bodyshakeImg from "@/assets/effects/bodyshake.jpg";
import meltImg from "@/assets/effects/melt.jpg";
import bloomMagicImg from "@/assets/effects/bloom-magic.jpg";
import papermanImg from "@/assets/effects/paperman.jpg";
import flyingImg from "@/assets/effects/flying.jpg";
import balloonFlyawayImg from "@/assets/effects/balloon-flyaway.jpg";
import expansionImg from "@/assets/effects/expansion.jpg";
import petLoversImg from "@/assets/effects/pet-lovers.jpg";
import flameCarpetImg from "@/assets/effects/flame-carpet.jpg";
import fashionStrideImg from "@/assets/effects/fashion-stride.jpg";
import sendRosesImg from "@/assets/effects/send-roses.jpg";
import fingerHeartImg from "@/assets/effects/finger-heart.jpg";
import cartoonDollImg from "@/assets/effects/cartoon-doll.jpg";
import beastCompanionImg from "@/assets/effects/beast-companion.jpg";
import bloomDoorobearImg from "@/assets/effects/bloom-doorobear.jpg";
import frenchKissImg from "@/assets/effects/french-kiss.jpg";
import whosArrestedImg from "@/assets/effects/whos-arrested.jpg";
import warmthOfJesusImg from "@/assets/effects/warmth-of-jesus.jpg";
import wildLaughImg from "@/assets/effects/wild-laugh.jpg";
import surprisedImg from "@/assets/effects/surprised.jpg";
import explosionImg from "@/assets/effects/explosion.jpg";
import facePunchImg from "@/assets/effects/face-punch.jpg";
import aiKissImg from "@/assets/effects/ai-kiss.jpg";
import kungfuClubImg from "@/assets/effects/kungfu-club.jpg";
import holyWingsImg from "@/assets/effects/holy-wings.jpg";
import sheepCurlsImg from "@/assets/effects/sheep-curls.jpg";
import aiMuscleGeneratorImg from "@/assets/effects/ai-muscle-generator.jpg";
import squishItImg from "@/assets/effects/squish-it.jpg";
import hairGrowthMagicImg from "@/assets/effects/hair-growth-magic.jpg";
import becomeMaleImg from "@/assets/effects/become-male.jpg";
import aliveArtImg from "@/assets/effects/alive-art.jpg";
import becomeFemaleImg from "@/assets/effects/become-female.jpg";
import anythingRobotImg from "@/assets/effects/anything-robot.jpg";

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
  { id: "my-girlfriendssss", name: "My Girlfriendssss", category: "interactions", image: myGirlfriendsssssImg, description: "Vytvorte romantický moment" },
  { id: "my-boyfriendssss", name: "My Boyfriendssss", category: "interactions", image: myBoyfriendssssImg, description: "Vytvorte romantický moment" },
  { id: "earth-zoom-out", name: "Earth Zoom Out", category: "fanciful", image: earthZoomOutImg, description: "Oddialenie Zeme" },
  { id: "wave-dance", name: "Wave Dance", category: "dance", image: waveDanceImg, description: "Vlnový tanec" },
  { id: "earth-zoom-in", name: "Earth Zoom In", category: "fanciful", image: earthZoomInImg, description: "Priblíženie Zeme" },
  { id: "minecraft", name: "Minecraft", category: "entertainment", image: minecraftImg, description: "Minecraft transformácia" },
  { id: "box-me", name: "Box Me", category: "entertainment", image: boxMeImg, description: "Box efekt" },
  { id: "paper-fall", name: "Paper Fall", category: "fanciful", image: paperFallImg, description: "Padajúci papier" },
  { id: "style-me", name: "Style Me", category: "appearance", image: styleMeImg, description: "Štýlová transformácia" },
  { id: "ghibli", name: "Ghibli", category: "appearance", image: ghibliImg, description: "Ghibli štýl transformácia" },
  { id: "ai-couple-hugging", name: "AI Couple Hugging", category: "interactions", image: aiCoupleHuggingImg, description: "Objímanie páru" },
  { id: "nap-me", name: "Nap Me", category: "emotions", image: napMeImg, description: "Relaxačný efekt" },
  { id: "spin-360", name: "Spin 360", category: "fanciful", image: spin360Img, description: "360° rotácia" },
  { id: "sexy-me", name: "Sexy Me", category: "appearance", image: sexyMeImg, description: "Sexi transformácia" },
  { id: "gender-swap", name: "Gender Swap", category: "appearance", image: genderSwapImg, description: "Výmena pohlavia" },
  { id: "smile", name: "Smile", category: "emotions", image: smileImg, description: "Úsmev efekt" },
  { id: "bodyshake", name: "Bodyshake", category: "dance", image: bodyshakeImg, description: "Trasenie telom" },
  { id: "melt", name: "Melt", category: "fanciful", image: meltImg, description: "Topenie sa" },
  { id: "bloom-magic", name: "Bloom Magic", category: "fanciful", image: bloomMagicImg, description: "Kúzlo kvitnutia", isHot: true },
  { id: "paperman", name: "Paperman", category: "heroes", image: papermanImg, description: "Papierový muž" },
  { id: "flying", name: "Flying", category: "fanciful", image: flyingImg, description: "Lietanie", isHot: true },
  { id: "balloon-flyaway", name: "Balloon Flyaway", category: "fanciful", image: balloonFlyawayImg, description: "Balóny odletia" },
  { id: "expansion", name: "Expansion", category: "fanciful", image: expansionImg, description: "Expanzia" },
  { id: "pet-lovers", name: "Pet Lovers", category: "pets", image: petLoversImg, description: "Milovníci zvierat" },
  { id: "flame-carpet", name: "Flame Carpet", category: "fanciful", image: flameCarpetImg, description: "Plameňový koberec" },
  { id: "fashion-stride", name: "Fashion Stride", category: "appearance", image: fashionStrideImg, description: "Módny krok" },
  { id: "send-roses", name: "Send Roses", category: "interactions", image: sendRosesImg, description: "Poslať ruže", isHot: true },
  { id: "finger-heart", name: "Finger Heart", category: "emotions", image: fingerHeartImg, description: "Prstové srdce" },
  { id: "cartoon-doll", name: "Cartoon Doll", category: "appearance", image: cartoonDollImg, description: "Kreslená bábika" },
  { id: "beast-companion", name: "Beast Companion", category: "pets", image: beastCompanionImg, description: "Spoločník zviera" },
  { id: "bloom-doorobear", name: "Bloom Doorobear", category: "pets", image: bloomDoorobearImg, description: "Dooro medveď" },
  { id: "french-kiss", name: "French Kiss", category: "interactions", image: frenchKissImg, description: "Francúzsky bozk" },
  { id: "whos-arrested", name: "Who's arrested?", category: "entertainment", image: whosArrestedImg, description: "Kto je zatknutý?" },
  { id: "warmth-of-jesus", name: "Warmth of Jesus", category: "heroes", image: warmthOfJesusImg, description: "Teplo Ježiša", isHot: true },
  { id: "wild-laugh", name: "Wild Laugh", category: "emotions", image: wildLaughImg, description: "Divý smiech" },
  { id: "surprised", name: "Surprised", category: "emotions", image: surprisedImg, description: "Prekvapený" },
  { id: "explosion", name: "Explosion", category: "fanciful", image: explosionImg, description: "Explózia" },
  { id: "face-punch", name: "Face Punch", category: "entertainment", image: facePunchImg, description: "Facka" },
  { id: "ai-kiss", name: "AI Kiss", category: "interactions", image: aiKissImg, description: "AI bozk" },
  { id: "kungfu-club", name: "Kungfu Club", category: "entertainment", image: kungfuClubImg, description: "Kung-fu klub", isHot: true },
  { id: "holy-wings", name: "Holy Wings", category: "heroes", image: holyWingsImg, description: "Sväté krídla" },
  { id: "sheep-curls", name: "Sheep Curls", category: "pets", image: sheepCurlsImg, description: "Ovčie kučery", isHot: true },
  { id: "ai-muscle-generator", name: "AI Muscle Generator", category: "appearance", image: aiMuscleGeneratorImg, description: "AI generátor svalov", isHot: true },
  { id: "squish-it", name: "Squish It", category: "fanciful", image: squishItImg, description: "Stlač to", isHot: true },
  { id: "hair-growth-magic", name: "Hair Growth Magic", category: "appearance", image: hairGrowthMagicImg, description: "Kúzlo rastu vlasov", isHot: true },
  { id: "become-male", name: "Become Male", category: "appearance", image: becomeMaleImg, description: "Staň sa mužom" },
  { id: "alive-art", name: "Alive Art", category: "fanciful", image: aliveArtImg, description: "Živé umenie" },
  { id: "become-female", name: "Become Female", category: "appearance", image: becomeFemaleImg, description: "Staň sa ženou" },
  { id: "anything-robot", name: "Anything, Robot", category: "entertainment", image: anythingRobotImg, description: "Čokoľvek, robot", isHot: true },
];

const AIGeneration = () => {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>("all");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const filteredEffects = selectedCategory === "all" 
    ? aiEffects 
    : aiEffects.filter(effect => effect.category === selectedCategory);

  const handleEffectClick = async (effect: AIEffect) => {
    if (!uploadedFile || !previewUrl) {
      toast.error("Najprv nahrajte obrázok!");
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
    
    if (!validImageTypes.includes(file.type)) {
      toast.error("Nepodporovaný formát. Použite JPG, PNG alebo WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 10MB.");
      return;
    }

    setUploadedFile(file);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success("Obrázok úspešne nahratý!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Efekty na Obrázky
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformujte svoje fotky pomocou pokročilých AI efektov
          </p>
        </div>

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
                    Kliknite pre nahratie obrázka alebo ho presuňte sem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Podporované formáty: JPG, PNG, WEBP (max 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
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
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain"
                      />
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
