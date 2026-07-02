import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColoringCredits } from "@/hooks/useColoringCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Download, Crown, Sparkles, Upload, Palette, Wand2, LayoutGrid, Trophy, Gem, GraduationCap, Heart, Brush, CheckCircle2, Paintbrush, Users, Printer, Zap } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SchoolsTab } from "@/components/coloring/SchoolsTab";
import { HealthcareTab } from "@/components/coloring/HealthcareTab";
import { CorporateTab } from "@/components/coloring/CorporateTab";
import { ColoringHero } from "@/components/coloring/ColoringHero";
import { TemplateGallery } from "@/components/coloring/TemplateGallery";
import { ColoringCanvas } from "@/components/coloring/ColoringCanvas";
import { AIPromptGenerator } from "@/components/coloring/AIPromptGenerator";
import { BeforeAfterSlider } from "@/components/coloring/BeforeAfterSlider";
import { ColoringStats } from "@/components/coloring/ColoringStats";
import { ColoringFavorites } from "@/components/coloring/ColoringFavorites";
import { AIStyleTransfer } from "@/components/coloring/AIStyleTransfer";
import { CommunityGallery } from "@/components/coloring/CommunityGallery";
import { DailyChallenge } from "@/components/coloring/DailyChallenge";
import { AIColorSuggestions } from "@/components/coloring/AIColorSuggestions";
import { PrintExport } from "@/components/coloring/PrintExport";
import { CreditBanner } from "@/components/kids/CreditBanner";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_COLORINGPAGES_STEPS = [
  { title: 'Generate with AI', desc: 'Describe an idea; AI creates a printable coloring page (3–5 credits).' },
  { title: 'Or pick a template', desc: 'Browse the gallery by theme, age and difficulty.' },
  { title: 'Color in-app or print', desc: 'Use the digital canvas or download a print-ready PDF.' },
  { title: 'Share & compete', desc: 'Post to the community gallery, join challenges, earn badges.' },
  { title: 'School / Corporate', desc: 'Special tabs for schools, healthcare and corporate packs.' }
];
const __HIW_COLORINGPAGES = { title: 'Coloring Pages', intro: 'Generate, print and color AI-crafted coloring pages.', steps: __HIW_COLORINGPAGES_STEPS };

