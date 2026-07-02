import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Music, Film, Theater, BookOpen, Feather, Mic2, Podcast, Megaphone, ArrowLeft
} from "lucide-react";
import { ForgeHero } from "@/components/creative-forge/ForgeHero";
import { CATEGORIES } from "@/components/creative-forge/ForgeCategorySelector";
import { ForgeTemplates, QuickTemplate } from "@/components/creative-forge/ForgeTemplates";
import { ForgeCreditPackages } from "@/components/creative-forge/ForgeCreditPackages";
import { ForgeStreak } from "@/components/creative-forge/ForgeStreak";
import { ForgeProgressPreview } from "@/components/creative-forge/ForgeProgressPreview";
import { ForgeAchievements } from "@/components/creative-forge/ForgeAchievements";
import { ForgeToolCard } from "@/components/creative-forge/ForgeToolCard";
import { ForgeTestimonials } from "@/components/creative-forge/ForgeTestimonials";
import { ForgeCowriterChat } from "@/components/creative-forge/ForgeCowriterChat";
import { ForgeStyleTransfer } from "@/components/creative-forge/ForgeStyleTransfer";
import { ForgeVoiceToScript } from "@/components/creative-forge/ForgeVoiceToScript";
import { ForgeRooms } from "@/components/creative-forge/ForgeRooms";
import { ForgeIdeasShowcase } from "@/components/creative-forge/ForgeIdeasShowcase";
import { ForgeBrandVoice, type BrandVoice } from "@/components/creative-forge/ForgeBrandVoice";
import { ForgeStoryBible } from "@/components/creative-forge/ForgeStoryBible";
import { ForgeAIStudio } from "@/components/creative-forge/ForgeAIStudio";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import { Wand2, Mic, Users, Palette, BookMarked, Sparkles as SparkleIcon, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportAs } from "@/lib/forgeExport";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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

// NOTE: `credits` here MUST match the backend CREDIT_COSTS in
// supabase/functions/generate-creative-content/index.ts. Do not change one without the other.
const FORGE_TOOLS = [
  { id: "song_lyrics", name: "Song Lyrics", icon: Music, description: "Professional lyrics with verses, chorus & bridge structure", color: "from-pink-500 to-rose-600", features: ["Verse/Chorus/Bridge", "Style references", "Multiple genres", "Rhyme schemes", "Emotional depth"], credits: CREDIT_COSTS.song_lyrics },
  { id: "screenplay", name: "Screenplay", icon: Film, description: "Hollywood-format scripts with scenes & dialogue", color: "from-amber-500 to-orange-600", features: ["Proper formatting", "Scene headings", "Character dialogue", "Stage directions", "Style references"], credits: CREDIT_COSTS.screenplay },
  { id: "theater_play", name: "Theater Play", icon: Theater, description: "Stage plays with stage directions & acts", color: "from-violet-500 to-purple-600", features: ["Act structure", "Stage directions", "Character arcs", "Dramatic tension", "Monologues"], credits: CREDIT_COSTS.theater_play },
  { id: "novel_chapter", name: "Novel Chapter", icon: BookOpen, description: "Compelling prose, rich world-building & storytelling", color: "from-emerald-500 to-green-600", features: ["Rich prose", "World building", "Character development", "Plot hooks", "Multiple genres"], credits: CREDIT_COSTS.novel_chapter },
  { id: "poetry", name: "Poetry", icon: Feather, description: "Poems in sonnets, haiku, free verse & more", color: "from-sky-500 to-cyan-600", features: ["Multiple forms", "Imagery & metaphor", "Emotional resonance", "Style references", "Rhyme patterns"], credits: CREDIT_COSTS.poetry },
  { id: "standup", name: "Stand-up Comedy", icon: Mic2, description: "Comedy routines with setups & punchlines", color: "from-red-500 to-rose-600", features: ["Setup & punchline", "Observational humor", "Timing cues", "Crowd work", "Style references"], credits: CREDIT_COSTS.standup },
  { id: "podcast_script", name: "Podcast Script", icon: Podcast, description: "Engaging podcast scripts with segues & CTAs", color: "from-indigo-500 to-blue-600", features: ["Intro & outro", "Segment transitions", "Interview format", "CTAs", "Engagement hooks"], credits: CREDIT_COSTS.podcast_script },
  { id: "ad_copy", name: "Ad Copy", icon: Megaphone, description: "Persuasive advertising & marketing copy", color: "from-yellow-500 to-amber-600", features: ["Headlines", "CTAs", "Target audience", "Brand voice", "Conversion focus"], credits: CREDIT_COSTS.ad_copy },
];

