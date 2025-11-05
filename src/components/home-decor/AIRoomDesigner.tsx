import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Loader2, ShoppingBag, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

function ARPreviewButton({ designId }: { designId: string }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleARPreview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-ar-preview-checkout', {
        body: { design_id: designId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa vytvoriť checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleARPreview} disabled={loading} variant="outline" size="sm">
      <Eye className="mr-2 h-4 w-4" />
      {loading ? "Načítavam..." : "AR Preview €0.99"}
    </Button>
  );
}

interface AIRoomDesignerProps {
  subscription: any;
  onDesignComplete: () => void;
}

export function AIRoomDesigner({ subscription, onDesignComplete }: AIRoomDesignerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [roomType, setRoomType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [designResult, setDesignResult] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDesign = async () => {
    if (!selectedImage || !roomType || !stylePreference) {
      toast({
        title: "Chýbajúce informácie",
        description: "Prosím vyplňte všetky požadované polia",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload image
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('home-designs')
        .upload(`${user?.id}/${fileName}`, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('home-designs')
        .getPublicUrl(`${user?.id}/${fileName}`);

      // Generate design
      const { data, error } = await supabase.functions.invoke('generate-ai-room-design', {
        body: {
          originalImageUrl: publicUrl,
          roomType,
          stylePreference,
          customPrompt
        }
      });

      if (error) throw error;

      setDesignResult(data);
      onDesignComplete();

      toast({
        title: "✨ Návrh pripravený!",
        description: `Zostáva vám ${data.remainingDesigns} návrhov`,
      });

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa vygenerovať návrh",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remainingDesigns = subscription ? subscription.designs_limit - subscription.designs_used : 2;
  const isFreeTier = !subscription || subscription.tier === 'free';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">AI Room Designer</CardTitle>
              <CardDescription>
                Upload fotky miestnosti a AI vytvorí návrh podľa vášho štýlu
              </CardDescription>
            </div>
            <Badge variant={isFreeTier ? "secondary" : "default"} className="text-lg px-4 py-2">
              {remainingDesigns} / {subscription?.designs_limit || 2} návrhov
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Design Form */}
      <Card>
        <CardHeader>
          <CardTitle>Vytvorte nový návrh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Fotka miestnosti *</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Room preview" 
                    className="max-w-full h-64 object-contain mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                  >
                    Zmeniť fotku
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Nahrajte jasnú fotku miestnosti
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Room Type & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Typ miestnosti *</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living-room">Obývacia izba</SelectItem>
                  <SelectItem value="bedroom">Spálňa</SelectItem>
                  <SelectItem value="kitchen">Kuchyňa</SelectItem>
                  <SelectItem value="bathroom">Kúpeľňa</SelectItem>
                  <SelectItem value="dining-room">Jedáleň</SelectItem>
                  <SelectItem value="office">Kancelária</SelectItem>
                  <SelectItem value="kids-room">Detská izba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Štýl *</Label>
              <Select value={stylePreference} onValueChange={setStylePreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte štýl" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="scandinavian">Scandinavian</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="bohemian">Bohemian</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label>Dodatočné požiadavky (voliteľné)</Label>
            <Textarea
              placeholder="napr. Chcem viac rastlín, teplé farby, čítací kútik..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateDesign}
            disabled={loading || remainingDesigns <= 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generujem návrh...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Vygenerovať návrh (1 kredit)</>
            )}
          </Button>

          {isFreeTier && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Free: {remainingDesigns}/2 návrhov mesačne
              </p>
              <Button variant="outline" size="sm">
                Upgrade na Pro (50 návrhov/mesiac)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Result */}
      {designResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Váš AI návrh</CardTitle>
              <ARPreviewButton designId={designResult.design.id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {designResult.design.redesigned_image_url && (
              <img 
                src={designResult.design.redesigned_image_url} 
                alt="AI návrh"
                className="w-full rounded-lg"
              />
            )}

            {designResult.designData?.description && (
              <div>
                <h3 className="font-semibold mb-2">Popis:</h3>
                <p className="text-muted-foreground">{designResult.designData.description}</p>
              </div>
            )}

            {designResult.designData?.products?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Odporúčané produkty:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {designResult.designData.products.map((product: any, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-semibold mt-2">{product.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
