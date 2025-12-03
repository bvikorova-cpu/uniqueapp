import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreativeForgeCredits, CREDIT_COSTS, CreativeCategory } from "@/hooks/useCreativeForgeCredits";
import { useQuery } from "@tanstack/react-query";
import { 
  Music, 
  Film, 
  Theater, 
  BookOpen, 
  Feather, 
  Mic2, 
  Podcast, 
  Megaphone,
  Sparkles,
  Download,
  Copy,
  Star,
  History,
  CreditCard,
  Loader2,
  RefreshCw,
  ArrowLeft
} from "lucide-react";

const CATEGORIES = [
  { id: "song_lyrics", name: "Song Lyrics", icon: Music, description: "Professional song lyrics with verses, chorus, bridge" },
  { id: "screenplay", name: "Screenplay", icon: Film, description: "Hollywood-format screenplays and scenes" },
  { id: "theater_play", name: "Theater Play", icon: Theater, description: "Stage plays with directions and dialogue" },
  { id: "novel_chapter", name: "Novel Chapter", icon: BookOpen, description: "Compelling prose and storytelling" },
  { id: "poetry", name: "Poetry", icon: Feather, description: "Beautiful poems in various forms" },
  { id: "standup", name: "Stand-up Comedy", icon: Mic2, description: "Comedy routines with setups and punchlines" },
  { id: "podcast_script", name: "Podcast Script", icon: Podcast, description: "Engaging podcast episodes and segments" },
  { id: "ad_copy", name: "Ad Copy", icon: Megaphone, description: "Persuasive advertising content" },
];

const CREDIT_PACKAGES = [
  { credits: 30, price: 8, label: "Starter" },
  { credits: 75, price: 18, label: "Creator" },
  { credits: 150, price: 32, label: "Professional", popular: true },
  { credits: 400, price: 75, label: "Studio" },
];

const STYLE_REFERENCES = {
  song_lyrics: ["Ed Sheeran", "Taylor Swift", "The Beatles", "Bob Dylan", "Adele", "Billie Eilish"],
  screenplay: ["Aaron Sorkin", "Quentin Tarantino", "Nora Ephron", "Christopher Nolan", "Greta Gerwig"],
  theater_play: ["Shakespeare", "Arthur Miller", "Tennessee Williams", "Lin-Manuel Miranda", "August Wilson"],
  novel_chapter: ["Stephen King", "J.K. Rowling", "George R.R. Martin", "Agatha Christie", "Ernest Hemingway"],
  poetry: ["Maya Angelou", "Robert Frost", "Emily Dickinson", "Pablo Neruda", "Rupi Kaur"],
  standup: ["Dave Chappelle", "John Mulaney", "Ali Wong", "Bo Burnham", "Hannah Gadsby"],
  podcast_script: ["Joe Rogan", "Brené Brown", "Tim Ferriss", "Ira Glass", "Conan O'Brien"],
  ad_copy: ["David Ogilvy", "Apple Style", "Nike Style", "Old Spice Style", "Wendy's Style"],
};