export default function CreativeForge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { credits, isLoading: creditsLoading, purchaseCredits, verifyPayment, refreshCredits } = useCreativeForgeCredits();

  const [activeView, setActiveView] = useState<"hub" | "create" | "history" | "credits">("hub");
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory>("song_lyrics");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  const [cowriterOpen, setCowriterOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [brandVoiceOpen, setBrandVoiceOpen] = useState(false);
  const [storyBibleOpen, setStoryBibleOpen] = useState(false);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [activeBrandVoice, setActiveBrandVoice] = useState<BrandVoice | null>(null);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [characters, setCharacters] = useState("");
  const [setting, setSetting] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [styleReference, setStyleReference] = useState("");
  const [contentLength, setContentLength] = useState("medium");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ["creative-forge-projects"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("creative_forge_projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const payment = searchParams.get("payment");
    const creditsParam = searchParams.get("credits");
    const sessionId = searchParams.get("session_id");
    if (payment === "success") {
      const addCredits = async () => {
        try {
          if (sessionId) await verifyPayment(sessionId, parseInt(creditsParam || "0"));
          toast({ title: "Payment Successful!", description: `${creditsParam || ""} credits added.` });
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
    if (!title.trim()) { toast({ title: "Error", description: "Please enter a title or theme", variant: "destructive" }); return; }
    const cost = CREDIT_COSTS[selectedCategory];
    if ((credits?.credits_remaining || 0) < cost) { toast({ title: "Insufficient Credits", description: `You need ${cost} credits.`, variant: "destructive" }); setActiveView("credits"); return; }
    setIsGenerating(true);
    if (generatedContent) setPreviousContent(generatedContent);
    setGeneratedContent(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", {
        body: { category: selectedCategory, title, inputData: { genre, mood, description, characters, setting, targetAudience, length: contentLength }, styleReference: styleReference === "none" ? "" : styleReference },
      });
      if (error) throw error;
      setGeneratedContent(data.content);
      refreshCredits(); refetchProjects();
      toast({ title: "Content Generated!", description: `Used ${data.creditsUsed} credits. ${data.creditsRemaining} remaining.` });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({ title: "Generation Failed", description: error.message || "Failed to generate content", variant: "destructive" });
    } finally { setIsGenerating(false); }
  };

  const handleRevision = async (originalContent: string, revisionNotes: string) => {
    if ((credits?.credits_remaining || 0) < CREDIT_COSTS.revision) { toast({ title: "Insufficient Credits", description: `You need ${CREDIT_COSTS.revision} credits.`, variant: "destructive" }); return; }
    setIsGenerating(true); setPreviousContent(originalContent);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", { body: { category: selectedCategory, title, inputData: { revisionNotes }, isRevision: true, originalContent } });
      if (error) throw error;
      setGeneratedContent(data.content); refreshCredits(); refetchProjects();
      toast({ title: "Revision Complete!", description: `Used ${data.creditsUsed} credits.` });
    } catch (error: any) { toast({ title: "Revision Failed", description: error.message, variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const handlePurchase = async (creditAmount: number) => { const url = await purchaseCredits(creditAmount); if (url) window.open(url, "_blank"); };
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!", description: "Content copied to clipboard" }); };
  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Content saved to file" });
  };
  const shareContent = (content: string, ttl: string) => { if (navigator.share) { navigator.share({ title: `CreativeForge: ${ttl}`, text: content }).catch(() => {}); } else { copyToClipboard(content); } };
  const applyTemplate = (tpl: QuickTemplate) => { setTitle(tpl.title); setGenre(tpl.genre); setMood(tpl.mood); setDescription(tpl.description); setCharacters(tpl.characters); setSetting(tpl.setting); setStyleReference(tpl.styleReference); toast({ title: "Template Applied", description: `"${tpl.label}" loaded — customize and generate!` }); };

  const filteredProjects = (projects || []).filter((p: any) => {
    if (historyFilter !== "all" && p.category !== historyFilter) return false;
    if (historySearch) { const q = historySearch.toLowerCase(); return p.title.toLowerCase().includes(q) || p.generated_content?.toLowerCase().includes(q); }
    return true;
  });

  const openTool = (toolId: string) => {
    setSelectedCategory(toolId as CreativeCategory);
    setActiveView("create");
    setGeneratedContent(null);
    setPreviousContent(null);
    setTitle(""); setGenre(""); setMood(""); setDescription(""); setCharacters(""); setSetting(""); setTargetAudience(""); setStyleReference(""); setContentLength("medium");
  };

  // Shared modals (used both in hub & create view)
  const sharedModals = (
    <>
      <ForgeCowriterChat
        open={cowriterOpen}
        onClose={() => setCowriterOpen(false)}
        category={selectedCategory}
        currentText={generatedContent || description || ""}
        onInsert={(text) => {
          setGeneratedContent((prev) => (prev ? prev + "\n\n" + text : text));
          setActiveView("create");
        }}
      />
      <ForgeStyleTransfer
        open={styleOpen}
        onClose={() => setStyleOpen(false)}
        initialText={generatedContent || ""}
        onApply={(text) => { setPreviousContent(generatedContent); setGeneratedContent(text); setActiveView("create"); }}
      />
      <ForgeVoiceToScript
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        defaultCategory={selectedCategory}
        onApply={(text) => { setGeneratedContent(text); setActiveView("create"); }}
      />
      <ForgeRooms open={roomsOpen} onClose={() => setRoomsOpen(false)} />
      <ForgeBrandVoice open={brandVoiceOpen} onClose={() => setBrandVoiceOpen(false)} onSelect={(v) => { setActiveBrandVoice(v); toast({ title: "Brand voice active", description: v.name }); }} />
      <ForgeStoryBible open={storyBibleOpen} onClose={() => setStoryBibleOpen(false)} />
      <ForgeAIStudio
        open={aiStudioOpen}
        onClose={() => setAiStudioOpen(false)}
        currentText={generatedContent || ""}
        onReplace={(t) => { setPreviousContent(generatedContent); setGeneratedContent(t); }}
        onAppend={(t) => setGeneratedContent((prev) => (prev ? prev + "\n\n" + t : t))}
        brandVoice={activeBrandVoice ? { name: activeBrandVoice.name, tone: activeBrandVoice.tone, audience: activeBrandVoice.audience, do_use: activeBrandVoice.do_use, dont_use: activeBrandVoice.dont_use, sample: activeBrandVoice.sample_text } : null}
      />
    </>
  );

  // Sub-views (Create, History, Credits)
  if (activeView !== "hub") {
    return (
      <div className="relative min-h-screen">
        <FloatingHowItWorks
          title="Creative Forge"
          intro="AI-powered creative studio for text, images and ideas."
          steps={[
            { title: "Pick a tool", desc: "Choose from text, image, brainstorm or remix generators." },
          { title: "Describe your goal", desc: "Write a clear prompt \u2014 style, mood, audience." },
          { title: "Spend credits", desc: "Each generation costs 3\u20135 credits from your balance." },
          { title: "Refine & iterate", desc: "Regenerate or tweak the prompt for better results." },
          { title: "Save or export", desc: "Download or send to Content Studio." }
          ]}
        />
        <div className="fixed inset-0 pointer-events-none z-0"><FloatingParticles /></div>
        {sharedModals}
        <div className="relative z-10 container mx-auto px-2 sm:px-4 pt-20 pb-12 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {"Back to CreativeForge"}
            </Button>
            {activeView === "create" && (
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setAiStudioOpen(true)} className="gap-1 border-primary/40 text-primary hover:bg-primary/10"><SparkleIcon className="h-3.5 w-3.5" /> AI Studio</Button>
                <Button variant="outline" size="sm" onClick={() => setBrandVoiceOpen(true)} className="gap-1"><Palette className="h-3.5 w-3.5" /> {activeBrandVoice ? `Voice: ${activeBrandVoice.name}` : "Brand Voice"}</Button>
                <Button variant="outline" size="sm" onClick={() => setStoryBibleOpen(true)} className="gap-1"><BookMarked className="h-3.5 w-3.5" /> Story Bible</Button>
                <Button variant="outline" size="sm" onClick={() => setCowriterOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Sparkles className="h-3.5 w-3.5" /> {"Co-Writer"}</Button>
                <Button variant="outline" size="sm" onClick={() => setStyleOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Wand2 className="h-3.5 w-3.5" /> {"Style Transfer"}</Button>
                <Button variant="outline" size="sm" onClick={() => setVoiceOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Mic className="h-3.5 w-3.5" /> {"Voice"}</Button>
                <Button variant="outline" size="sm" onClick={() => setRoomsOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Users className="h-3.5 w-3.5" /> {"Rooms"}</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveView("history")} className="gap-1"><History className="h-3.5 w-3.5" /> {"History"}</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveView("credits")} className="gap-1"><CreditCard className="h-3.5 w-3.5" /> {"Credits"}</Button>
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === "create" && (
                <div className="space-y-6">
                  <ForgeTemplates category={selectedCategory} onApply={applyTemplate} />
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <Card className="border-border/50 backdrop-blur-xl bg-card/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}
                          {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                        </CardTitle>
                        <CardDescription>{"Describe your creative vision"}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><Label>{"Title / Theme *"}</Label><Input placeholder={"Enter the main theme or title..."} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>{"Genre / Style"}</Label><Input placeholder={"e.g., Romance, Thriller..."} value={genre} onChange={(e) => setGenre(e.target.value)} /></div>
                          <div><Label>{"Mood / Tone"}</Label><Input placeholder={"e.g., Melancholic, Upbeat..."} value={mood} onChange={(e) => setMood(e.target.value)} /></div>
                        </div>
                        <div><Label>{"Description"}</Label><Textarea placeholder={"Describe what you want in detail..."} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                        {(selectedCategory === "screenplay" || selectedCategory === "theater_play" || selectedCategory === "novel_chapter") && (
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>{"Characters"}</Label><Input placeholder={"Main characters..."} value={characters} onChange={(e) => setCharacters(e.target.value)} /></div>
                            <div><Label>{"Setting"}</Label><Input placeholder={"Time and place..."} value={setting} onChange={(e) => setSetting(e.target.value)} /></div>
                          </div>
                        )}
                        {selectedCategory === "ad_copy" && (<div><Label>{"Target Audience"}</Label><Input placeholder={"Who is this for..."} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></div>)}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>{"Style Reference"}</Label>
                            <Select value={styleReference} onValueChange={setStyleReference}><SelectTrigger><SelectValue placeholder={"Write in the style of..."} /></SelectTrigger>
                              <SelectContent><SelectItem value="none">{"No specific style"}</SelectItem>{STYLE_REFERENCES[selectedCategory]?.map((ref) => (<SelectItem key={ref} value={ref}>{ref}</SelectItem>))}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>{"Content Length"}</Label>
                            <Select value={contentLength} onValueChange={setContentLength}><SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="short">{"Short"}</SelectItem><SelectItem value="medium">{"Medium"}</SelectItem><SelectItem value="long">{"Long"}</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={isGenerating || !title.trim()} className="w-full" size="lg">
                          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {"Generating..."}</> : <><Sparkles className="mr-2 h-4 w-4" /> {"Generate"} ({CREDIT_COSTS[selectedCategory]} {"cr"})</>}
                        </Button>
                      </CardContent>
                    </Card>
                    {/* Output */}
                    <Card className="border-border/50 backdrop-blur-xl bg-card/80">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">{"Generated Content"}</CardTitle><CardDescription>{"Your AI-created masterpiece"}</CardDescription></CardHeader>
                      <CardContent>
                        {generatedContent ? (
                          <div className="space-y-3">
                            {previousContent && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => { setGeneratedContent(previousContent); setPreviousContent(null); }}>{"← Previous Version"}</Button>
                                <Badge variant="secondary" className="flex items-center justify-center text-xs">{"Current Version"}</Badge>
                              </div>
                            )}
                            <ScrollArea className="h-[300px] border rounded-xl p-4 bg-muted/20"><pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedContent}</pre></ScrollArea>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)} className="flex-1"><Copy className="mr-1.5 h-3.5 w-3.5" /> {"Copy"}</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex-1"><FileDown className="mr-1.5 h-3.5 w-3.5" /> Export</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => exportAs("txt", `${selectedCategory}-${title}`, generatedContent)}>Plain text (.txt)</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportAs("md", `${selectedCategory}-${title}`, generatedContent)}>Markdown (.md)</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportAs("doc", `${selectedCategory}-${title}`, generatedContent)}>Word (.doc)</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportAs("pdf", `${selectedCategory}-${title}`, generatedContent)}>PDF (print)</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button variant="outline" size="sm" onClick={() => shareContent(generatedContent, title)} className="flex-1"><Star className="mr-1.5 h-3.5 w-3.5" /> {"Share"}</Button>
                            </div>
                            <div className="pt-2 border-t">
                              <Label className="text-xs">{`Request Revision (${CREDIT_COSTS.revision} credits)`}</Label>
                              <div className="flex gap-2 mt-1">
                                <Input placeholder={"What should be changed..."} id="revision-notes" className="text-sm" />
                                <Button size="sm" variant="secondary" onClick={() => { const notes = (document.getElementById("revision-notes") as HTMLInputElement)?.value; if (notes) handleRevision(generatedContent, notes); }} disabled={isGenerating}><RefreshCw className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center"><Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" /><p className="text-sm">{"Select a template or describe your vision"}</p><p className="text-xs text-muted-foreground mt-1">{"Generated content will appear here"}</p></div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeView === "history" && (
                <Card className="border-border/50 backdrop-blur-xl bg-card/80">
                  <CardHeader>
                    <CardTitle>{"Your Projects"}</CardTitle><CardDescription>{"Previously generated content"}</CardDescription>
                    <div className="flex flex-col sm:flex-row gap-3 mt-3">
                      <Input placeholder={"Search projects..."} value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="flex-1" />
                      <Select value={historyFilter} onValueChange={setHistoryFilter}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={"All Types"} /></SelectTrigger>
                        <SelectContent><SelectItem value="all">{"All Types"}</SelectItem>{CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>))}</SelectContent>
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
                                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0"><Icon className="h-5 w-5 text-primary" /></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-medium text-sm">{project.title}</h4>
                                    <Badge variant="outline" className="text-xs">{category?.name}</Badge>
                                    <Badge variant="secondary" className="text-xs">{project.credits_used} {"cr"}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{new Date(project.created_at).toLocaleDateString()}</p>
                                  <ScrollArea className="h-20 border rounded-lg p-2 bg-muted/20"><pre className="whitespace-pre-wrap text-xs font-mono">{project.generated_content?.substring(0, 500)}...</pre></ScrollArea>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(project.generated_content)}><Copy className="h-3 w-3 mr-1" /> {"Copy"}</Button>
                                    <Button size="sm" variant="outline" onClick={() => downloadContent(project.generated_content, project.title)}><Download className="h-3 w-3 mr-1" /> {"Download"}</Button>
                                    <Button size="sm" variant="outline" onClick={() => shareContent(project.generated_content, project.title)}><Star className="h-3 w-3 mr-1" /> {"Share"}</Button>
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
                        <p className="text-sm mb-4">{historySearch || historyFilter !== "all" ? "No matching projects" : "No projects yet. Start creating!"}</p>
                        {!(historySearch || historyFilter !== "all") && (
                          <Button onClick={() => openTool("song_lyrics")} className="gap-2">
                            <Sparkles className="h-4 w-4" /> {"Start Creating"}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeView === "credits" && (
                <div className="space-y-6">
                  <ForgeCreditPackages onPurchase={handlePurchase} />
                  <Card className="border-border/50 backdrop-blur-xl bg-card/80">
                    <CardHeader><CardTitle>{"Credit Costs"}</CardTitle><CardDescription>{"How many credits each content type uses"}</CardDescription></CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {CATEGORIES.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-2.5 border border-border/50 rounded-lg">
                            <div className="flex items-center gap-2"><span>{category.emoji}</span><span className="text-sm font-medium">{category.name}</span></div>
                            <Badge variant="secondary">{`${CREDIT_COSTS[category.id as CreativeCategory]} credits`}</Badge>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-2.5 border border-dashed border-border/50 rounded-lg">
                          <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{"Revision"}</span></div>
                          <Badge variant="outline">{`${CREDIT_COSTS.revision} credits`}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Hub view (AI Mentor style)
  return (
    <div className="relative min-h-screen">
      {sharedModals}
      <div className="fixed inset-0 pointer-events-none z-0"><FloatingParticles /></div>
      <div className="relative z-10 container mx-auto px-2 sm:px-4 pt-20 pb-12 max-w-7xl">
        <ForgeHero
          credits={credits?.credits_remaining || 0}
          creditsLoading={creditsLoading}
          onStartCreating={() => openTool("song_lyrics")}
          onOpenCowriter={() => setCowriterOpen(true)}
        />

        {/* Premium AI Tools Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <button onClick={() => setAiStudioOpen(true)} className="group p-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl hover:border-primary/60 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg group-hover:scale-110 transition-transform"><SparkleIcon className="h-5 w-5 text-white" /></div>
              <div><h4 className="font-bold">AI Studio</h4><p className="text-xs text-muted-foreground">Brainstorm · SEO · Translate · Score · Originality</p></div>
            </div>
          </button>
          <button onClick={() => setBrandVoiceOpen(true)} className="group p-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl hover:border-primary/60 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg group-hover:scale-110 transition-transform"><Palette className="h-5 w-5 text-white" /></div>
              <div><h4 className="font-bold">Brand Voices</h4><p className="text-xs text-muted-foreground">Save & reuse tone profiles</p></div>
            </div>
          </button>
          <button onClick={() => setStoryBibleOpen(true)} className="group p-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl hover:border-primary/60 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg group-hover:scale-110 transition-transform"><BookMarked className="h-5 w-5 text-white" /></div>
              <div><h4 className="font-bold">Story Bible</h4><p className="text-xs text-muted-foreground">Characters · places · plot · lore</p></div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button onClick={() => setStyleOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-700 to-rose-700 shadow-lg group-hover:scale-110 transition-transform">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{"Style Transfer"}</h4>
                <p className="text-xs text-amber-200/60">{"Rewrite as Shakespeare, Tarantino…"}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setVoiceOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-700 to-amber-700 shadow-lg group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{"Voice-to-Script"}</h4>
                <p className="text-xs text-amber-200/60">{"Speak your idea, get a polished draft"}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setRoomsOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{"Collaboration Rooms"}</h4>
                <p className="text-xs text-amber-200/60">{"Co-write with friends + AI moderator"}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Engagement widgets row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ForgeStreak />
          <ForgeProgressPreview />
          <ForgeAchievements />
        </div>

        {/* Main content: Tool cards + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORGE_TOOLS.slice(0, 6).map((tool, i) => (
              <ForgeToolCard key={tool.id} tool={tool} onSelect={() => openTool(tool.id)} index={i} />
            ))}
          </div>
          <div className="space-y-4">
            <ForgeTestimonials />
            {/* Quick Actions */}
            <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> {"Quick Actions"}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveView("history")}><History className="h-4 w-4" /> {"View History"}</Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveView("credits")}><CreditCard className="h-4 w-4" /> {"Buy Credits"}</Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setCowriterOpen(true)}><Sparkles className="h-4 w-4" /> {"AI Co-Writer Chat"}</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Remaining tools */}
        {FORGE_TOOLS.length > 6 && (
          <div className="mb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
              <h2 className="text-2xl font-black">{"More Content Types"}</h2>
              <p className="text-sm text-muted-foreground">{"Explore all available writing categories"}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FORGE_TOOLS.slice(6).map((tool, i) => (
                <ForgeToolCard key={tool.id} tool={tool} onSelect={() => openTool(tool.id)} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Feature roadmap */}
        <div className="mb-8">
          <ForgeIdeasShowcase />
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6"><h2 className="text-2xl font-bold">{"How It Works"}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Choose Content Type", desc: "Select from 8 creative writing categories" },
              { step: "2", title: "Describe Your Vision", desc: "Add details, style references, and templates" },
              { step: "3", title: "Generate & Refine", desc: "Get AI content instantly, revise as needed" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
