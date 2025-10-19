import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColoringCredits } from "@/hooks/useColoringCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Download, Crown, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ColoringPages() {
  const navigate = useNavigate();
  const { credits, isLoading: creditsLoading, checkSubscription } = useColoringCredits();
  const [imageUrl, setImageUrl] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { data: myPages, refetch: refetchPages } = useQuery({
    queryKey: ["my-coloring-pages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coloring_pages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-coloring-page", {
        body: { imageUrl, difficulty },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.coloringPage.processed_image_url);
      toast.success("Coloring page generated!");
      refetchPages();
      checkSubscription();
    },
    onError: (error: Error) => {
      if (error.message.includes("Insufficient credits")) {
        toast.error("You need credits to generate coloring pages. Please purchase a plan!");
      } else {
        toast.error("Failed to generate: " + error.message);
      }
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const { data, error } = await supabase.functions.invoke(
        "create-coloring-subscription",
        { body: { tier } }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
    onError: (error: Error) => {
      toast.error("Failed to create subscription: " + error.message);
    },
  });

  const payPerUseMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-coloring-payment");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
    onError: (error: Error) => {
      toast.error("Failed to create payment: " + error.message);
    },
  });

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">AI Coloring Page Generator</h1>
          <p className="text-lg text-muted-foreground">
            Transform any image into a beautiful coloring page
          </p>
        </div>

        {/* Credits Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Credits</CardTitle>
            <CardDescription>
              Current Plan: <span className="font-semibold capitalize">{credits?.tier || 'None'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {credits?.tier === 'premium' 
                    ? 'Unlimited' 
                    : credits?.credits_remaining || 0} Credits
                </p>
                {credits?.expires_at && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(credits.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button onClick={() => checkSubscription()} variant="outline">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="my-pages">My Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Coloring Page</CardTitle>
                <CardDescription>
                  Upload an image URL and choose difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Simple lines</SelectItem>
                      <SelectItem value="medium">Medium - Moderate detail</SelectItem>
                      <SelectItem value="hard">Hard - Intricate details</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={!imageUrl || generateMutation.isPending}
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Coloring Page
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Coloring Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={generatedImage} alt="Generated coloring page" className="w-full rounded-lg mb-4" />
                  <Button onClick={() => handleDownload(generatedImage, "coloring-page.png")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pay Per Use */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Pay Per Use
                  </CardTitle>
                  <CardDescription>Perfect for occasional use</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">2€</p>
                    <p className="text-sm text-muted-foreground">per coloring page</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ HD Quality (1024x1024)</li>
                    <li>✓ No watermark</li>
                    <li>✓ PNG + PDF formats</li>
                  </ul>
                  <Button 
                    onClick={() => payPerUseMutation.mutate()}
                    disabled={payPerUseMutation.isPending}
                    className="w-full"
                  >
                    Buy 1 Credit
                  </Button>
                </CardContent>
              </Card>

              {/* Basic */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Basic
                  </CardTitle>
                  <CardDescription>Great for regular users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">5€</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 20 HD coloring pages/month</li>
                    <li>✓ No watermark</li>
                    <li>✓ PNG + PDF formats</li>
                    <li>✓ Custom templates</li>
                  </ul>
                  <Button 
                    onClick={() => subscribeMutation.mutate('basic')}
                    disabled={subscribeMutation.isPending}
                    className="w-full"
                  >
                    Subscribe
                  </Button>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Premium
                  </CardTitle>
                  <CardDescription>For power users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">12€</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ UNLIMITED Ultra HD (2048x2048)</li>
                    <li>✓ All formats (PNG, PDF, SVG)</li>
                    <li>✓ Bulk download</li>
                    <li>✓ Priority processing</li>
                    <li>✓ Custom branding</li>
                  </ul>
                  <Button 
                    onClick={() => subscribeMutation.mutate('premium')}
                    disabled={subscribeMutation.isPending}
                    className="w-full"
                  >
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-pages">
            <div className="grid md:grid-cols-3 gap-6">
              {myPages?.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">
                      {page.difficulty} Difficulty
                    </CardTitle>
                    <CardDescription>
                      {new Date(page.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {page.processed_image_url && (
                      <>
                        <img 
                          src={page.processed_image_url} 
                          alt="Coloring page" 
                          className="w-full rounded-lg mb-4"
                        />
                        <Button
                          onClick={() => handleDownload(
                            page.processed_image_url, 
                            `coloring-${page.id}.png`
                          )}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