export default function CreativeForge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { credits, isLoading: creditsLoading, purchaseCredits, verifyPayment, refreshCredits } = useCreativeForgeCredits();
  
  const [activeTab, setActiveTab] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory>("song_lyrics");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [characters, setCharacters] = useState("");
  const [setting, setSetting] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [styleReference, setStyleReference] = useState("");
  const [contentLength, setContentLength] = useState("medium");

  // Fetch projects history
  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ["creative-forge-projects"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("creative_forge_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Handle payment success
  useEffect(() => {
    const payment = searchParams.get("payment");
    const creditsParam = searchParams.get("credits");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && creditsParam) {
      const addCredits = async () => {
        try {
          if (sessionId) {
            await verifyPayment(sessionId, parseInt(creditsParam));
          }
          toast({
            title: "Payment Successful!",
            description: `${creditsParam} credits have been added to your account.`,
          });
          refreshCredits();
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      };
      addCredits();
      navigate("/creative-forge", { replace: true });
    } else if (payment === "canceled") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled.",
        variant: "destructive",
      });
      navigate("/creative-forge", { replace: true });
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title or theme", variant: "destructive" });
      return;
    }

    const cost = CREDIT_COSTS[selectedCategory];
    if ((credits?.credits_remaining || 0) < cost) {
      toast({ 
        title: "Insufficient Credits", 
        description: `You need ${cost} credits. Please purchase more.`,
        variant: "destructive" 
      });
      setActiveTab("credits");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", {
        body: {
          category: selectedCategory,
          title,
          inputData: {
            genre,
            mood,
            description,
            characters,
            setting,
            targetAudience,
            length: contentLength,
          },
          styleReference,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      refreshCredits();
      refetchProjects();
      
      toast({
        title: "Content Generated!",
        description: `Used ${data.creditsUsed} credits. ${data.creditsRemaining} remaining.`,
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevision = async (originalContent: string, revisionNotes: string) => {
    if ((credits?.credits_remaining || 0) < CREDIT_COSTS.revision) {
      toast({ 
        title: "Insufficient Credits", 
        description: `You need ${CREDIT_COSTS.revision} credits for revision.`,
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", {
        body: {
          category: selectedCategory,
          title,
          inputData: { revisionNotes },
          isRevision: true,
          originalContent,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      refreshCredits();
      refetchProjects();
      
      toast({
        title: "Revision Complete!",
        description: `Used ${data.creditsUsed} credits.`,
      });
    } catch (error: any) {
      toast({
        title: "Revision Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchase = async (creditAmount: number) => {
    const url = await purchaseCredits(creditAmount);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Content saved to file" });
  };

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              CreativeForge
            </h1>
            <p className="text-muted-foreground mt-1">AI-Powered Creative Writing Studio</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            {creditsLoading ? "..." : credits?.credits_remaining || 0} Credits
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Credits
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Category Selection */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Content Type</CardTitle>
                  <CardDescription>Choose what you want to create</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.id;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id as CreativeCategory)}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{category.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {CREDIT_COSTS[category.id as CreativeCategory]} cr
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Input Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedCategoryData && <selectedCategoryData.icon className="h-5 w-5" />}
                    {selectedCategoryData?.name}
                  </CardTitle>
                  <CardDescription>Describe your creative vision</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title / Theme *</Label>
                    <Input 
                      placeholder="Enter the main theme or title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Genre / Style</Label>
                    <Input 
                      placeholder="e.g., Romance, Thriller, Comedy..."
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Mood / Tone</Label>
                    <Input 
                      placeholder="e.g., Melancholic, Upbeat, Dark..."
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Describe what you want in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {(selectedCategory === "screenplay" || selectedCategory === "theater_play" || selectedCategory === "novel_chapter") && (
                    <>
                      <div>
                        <Label>Characters</Label>
                        <Input 
                          placeholder="Main characters and their traits..."
                          value={characters}
                          onChange={(e) => setCharacters(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Setting</Label>
                        <Input 
                          placeholder="Time and place..."
                          value={setting}
                          onChange={(e) => setSetting(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Style Reference (Optional)</Label>
                    <Select value={styleReference} onValueChange={setStyleReference}>
                      <SelectTrigger>
                        <SelectValue placeholder="Write in the style of..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific style</SelectItem>
                        {STYLE_REFERENCES[selectedCategory]?.map((ref) => (
                          <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Content Length</Label>
                    <Select value={contentLength} onValueChange={setContentLength}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !title.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate ({CREDIT_COSTS[selectedCategory]} credits)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Content</CardTitle>
                  <CardDescription>Your AI-created masterpiece</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[350px] border rounded-lg p-4 bg-muted/30">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{generatedContent}</pre>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(generatedContent)}
                          className="flex-1"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadContent(generatedContent, `${selectedCategory}-${title}`)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      <div className="pt-2 border-t">
                        <Label className="text-xs">Request Revision (3 credits)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input 
                            placeholder="What should be changed..."
                            id="revision-notes"
                            className="text-sm"
                          />
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => {
                              const notes = (document.getElementById("revision-notes") as HTMLInputElement)?.value;
                              if (notes) handleRevision(generatedContent, notes);
                            }}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your generated content will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Previously generated content</CardDescription>
              </CardHeader>
              <CardContent>
                {projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project: any) => {
                      const category = CATEGORIES.find(c => c.id === project.category);
                      const Icon = category?.icon || Sparkles;
                      return (
                        <Card key={project.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{project.title}</h4>
                                <Badge variant="outline" className="text-xs">{category?.name}</Badge>
                                <Badge variant="secondary" className="text-xs">{project.credits_used} cr</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(project.created_at).toLocaleDateString()}
                              </p>
                              <ScrollArea className="h-24 border rounded p-2 bg-muted/30">
                                <pre className="whitespace-pre-wrap text-xs font-mono">
                                  {project.generated_content?.substring(0, 500)}...
                                </pre>
                              </ScrollArea>
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(project.generated_content)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => downloadContent(project.generated_content, project.title)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet. Start creating!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Packages</CardTitle>
                  <CardDescription>Purchase credits to create content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div 
                        key={pkg.credits}
                        className={`p-4 border rounded-lg flex items-center justify-between ${
                          pkg.popular ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{pkg.credits} Credits</span>
                            {pkg.popular && <Badge>Most Popular</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{pkg.label} Package</p>
                        </div>
                        <Button onClick={() => handlePurchase(pkg.credits)}>
                          €{pkg.price}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Costs</CardTitle>
                  <CardDescription>How many credits each type costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <Badge variant="secondary">{CREDIT_COSTS[category.id as CreativeCategory]} credits</Badge>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between p-2 border rounded border-dashed">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Revision</span>
                      </div>
                      <Badge variant="outline">{CREDIT_COSTS.revision} credits</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
