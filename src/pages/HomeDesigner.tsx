import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Sparkles, Home, ShoppingCart, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HomeDesigner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useAICredits();
  
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [roomType, setRoomType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadDesigns();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadDesigns = async () => {
    const { data } = await supabase
      .from('home_designs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setDesigns(data);
  };

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
        description: "Please upload an image and select room type and style",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;

      if (currentCredits < 10) {
        toast({
          title: "Insufficient Credits",
          description: "You need 10 credits to generate a design.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      // Upload original image
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('home-designs')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('home-designs')
        .getPublicUrl(fileName);

      // Generate design
      const { data, error } = await supabase.functions.invoke('generate-home-design', {
        body: {
          originalImageUrl: publicUrl,
          roomType,
          stylePreference,
          customPrompt
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Design Generated!",
        description: `Your ${stylePreference} ${roomType} design is ready`,
      });

      setSelectedImage(null);
      setImagePreview("");
      setRoomType("");
      setStylePreference("");
      setCustomPrompt("");
      
      await loadDesigns();
      await refreshCredits();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate design",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Home Designer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload a photo of your room and let AI redesign it in your preferred style
          </p>
          <Badge variant="secondary" className="mt-4">
            Your Credits: {typeof credits === 'number' ? credits : credits.credits_remaining} | Cost: 10 credits per design
          </Badge>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Design
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Home className="h-4 w-4 mr-2" />
              My Designs
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Transform Your Space</CardTitle>
                <CardDescription>
                  Upload a photo of your room and choose your preferred style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="room-image">Room Photo *</Label>
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
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <Input
                          id="room-image"
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

                {/* Room Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
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

                  {/* Style Preference */}
                  <div className="space-y-2">
                    <Label htmlFor="stylePreference">Style *</Label>
                    <Select value={stylePreference} onValueChange={setStylePreference}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select design style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="scandinavian">Scandinavian</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="bohemian">Bohemian</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="contemporary">Contemporary</SelectItem>
                        <SelectItem value="rustic">Rustic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="e.g., Add more plants, use warm colors, include a reading nook..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerateDesign}
                  disabled={loading || !selectedImage || !roomType || !stylePreference}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Design...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Generate Design (10 Credits)</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="space-y-6">
              {designs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No designs yet. Create your first one!</p>
                  </CardContent>
                </Card>
              ) : (
                designs.map((design) => (
                  <Card key={design.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="capitalize">
                            {design.style_preference} {design.room_type.replace('-', ' ')}
                          </CardTitle>
                          <CardDescription>
                            {new Date(design.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">10 credits</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Before & After Images */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Original</p>
                          <img 
                            src={design.original_image_url} 
                            alt="Original room"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">AI Redesign</p>
                          <img 
                            src={design.redesigned_image_url} 
                            alt="Redesigned room"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Product Suggestions */}
                      {design.product_suggestions && design.product_suggestions.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Recommended Products
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {design.product_suggestions.map((product: any, idx: number) => (
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

                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Design
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default HomeDesigner;