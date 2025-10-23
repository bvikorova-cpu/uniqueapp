import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Video, Download, Sparkles } from "lucide-react";

interface VideoAdResult {
  title: string;
  script: string;
  scenes: Array<{
    duration: string;
    description: string;
    voiceover: string;
    visuals: string;
  }>;
  callToAction: string;
  musicSuggestion: string;
  targetEmotions: string[];
}

const VideoAdGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    targetAudience: "",
    keyMessage: "",
    tone: "professional",
    duration: "30",
    platform: "youtube"
  });
  const [result, setResult] = useState<VideoAdResult | null>(null);

  const handleGenerate = async () => {
    if (!formData.product || !formData.targetAudience || !formData.keyMessage) {
      toast.error("Vyplň všetky povinné polia");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-ad', {
        body: formData
      });

      if (error) throw error;

      setResult(data);
      toast.success("Video reklama vygenerovaná!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Chyba pri generovaní");
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!result) return;
    
    const content = `
${result.title}
${'='.repeat(result.title.length)}

SCRIPT:
${result.script}

SCÉNY:
${result.scenes.map((scene, i) => `
Scéna ${i + 1} (${scene.duration})
Popis: ${scene.description}
Voiceover: ${scene.voiceover}
Vizuály: ${scene.visuals}
`).join('\n')}

CALL TO ACTION:
${result.callToAction}

HUDBA: ${result.musicSuggestion}
EMÓCIE: ${result.targetEmotions.join(', ')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-ad-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Video Reklama Generator
          </h1>
          <p className="text-muted-foreground">
            Vytvor profesionálny video script s AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Zadaj požiadavky
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Produkt/Služba *</Label>
                <Input
                  id="product"
                  placeholder="napr. Fitness aplikácia"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Cieľová skupina *</Label>
                <Input
                  id="targetAudience"
                  placeholder="napr. Mladí ľudia 18-30 rokov"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="keyMessage">Kľúčový odkaz *</Label>
                <Textarea
                  id="keyMessage"
                  placeholder="Čo chceš oznámiť zákazníkom?"
                  value={formData.keyMessage}
                  onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tone">Tón reklamy</Label>
                <Select value={formData.tone} onValueChange={(val) => setFormData({ ...formData, tone: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesionálny</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energický</SelectItem>
                    <SelectItem value="emotional">Emocionálny</SelectItem>
                    <SelectItem value="humorous">Humorný</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Dĺžka (sekundy)</Label>
                  <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">60s</SelectItem>
                      <SelectItem value="90">90s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">Platforma</Label>
                  <Select value={formData.platform} onValueChange={(val) => setFormData({ ...formData, platform: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tv">TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generujem...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Vygeneruj Video Reklamu
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Výsledok
                </span>
                {result && (
                  <Button variant="outline" size="sm" onClick={downloadScript}>
                    <Download className="w-4 h-4 mr-2" />
                    Stiahnuť
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Vyplň formulár a vygeneruj video reklamu</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  <div>
                    <h3 className="font-bold text-lg mb-2">{result.title}</h3>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">📝 Kompletný Script:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.script}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">🎬 Scény:</h4>
                    {result.scenes.map((scene, idx) => (
                      <Card key={idx} className="mb-3 bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="font-medium mb-2">
                            Scéna {idx + 1} ({scene.duration})
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Popis:</span> {scene.description}
                            </div>
                            <div>
                              <span className="font-medium">Voiceover:</span> "{scene.voiceover}"
                            </div>
                            <div>
                              <span className="font-medium">Vizuály:</span> {scene.visuals}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">📢 Call to Action:</h4>
                    <p className="text-sm">{result.callToAction}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">🎵 Hudba:</h4>
                      <p className="text-sm text-muted-foreground">{result.musicSuggestion}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">💭 Emócie:</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.targetEmotions.map((emotion, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoAdGenerator;
