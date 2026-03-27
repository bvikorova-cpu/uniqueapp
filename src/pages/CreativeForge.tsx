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
  Sparkles, Download, Copy, Star, History, CreditCard, Loader2, RefreshCw,
  Music, Film, Theater, BookOpen, Feather, Mic2, Podcast, Megaphone
} from "lucide-react";
import { ForgeHero } from "@/components/creative-forge/ForgeHero";
import { ForgeCategorySelector, CATEGORIES } from "@/components/creative-forge/ForgeCategorySelector";
import { ForgeTemplates, QuickTemplate } from "@/components/creative-forge/ForgeTemplates";
import { ForgeCreditPackages } from "@/components/creative-forge/ForgeCreditPackages";

const STYLE_REFERENCES: Record<string, string[]> = {
  song_lyrics: ["Ed Sheeran", "Taylor Swift", "The Beatles", "Bob Dylan", "Adele", "Billie Eilish"],
  screenplay: ["Aaron Sorkin", "Quentin Tarantino", "Nora Ephron", "Christopher Nolan", "Greta Gerwig"],
  theater_play: ["Shakespeare", "Arthur Miller", "Tennessee Williams", "Lin-Manuel Miranda", "August Wilson"],
  novel_chapter: ["Stephen King", "J.K. Rowling", "George R.R. Martin", "Agatha Christie", "Ernest Hemingway"],
  poetry: ["Maya Angelou", "Robert Frost", "Emily Dickinson", "Pablo Neruda", "Rupi Kaur"],
  standup: ["Dave Chappelle", "John Mulaney", "Ali Wong", "Bo Burnham", "Hannah Gadsby"],
  podcast_script: ["Joe Rogan", "Brené Brown", "Tim Ferriss", "Ira Glass", "Conan O'Brien"],
  ad_copy: ["David Ogilvy", "Apple Style", "Nike Style", "Old Spice Style", "Wendy's Style"],
};

