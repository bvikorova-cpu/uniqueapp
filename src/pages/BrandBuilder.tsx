import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Lightbulb, Share2, Sparkles, Download, Target, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BrandBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useAICredits();
  
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandValues, setBrandValues] = useState("");
  const [brandKits, setBrandKits] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadBrandKits();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadBrandKits = async () => {
    const { data } = await supabase
      .from('brand_kits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setBrandKits(data);
  };

  const handleGenerateBrand = async () => {
    if (!businessName || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and type",
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
          description: "You need 10 credits to generate a brand kit.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-brand-kit', {
        body: {
          businessName,
          businessType,
          targetAudience,
          brandValues
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Brand Kit Generated!",
        description: `Your brand identity for ${businessName} is ready`,
      });

      setBusinessName("");
      setBusinessType("");
      setTargetAudience("");
      setBrandValues("");
      
      await loadBrandKits();
      await refreshCredits();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate brand kit",
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
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Brand Builder
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create a complete professional brand identity with AI-powered logo, colors, slogans, and social media strategy
          </p>
          <Badge variant="secondary" className="mt-4">
            Your Credits: {typeof credits === 'number' ? credits : credits.credits_remaining} | Cost: 10 credits per brand kit
          </Badge>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create">
              <Lightbulb className="h-4 w-4 mr-2" />
              Create Brand Kit
            </TabsTrigger>
            <TabsTrigger value="history">
              <TrendingUp className="h-4 w-4 mr-2" />
              My Brand Kits
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Build Your Brand Identity
                </CardTitle>
                <CardDescription>
                  Tell us about your business and we'll create a complete brand kit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., TechStart Solutions"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., Digital Marketing Agency"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Small business owners, entrepreneurs, startups"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandValues">Brand Values</Label>
                  <Textarea
                    id="brandValues"
                    placeholder="e.g., Innovation, Trust, Transparency, Customer-first approach"
                    value={brandValues}
                    onChange={(e) => setBrandValues(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerateBrand}
                  disabled={loading || !businessName || !businessType}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Your Brand...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Generate Brand Kit (10 Credits)</>
                  )}
                </Button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <Palette className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Logo Design</p>
                  </div>
                  <div className="text-center">
                    <Palette className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Color Palette</p>
                  </div>
                  <div className="text-center">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Slogan & Tagline</p>
                  </div>
                  <div className="text-center">
                    <Share2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Social Strategy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {brandKits.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No brand kits yet. Create your first one!</p>
                  </CardContent>
                </Card>
              ) : (
                brandKits.map((kit) => (
                  <Card key={kit.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{kit.business_name}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {kit.business_type}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {new Date(kit.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Logo */}
                      {kit.logo_url && (
                        <div className="flex justify-center">
                          <img 
                            src={kit.logo_url} 
                            alt={`${kit.business_name} logo`}
                            className="w-48 h-48 object-contain rounded-lg border p-4"
                          />
                        </div>
                      )}

                      {/* Slogan & Tagline */}
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-primary">"{kit.slogan}"</p>
                        <p className="text-muted-foreground italic">{kit.tagline}</p>
                      </div>

                      {/* Color Palette */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Brand Colors
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {kit.color_palette.map((color: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div 
                                className="w-12 h-12 rounded-lg border shadow-sm"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="text-sm">
                                <p className="font-medium">{color.name}</p>
                                <p className="text-muted-foreground">{color.hex}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Media Strategy */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Share2 className="h-5 w-5" />
                          Social Media Strategy
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(kit.social_media_strategy || {}).map(([platform, strategy]) => (
                            <Card key={platform}>
                              <CardContent className="pt-4">
                                <p className="font-medium capitalize mb-2">{platform}</p>
                                <p className="text-sm text-muted-foreground">{strategy as string}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Visual Identity */}
                      <div>
                        <h3 className="font-semibold mb-3">Visual Identity Guidelines</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <p className="font-medium mb-2">Typography</p>
                              <p className="text-sm text-muted-foreground">
                                {kit.visual_identity?.typography || 'Not specified'}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <p className="font-medium mb-2">Imagery Style</p>
                              <p className="text-sm text-muted-foreground">
                                {kit.visual_identity?.imagery || 'Not specified'}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <p className="font-medium mb-2">Brand Tone</p>
                              <p className="text-sm text-muted-foreground">
                                {kit.visual_identity?.tone || 'Not specified'}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Brand Kit (Coming Soon)
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

export default BrandBuilder;