export default function ColoringPages() {
  const navigate = useNavigate();
  const { credits, isLoading: creditsLoading, balance, canUse, costPerUse, purchase, refresh } = useColoringCredits();
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("file");
  const [difficulty, setDifficulty] = useState("medium");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalImageForCompare, setOriginalImageForCompare] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coloringCanvasImage, setColoringCanvasImage] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("coloring-favorites");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "generate";
  const [activeTab, setActiveTab] = useState(initialTab);

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
      let finalImageUrl = imageUrl;
      if (uploadMode === "file" && uploadedFile) {
        setIsUploading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");
          const fileExt = uploadedFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage.from('coloring-images').upload(fileName, uploadedFile, { cacheControl: '3600', upsert: false });
          if (error) throw new Error(`Upload failed: ${error.message}`);
          const { data: { publicUrl } } = supabase.storage.from('coloring-images').getPublicUrl(fileName);
          finalImageUrl = publicUrl;
        } finally { setIsUploading(false); }
      }
      if (!finalImageUrl) throw new Error("No image provided");
      setOriginalImageForCompare(finalImageUrl);
      const { data, error } = await supabase.functions.invoke("generate-coloring-page", { body: { imageUrl: finalImageUrl, difficulty } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.coloringPage.processed_image_url);
      toast.success("Coloring page generated!");
      refetchPages();
      refresh();
      setImageUrl("");
      setUploadedFile(null);
    },
    onError: (error: Error) => {
      if (error.message.includes("Insufficient credits")) {
        toast.error("You need credits to generate coloring pages. Please purchase a plan!");
      } else {
        toast.error("Failed to generate: " + error.message);
      }
    },
  });

  const aiPromptMutation = useMutation({
    mutationFn: async ({ prompt, difficulty: diff }: { prompt: string; difficulty: string }) => {
      setOriginalImageForCompare(null);
      const { data, error } = await supabase.functions.invoke("generate-coloring-page", { body: { prompt, difficulty: diff } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.coloringPage.processed_image_url);
      toast.success("AI coloring page created!");
      refetchPages();
      refresh();
    },
    onError: (error: Error) => {
      toast.error("Failed to generate: " + error.message);
    },
  });

  const buyCreditsPack = async (creditCount: number) => {
    const url = await purchase(creditCount);
    if (url) window.open(url, "_blank");
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFavorite = useCallback((pageId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) { next.delete(pageId); } else { next.add(pageId); }
      localStorage.setItem("coloring-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleTemplateSelect = (prompt: string, diff: string) => {
    setDifficulty(diff);
    aiPromptMutation.mutate({ prompt, difficulty: diff });
  };

  const totalPages = myPages?.length || 0;
  const easyCount = myPages?.filter((p) => p.difficulty === "easy").length || 0;
  const mediumCount = myPages?.filter((p) => p.difficulty === "medium").length || 0;
  const hardCount = myPages?.filter((p) => p.difficulty === "hard").length || 0;
  const creditsDisplay = credits?.credits_remaining ?? 0;

  if (creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <FloatingHowItWorks title={__HIW_COLORINGPAGES.title} intro={__HIW_COLORINGPAGES.intro} steps={__HIW_COLORINGPAGES.steps} />
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <ColoringHero totalPages={totalPages} credits={creditsDisplay} />

        <div className="my-4 flex justify-center">
          <Button size="lg" onClick={() => navigate("/coloring-pages/hub")} className="gap-2">
            <Sparkles className="w-5 h-5" /> Open Coloring Hub (18 new features)
          </Button>
        </div>

        <HeroRewardedAd sectionKey="page_coloringpages" />

        {/* Credit balance banner — paid-only model */}
        <div className="mb-6">
          <CreditBanner
            label="Coloring"
            creditsRemaining={balance}
            costPerUse={costPerUse}
            onBuyCredits={() => buyCreditsPack(100)}
            unitName="page"
          />
        </div>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
             <TabsList className="inline-flex gap-2 sm:grid sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-14 w-max sm:w-full h-auto p-2">
              <TabsTrigger value="generate" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Create
              </TabsTrigger>
              <TabsTrigger value="ai-prompt" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> AI Prompt
              </TabsTrigger>
              <TabsTrigger value="style-transfer" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Paintbrush className="w-3.5 h-3.5" /> Style Transfer
              </TabsTrigger>
              <TabsTrigger value="templates" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" /> Templates
              </TabsTrigger>
              <TabsTrigger value="my-pages" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> My Pages
              </TabsTrigger>
              <TabsTrigger value="community" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Users className="w-3.5 h-3.5" /> Community
              </TabsTrigger>
              <TabsTrigger value="daily" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Challenge
              </TabsTrigger>
              <TabsTrigger value="colors" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Zap className="w-3.5 h-3.5" /> AI Colors
              </TabsTrigger>
              <TabsTrigger value="print" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print
              </TabsTrigger>
              <TabsTrigger value="stats" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Stats
              </TabsTrigger>
              <TabsTrigger value="pricing" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Gem className="w-3.5 h-3.5" /> Pricing
              </TabsTrigger>
              <TabsTrigger value="schools" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Schools
              </TabsTrigger>
              <TabsTrigger value="healthcare" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Healthcare
              </TabsTrigger>
              <TabsTrigger value="corporate" className="px-3 py-2 text-xs whitespace-nowrap gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Corporate
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-pink-500" />
                    </div>
                    Create from Image
                  </CardTitle>
                  <CardDescription>Upload an image or provide a URL to transform into a coloring page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button type="button" variant={uploadMode === "file" ? "default" : "outline"} onClick={() => setUploadMode("file")} className="flex-1">
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Button type="button" variant={uploadMode === "url" ? "default" : "outline"} onClick={() => setUploadMode("url")} className="flex-1">
                      <ImageIcon className="mr-2 h-4 w-4" /> URL
                    </Button>
                  </div>

                  {uploadMode === "file" ? (
                    <div>
                      <Label htmlFor="image-file">Upload Image</Label>
                      <Input id="image-file" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setUploadedFile(file); setImageUrl(""); } }} />
                      {uploadedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {uploadedFile.name}</p>}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="image-url">Image URL</Label>
                      <Input id="image-url" type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setUploadedFile(null); }} />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy — Simple lines</SelectItem>
                        <SelectItem value="medium">Medium — Moderate detail</SelectItem>
                        <SelectItem value="hard">Hard — Intricate details</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => generateMutation.mutate()} disabled={(!imageUrl && !uploadedFile) || generateMutation.isPending || isUploading} className="w-full h-12">
                    {generateMutation.isPending || isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isUploading ? "Uploading..." : "Generating..."}</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Generate Coloring Page</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Result / Before-After */}
              <div className="space-y-4">
                {generatedImage && originalImageForCompare && (
                  <BeforeAfterSlider beforeUrl={originalImageForCompare} afterUrl={generatedImage} />
                )}
                {generatedImage && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Generated Coloring Page</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <img src={generatedImage} alt="Generated coloring page" className="w-full rounded-lg" />
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => handleDownload(generatedImage, "coloring-page.png")}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => { setColoringCanvasImage(generatedImage); setActiveTab("color-online"); }}>
                          <Brush className="mr-2 h-4 w-4" /> Color Online
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {!generatedImage && (
                  <Card className="flex items-center justify-center min-h-[300px]">
                    <CardContent className="text-center text-muted-foreground py-12">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Your coloring page will appear here</p>
                      <p className="text-sm">Upload an image or use AI Prompt to get started</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Prompt Tab */}
          <TabsContent value="ai-prompt" className="space-y-6">
            <AIPromptGenerator
              onGenerate={(prompt, _style, diff) => aiPromptMutation.mutate({ prompt, difficulty: diff })}
              isGenerating={aiPromptMutation.isPending}
            />
            {generatedImage && (
              <Card>
                <CardHeader><CardTitle className="text-sm">AI Generated Result</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <img src={generatedImage} alt="AI coloring page" className="w-full rounded-lg max-w-md mx-auto" />
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Button className="flex-1" onClick={() => handleDownload(generatedImage, "ai-coloring-page.png")}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setColoringCanvasImage(generatedImage); setActiveTab("color-online"); }}>
                      <Brush className="mr-2 h-4 w-4" /> Color Online
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <TemplateGallery onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          {/* My Pages Tab */}
          <TabsContent value="my-pages">
            <ColoringFavorites
              pages={myPages || []}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onColorOnline={(url) => { setColoringCanvasImage(url); setActiveTab("color-online"); }}
            />
          </TabsContent>

          {/* Color Online (hidden tab triggered by button) */}
          <TabsContent value="color-online" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Color Online</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("my-pages")}>
                ← Back to My Pages
              </Button>
            </div>
            {coloringCanvasImage ? (
              <ColoringCanvas imageUrl={coloringCanvasImage} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>Select a coloring page to start painting! Go to "My Pages" or generate one first.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <ColoringStats
              totalPages={totalPages}
              easyCount={easyCount}
              mediumCount={mediumCount}
              hardCount={hardCount}
              favoriteCount={favoriteIds.size}
            />
          </TabsContent>

          {/* Pricing Tab — credit packs (paid-only model) */}
          <TabsContent value="pricing">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Each coloring page costs <strong>{costPerUse}</strong> credits. Buy a pack — credits never expire.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { credits: 25, label: "Starter", desc: "5 coloring pages", popular: false },
                { credits: 100, label: "Family", desc: "20 coloring pages · best value", popular: true },
                { credits: 500, label: "Studio", desc: "100 coloring pages · bulk discount", popular: false },
              ].map((pack) => {
                const pages = Math.floor(pack.credits / costPerUse);
                const price = (pack.credits * 0.5).toFixed(2);
                return (
                  <Card
                    key={pack.credits}
                    className={`backdrop-blur-xl bg-card/80 transition-all ${pack.popular ? "border-primary border-2 shadow-xl shadow-primary/10 relative" : "border-border/30 hover:border-primary/20"}`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          {pack.popular ? <Crown className="h-4 w-4 text-amber-500" /> : <Sparkles className="h-4 w-4 text-purple-500" />}
                        </div>
                        {pack.label}
                      </CardTitle>
                      <CardDescription>{pack.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-black">€{price}</p>
                        <p className="text-sm text-muted-foreground">{pack.credits} credits · ≈ {pages} pages</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> HD Quality (1024x1024)</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No watermark · PNG + PDF</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Credits never expire</li>
                      </ul>
                      <Button
                        onClick={() => buyCreditsPack(pack.credits)}
                        className="w-full"
                        variant={pack.popular ? "default" : "outline"}
                      >
                        Buy {pack.credits} credits
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Style Transfer Tab */}
          <TabsContent value="style-transfer">
            <AIStyleTransfer onColorOnline={(url) => { setColoringCanvasImage(url); setActiveTab("color-online"); }} />
          </TabsContent>

          {/* Community Gallery Tab */}
          <TabsContent value="community">
            <CommunityGallery />
          </TabsContent>

          {/* Daily Challenge Tab */}
          <TabsContent value="daily">
            <DailyChallenge />
          </TabsContent>

          {/* AI Color Suggestions Tab */}
          <TabsContent value="colors">
            <AIColorSuggestions />
          </TabsContent>

          {/* Print Export Tab */}
          <TabsContent value="print">
            <PrintExport />
          </TabsContent>

          <TabsContent value="schools"><SchoolsTab /></TabsContent>
          <TabsContent value="healthcare"><HealthcareTab /></TabsContent>
          <TabsContent value="corporate"><CorporateTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