const ICON_MAP: Record<string, any> = {
  song_lyrics: Music, screenplay: Film, theater_play: Theater, novel_chapter: BookOpen,
  poetry: Feather, standup: Mic2, podcast_script: Podcast, ad_copy: Megaphone,
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
  const [previousContent, setPreviousContent] = useState<string | null>(null);

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

  // History filter
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

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

  useEffect(() => {
    const payment = searchParams.get("payment");
    const creditsParam = searchParams.get("credits");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && creditsParam) {
      const addCredits = async () => {
        try {
          if (sessionId) await verifyPayment(sessionId, parseInt(creditsParam));
          toast({ title: "Payment Successful!", description: `${creditsParam} credits added.` });
          refreshCredits();
        } catch (error) { console.error("Error verifying payment:", error); }
      };
      addCredits();
      navigate("/creative-forge", { replace: true });
    } else if (payment === "canceled") {
      toast({ title: "Payment Canceled", description: "Your payment was canceled.", variant: "destructive" });
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
      toast({ title: "Insufficient Credits", description: `You need ${cost} credits.`, variant: "destructive" });
      setActiveTab("credits");
      return;
    }
    setIsGenerating(true);
    if (generatedContent) setPreviousContent(generatedContent);
    setGeneratedContent(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", {
        body: {
          category: selectedCategory, title,
          inputData: { genre, mood, description, characters, setting, targetAudience, length: contentLength },
          styleReference: styleReference === "none" ? "" : styleReference,
        },
      });
      if (error) throw error;
      setGeneratedContent(data.content);
      refreshCredits();
      refetchProjects();
      toast({ title: "Content Generated!", description: `Used ${data.creditsUsed} credits. ${data.creditsRemaining} remaining.` });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({ title: "Generation Failed", description: error.message || "Failed to generate content", variant: "destructive" });
    } finally { setIsGenerating(false); }
  };

  const handleRevision = async (originalContent: string, revisionNotes: string) => {
    if ((credits?.credits_remaining || 0) < CREDIT_COSTS.revision) {
      toast({ title: "Insufficient Credits", description: `You need ${CREDIT_COSTS.revision} credits.`, variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setPreviousContent(originalContent);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", {
        body: { category: selectedCategory, title, inputData: { revisionNotes }, isRevision: true, originalContent },
      });
      if (error) throw error;
      setGeneratedContent(data.content);
      refreshCredits();
      refetchProjects();
      toast({ title: "Revision Complete!", description: `Used ${data.creditsUsed} credits.` });
    } catch (error: any) {
      toast({ title: "Revision Failed", description: error.message, variant: "destructive" });
    } finally { setIsGenerating(false); }
  };

  const handlePurchase = async (creditAmount: number) => {
    const url = await purchaseCredits(creditAmount);
    if (url) window.open(url, "_blank");
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

  const applyTemplate = (t: QuickTemplate) => {
    setTitle(t.title);
    setGenre(t.genre);
    setMood(t.mood);
    setDescription(t.description);
    setCharacters(t.characters);
    setSetting(t.setting);
    setStyleReference(t.styleReference);
    toast({ title: "Template Applied", description: `"${t.label}" loaded — customize and generate!` });
  };

  const shareContent = (content: string, title: string) => {
    if (navigator.share) {
      navigator.share({ title: `CreativeForge: ${title}`, text: content }).catch(() => {});
    } else {
      copyToClipboard(content);
    }
  };

  const filteredProjects = (projects || []).filter((p: any) => {
    if (historyFilter !== "all" && p.category !== historyFilter) return false;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.generated_content?.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <ForgeHero credits={credits?.credits_remaining || 0} creditsLoading={creditsLoading} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="create" className="gap-2"><Sparkles className="h-4 w-4" /> Create</TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> History</TabsTrigger>
            <TabsTrigger value="credits" className="gap-2"><CreditCard className="h-4 w-4" /> Credits</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            {/* Category Selection */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Choose Content Type</h2>
              <ForgeCategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            {/* Templates */}
            <ForgeTemplates category={selectedCategory} onApply={applyTemplate} />

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedCategoryData && <span className="text-xl">{CATEGORIES.find(c => c.id === selectedCategory)?.emoji}</span>}
                    {selectedCategoryData?.name}
                  </CardTitle>
                  <CardDescription>Describe your creative vision</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Title / Theme *</Label>
                    <Input placeholder="Enter the main theme or title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Genre / Style</Label>
                      <Input placeholder="e.g., Romance, Thriller..." value={genre} onChange={(e) => setGenre(e.target.value)} />
                    </div>
                    <div>
                      <Label>Mood / Tone</Label>
                      <Input placeholder="e.g., Melancholic, Upbeat..." value={mood} onChange={(e) => setMood(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Describe what you want in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>

                  {(selectedCategory === "screenplay" || selectedCategory === "theater_play" || selectedCategory === "novel_chapter") && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Characters</Label>
                        <Input placeholder="Main characters..." value={characters} onChange={(e) => setCharacters(e.target.value)} />
                      </div>
                      <div>
                        <Label>Setting</Label>
                        <Input placeholder="Time and place..." value={setting} onChange={(e) => setSetting(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {selectedCategory === "ad_copy" && (
                    <div>
                      <Label>Target Audience</Label>
                      <Input placeholder="Who is this for..." value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Style Reference</Label>
                      <Select value={styleReference} onValueChange={setStyleReference}>
                        <SelectTrigger><SelectValue placeholder="Write in the style of..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific style</SelectItem>
                          {STYLE_REFERENCES[selectedCategory]?.map((ref) => (
                            <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Content Length</Label>
                      <Select value={contentLength} onValueChange={setContentLength}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleGenerate} disabled={isGenerating || !title.trim()} className="w-full" size="lg">
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate ({CREDIT_COSTS[selectedCategory]} credits)</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Generated Content</CardTitle>
                  <CardDescription>Your AI-created masterpiece</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-3">
                      {/* Side-by-side compare */}
                      {previousContent && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => { setGeneratedContent(previousContent); setPreviousContent(null); }}>
                            ← Previous Version
                          </Button>
                          <Badge variant="secondary" className="flex items-center justify-center text-xs">Current Version</Badge>
                        </div>
                      )}
                      <ScrollArea className="h-[300px] border rounded-xl p-4 bg-muted/20">
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedContent}</pre>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)} className="flex-1">
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadContent(generatedContent, `${selectedCategory}-${title}`)} className="flex-1">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => shareContent(generatedContent, title)} className="flex-1">
                          <Star className="mr-1.5 h-3.5 w-3.5" /> Share
                        </Button>
                      </div>
                      <div className="pt-2 border-t">
                        <Label className="text-xs">Request Revision ({CREDIT_COSTS.revision} credits)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input placeholder="What should be changed..." id="revision-notes" className="text-sm" />
                          <Button size="sm" variant="secondary"
                            onClick={() => {
                              const notes = (document.getElementById("revision-notes") as HTMLInputElement)?.value;
                              if (notes) handleRevision(generatedContent, notes);
                            }}
                            disabled={isGenerating}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">Select a template or describe your vision</p>
                        <p className="text-xs text-muted-foreground mt-1">Generated content will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Previously generated content</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <Input placeholder="Search projects..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="flex-1" />
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProjects.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProjects.map((project: any) => {
                      const category = CATEGORIES.find(c => c.id === project.category);
                      const Icon = ICON_MAP[project.category] || Sparkles;
                      return (
                        <Card key={project.id} className="p-4 border-border/50">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium text-sm">{project.title}</h4>
                                <Badge variant="outline" className="text-xs">{category?.name}</Badge>
                                <Badge variant="secondary" className="text-xs">{project.credits_used} cr</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(project.created_at).toLocaleDateString()}
                              </p>
                              <ScrollArea className="h-20 border rounded-lg p-2 bg-muted/20">
                                <pre className="whitespace-pre-wrap text-xs font-mono">{project.generated_content?.substring(0, 500)}...</pre>
                              </ScrollArea>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(project.generated_content)}>
                                  <Copy className="h-3 w-3 mr-1" /> Copy
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadContent(project.generated_content, project.title)}>
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => shareContent(project.generated_content, project.title)}>
                                  <Star className="h-3 w-3 mr-1" /> Share
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
                    <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">{historySearch || historyFilter !== "all" ? "No matching projects" : "No projects yet. Start creating!"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <ForgeCreditPackages onPurchase={handlePurchase} />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Credit Costs</CardTitle>
                <CardDescription>How many credits each content type uses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2.5 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{CREDIT_COSTS[category.id as CreativeCategory]} credits</Badge>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2.5 border border-dashed border-border/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Revision</span>
                    </div>
                    <Badge variant="outline">{CREDIT_COSTS.revision} credits</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
