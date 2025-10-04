import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import aiGenerationBg from "@/assets/ai-generation-bg.jpg";

const AIGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Prosím zadajte popis obrázka");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-image-generation", {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Obrázok úspešne vygenerovaný!");
      } else {
        throw new Error("Nepodarilo sa vygenerovať obrázok");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Chyba pri generovaní obrázka");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${aiGenerationBg})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              AI Generovanie Obrázkov
            </h1>
          </div>
          <p className="text-lg text-white drop-shadow-md max-w-2xl mx-auto">
            Vytvorte úžasné obrázky pomocou AI. Stačí opísať, čo chcete vidieť.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Popíšte váš obrázok</CardTitle>
              <CardDescription>
                Zadajte detailný popis toho, čo chcete vygenerovať
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Napríklad: Krásny západ slnka nad horami s ružovou oblohou..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generujem...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Vygenerovať obrázok
                  </>
                )}
              </Button>

              {/* Examples */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Ukážkové prompty:</p>
                <div className="space-y-2">
                  {[
                    "Futuristické mesto s lietajúcimi autami",
                    "Mačka v astronautskom obleku na Mesiaci",
                    "Fantasy krajina s dúhovými vodopádmi"
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="text-xs text-muted-foreground hover:text-primary block text-left w-full"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Vygenerovaný obrázok</CardTitle>
              <CardDescription>
                Váš AI vytvorený obrázok sa zobrazí tu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Vytváram váš obrázok...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={generatedImage}
                      alt="AI Generated"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      onClick={handleDownload}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Stiahnuť
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sem sa zobrazí váš obrázok</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tipy pre lepšie výsledky</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">✨ Buďte konkrétni</h3>
                <p className="text-sm text-muted-foreground">
                  Uveďte detaily ako farby, štýl, náladu a kompozíciu
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎨 Používajte prídavné mená</h3>
                <p className="text-sm text-muted-foreground">
                  Opisy ako "realistický", "malebný", "moderný" pomáhajú AI pochopiť štýl
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🌟 Experimentujte</h3>
                <p className="text-sm text-muted-foreground">
                  Skúšajte rôzne formulácie toho istého nápadu
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔍 Pridajte kontext</h3>
                <p className="text-sm text-muted-foreground">
                  Uveďte prostredie, osvetlenie a čas dňa
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
