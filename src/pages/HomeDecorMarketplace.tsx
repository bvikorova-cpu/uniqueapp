import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Maximize2, ShoppingBag, Eye, Upload, Wand2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DESIGN_STYLES = [
  { id: "minimalist", name: "Minimalist", emoji: "⚪" },
  { id: "bohemian", name: "Bohemian", emoji: "🌸" },
  { id: "industrial", name: "Industrial", emoji: "🏭" },
  { id: "scandinavian", name: "Scandinavian", emoji: "🌲" },
  { id: "modern", name: "Modern", emoji: "✨" },
  { id: "vintage", name: "Vintage", emoji: "🕰️" },
];

const SUBSCRIPTION_PLAN = {
  name: "Pro Designer",
  price: 7.99,
  features: [
    "50 AI room designs per month",
    "Unlimited saved projects",
    "Priority support",
    "Advanced style filters",
    "HD renders"
  ]
};

export default function HomeDecorMarketplace() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useState(() => {
    checkAuth();
  });

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleUploadRoom = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to use AI Room Designer",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    toast({
      title: "Coming Soon",
      description: "AI Room Designer feature will be available soon!",
    });
  };

  const handleARPreview = () => {
    toast({
      title: "AR Preview",
      description: "AR Try-before-buy (€0.99) coming soon!",
    });
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    toast({
      title: "Coming Soon",
      description: "Pro Designer subscription will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Home Decor Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered inspiration meets stunning decorations
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={handleUploadRoom}>
              <Camera className="mr-2 h-5 w-5" />
              Design Your Room
            </Button>
            <Button size="lg" variant="outline">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Marketplace
            </Button>
          </div>
        </div>

        {/* Subscription Plan */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{SUBSCRIPTION_PLAN.name}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                €{SUBSCRIPTION_PLAN.price}/month
              </Badge>
            </div>
            <CardDescription>Unlock unlimited AI-powered design possibilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3">
                {SUBSCRIPTION_PLAN.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center">
                <Button size="lg" className="w-full md:w-auto" onClick={handleSubscribe}>
                  Subscribe Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ai-designer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-designer">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Designer
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="ar-preview">
              <Eye className="h-4 w-4 mr-2" />
              AR Preview
            </TabsTrigger>
          </TabsList>

          {/* AI Room Designer */}
          <TabsContent value="ai-designer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Room Designer</CardTitle>
                <CardDescription>
                  Upload a photo of your room and let AI create stunning design suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer bg-gradient-to-br from-secondary/20 to-transparent">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload Your Room Photo</h3>
                  <p className="text-muted-foreground mb-4">
                    Take a photo of your space and watch AI transform it
                  </p>
                  <Button onClick={handleUploadRoom}>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>

                {/* Style Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Choose Your Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {DESIGN_STYLES.map((style) => (
                      <Card
                        key={style.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedStyle === style.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-2">{style.emoji}</div>
                          <p className="text-sm font-medium">{style.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shoppable Marketplace</CardTitle>
                <CardDescription>
                  Browse curated decorations and click to buy all items in styled rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground group-hover:scale-110 transition-transform" />
                        </div>
                        <Badge className="absolute top-2 right-2">15% commission</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">Styled Room #{item}</h4>
                        <p className="text-sm text-muted-foreground">Click to shop all items</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AR Preview */}
          <TabsContent value="ar-preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AR Try-Before-Buy</CardTitle>
                <CardDescription>
                  See how decorations look in your actual room using augmented reality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12 space-y-4">
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <Maximize2 className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Preview in Your Space</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Use your phone camera to place virtual decorations in your room before buying
                  </p>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Badge variant="secondary" className="text-base px-4 py-2">€0.99 per preview</Badge>
                  </div>
                  <Button size="lg" onClick={handleARPreview}>
                    <Eye className="mr-2 h-5 w-5" />
                    Try AR Preview
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-6 border-t">
                  <div className="text-center space-y-2">
                    <div className="text-3xl mb-2">📱</div>
                    <h4 className="font-semibold">Use Your Camera</h4>
                    <p className="text-sm text-muted-foreground">Point at your room</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl mb-2">🎨</div>
                    <h4 className="font-semibold">Place Virtually</h4>
                    <p className="text-sm text-muted-foreground">See it in your space</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl mb-2">✅</div>
                    <h4 className="font-semibold">Buy with Confidence</h4>
                    <p className="text-sm text-muted-foreground">Know it fits perfectly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Wand2 className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart design suggestions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Eye className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">AR Preview</h3>
              <p className="text-sm text-muted-foreground">See before you buy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Shoppable Feed</h3>
              <p className="text-sm text-muted-foreground">Click to buy instantly</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Curated Styles</h3>
              <p className="text-sm text-muted-foreground">All design aesthetics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
