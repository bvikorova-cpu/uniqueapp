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
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
        title: "Error",
        description: error.message || "Failed to create checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIRoom Designer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Button onClick={handleARPreview} disabled={loading} variant="outline" size="sm">
      <Eye className="mr-2 h-4 w-4" />
      {loading ? "Loading..." : "AR Preview €0.99"}
    </Button>
    </>
    );
}

interface AIRoomDesignerProps {
  subscription: any;
  onDesignComplete?: () => void;
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
        title: "Missing Information",
        description: "Please fill in all required fields",
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
      if (onDesignComplete) {
        onDesignComplete();
      }

      toast({
        title: "✨ Design Ready!",
        description: `You have ${data.remainingDesigns} designs remaining`,
      });

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate design",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remainingDesigns = subscription?.subscribed ? subscription.designs_limit - subscription.designs_used : 0;
  const hasSubscription = subscription?.subscribed || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">AI Room Designer</CardTitle>
              <CardDescription>
                Upload room photos and AI will create designs based on your style
              </CardDescription>
            </div>
            {hasSubscription && (
              <Badge variant="default" className="text-lg px-4 py-2">
                {remainingDesigns} / {subscription?.designs_limit} designs remaining
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Design Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Room Photo *</Label>
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
                    Change Photo
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
                    Upload a clear photo of your room
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Room Type & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Room Type *</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="dining-room">Dining Room</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="kids-room">Kids Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style *</Label>
              <Select value={stylePreference} onValueChange={setStylePreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
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
            <Label>Additional Requirements (Optional)</Label>
            <Textarea
              placeholder="e.g. More plants, warm colors, reading nook..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {!hasSubscription ? (
            <Card className="bg-muted/50 p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Pro Designer Subscription Required</h3>
              <p className="text-muted-foreground mb-4">
                Subscribe to Pro Designer to generate AI room designs
              </p>
              <p className="text-2xl font-bold mb-4">€9.99/month</p>
              <p className="text-sm text-muted-foreground mb-4">
                • 50 AI room designs per month<br/>
                • AR preview for designs<br/>
                • Priority support
              </p>
            </Card>
          ) : (
            <Button
              onClick={handleGenerateDesign}
              disabled={loading || remainingDesigns <= 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Design...</>
              ) : remainingDesigns <= 0 ? (
                <>Design Limit Reached</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Generate AI Design</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Design Result */}
      {designResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your AI Design</CardTitle>
              <ARPreviewButton designId={designResult.design.id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {designResult.design.redesigned_image_url && (
              <img 
                src={designResult.design.redesigned_image_url} 
                alt="AI design"
                className="w-full rounded-lg"
              />
            )}

            {designResult.designData?.description && (
              <div>
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-muted-foreground">{designResult.designData.description}</p>
              </div>
            )}

            {designResult.designData?.products?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Recommended Products:
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
