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
import { useTranslation } from "react-i18next";
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
  const { t: tt } = useTranslation();
  const t = tt as (key: string, opts?: Record<string, unknown>) => string;
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
          toast({ title: t("forge.payment_success_title"), description: t("forge.payment_success_desc", { count: creditsParam || "" }) });
          refreshCredits();
        } catch (error) { console.error("Error verifying payment:", error); }
      };
      addCredits();
      navigate("/creative-forge", { replace: true });
    } else if (payment === "canceled") {
      toast({ title: t("forge.payment_canceled_title"), description: t("forge.payment_canceled_desc"), variant: "destructive" });
      navigate("/creative-forge", { replace: true });
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!title.trim()) { toast({ title: t("forge.error"), description: t("forge.title_required"), variant: "destructive" }); return; }
    const cost = CREDIT_COSTS[selectedCategory];
    if ((credits?.credits_remaining || 0) < cost) { toast({ title: t("forge.insufficient_credits_title"), description: t("forge.insufficient_credits_desc", { count: cost }), variant: "destructive" }); setActiveView("credits"); return; }
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
      toast({ title: t("forge.content_generated"), description: t("forge.credits_used_remaining", { used: data.creditsUsed, remaining: data.creditsRemaining }) });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({ title: t("forge.generation_failed"), description: error.message || t("forge.generation_failed_desc"), variant: "destructive" });
    } finally { setIsGenerating(false); }
  };

  const handleRevision = async (originalContent: string, revisionNotes: string) => {
    if ((credits?.credits_remaining || 0) < CREDIT_COSTS.revision) { toast({ title: t("forge.insufficient_credits_title"), description: t("forge.insufficient_credits_desc", { count: CREDIT_COSTS.revision }), variant: "destructive" }); return; }
    setIsGenerating(true); setPreviousContent(originalContent);
    try {
      const { data, error } = await supabase.functions.invoke("generate-creative-content", { body: { category: selectedCategory, title, inputData: { revisionNotes }, isRevision: true, originalContent } });
      if (error) throw error;
      setGeneratedContent(data.content); refreshCredits(); refetchProjects();
      toast({ title: t("forge.revision_complete"), description: t("forge.revision_used", { used: data.creditsUsed }) });
    } catch (error: any) { toast({ title: t("forge.revision_failed"), description: error.message, variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const handlePurchase = async (creditAmount: number) => { const url = await purchaseCredits(creditAmount); if (url) window.open(url, "_blank"); };
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: t("forge.copied"), description: t("forge.copied_desc") }); };
  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: t("forge.downloaded"), description: t("forge.downloaded_desc") });
  };
  const shareContent = (content: string, ttl: string) => { if (navigator.share) { navigator.share({ title: `CreativeForge: ${ttl}`, text: content }).catch(() => {}); } else { copyToClipboard(content); } };
  const applyTemplate = (tpl: QuickTemplate) => { setTitle(tpl.title); setGenre(tpl.genre); setMood(tpl.mood); setDescription(tpl.description); setCharacters(tpl.characters); setSetting(tpl.setting); setStyleReference(tpl.styleReference); toast({ title: t("forge.template_applied"), description: t("forge.template_loaded", { name: tpl.label }) }); };

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
        <div className="fixed inset-0 pointer-events-none z-0"><FloatingParticles /></div>
        {sharedModals}
        <div className="relative z-10 container mx-auto px-2 sm:px-4 pt-20 pb-12 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("forge.back")}
            </Button>
            {activeView === "create" && (
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setAiStudioOpen(true)} className="gap-1 border-primary/40 text-primary hover:bg-primary/10"><SparkleIcon className="h-3.5 w-3.5" /> AI Studio</Button>
                <Button variant="outline" size="sm" onClick={() => setBrandVoiceOpen(true)} className="gap-1"><Palette className="h-3.5 w-3.5" /> {activeBrandVoice ? `Voice: ${activeBrandVoice.name}` : "Brand Voice"}</Button>
                <Button variant="outline" size="sm" onClick={() => setStoryBibleOpen(true)} className="gap-1"><BookMarked className="h-3.5 w-3.5" /> Story Bible</Button>
                <Button variant="outline" size="sm" onClick={() => setCowriterOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Sparkles className="h-3.5 w-3.5" /> {t("forge.tools.cowriter")}</Button>
                <Button variant="outline" size="sm" onClick={() => setStyleOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Wand2 className="h-3.5 w-3.5" /> {t("forge.tools.style_transfer")}</Button>
                <Button variant="outline" size="sm" onClick={() => setVoiceOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Mic className="h-3.5 w-3.5" /> {t("forge.tools.voice")}</Button>
                <Button variant="outline" size="sm" onClick={() => setRoomsOpen(true)} className="gap-1 border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"><Users className="h-3.5 w-3.5" /> {t("forge.tools.rooms")}</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveView("history")} className="gap-1"><History className="h-3.5 w-3.5" /> {t("forge.tools.history")}</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveView("credits")} className="gap-1"><CreditCard className="h-3.5 w-3.5" /> {t("forge.tools.credits")}</Button>
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
                        <CardDescription>{t("forge.form.describe_vision")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><Label>{t("forge.form.title_label")}</Label><Input placeholder={t("forge.form.title_placeholder")} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>{t("forge.form.genre")}</Label><Input placeholder={t("forge.form.genre_placeholder")} value={genre} onChange={(e) => setGenre(e.target.value)} /></div>
                          <div><Label>{t("forge.form.mood")}</Label><Input placeholder={t("forge.form.mood_placeholder")} value={mood} onChange={(e) => setMood(e.target.value)} /></div>
                        </div>
                        <div><Label>{t("forge.form.description")}</Label><Textarea placeholder={t("forge.form.description_placeholder")} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                        {(selectedCategory === "screenplay" || selectedCategory === "theater_play" || selectedCategory === "novel_chapter") && (
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>{t("forge.form.characters")}</Label><Input placeholder={t("forge.form.characters_placeholder")} value={characters} onChange={(e) => setCharacters(e.target.value)} /></div>
                            <div><Label>{t("forge.form.setting")}</Label><Input placeholder={t("forge.form.setting_placeholder")} value={setting} onChange={(e) => setSetting(e.target.value)} /></div>
                          </div>
                        )}
                        {selectedCategory === "ad_copy" && (<div><Label>{t("forge.form.target_audience")}</Label><Input placeholder={t("forge.form.target_audience_placeholder")} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></div>)}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>{t("forge.form.style_reference")}</Label>
                            <Select value={styleReference} onValueChange={setStyleReference}><SelectTrigger><SelectValue placeholder={t("forge.form.style_reference_placeholder")} /></SelectTrigger>
                              <SelectContent><SelectItem value="none">{t("forge.form.no_specific_style")}</SelectItem>{STYLE_REFERENCES[selectedCategory]?.map((ref) => (<SelectItem key={ref} value={ref}>{ref}</SelectItem>))}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>{t("forge.form.content_length")}</Label>
                            <Select value={contentLength} onValueChange={setContentLength}><SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="short">{t("forge.form.length_short")}</SelectItem><SelectItem value="medium">{t("forge.form.length_medium")}</SelectItem><SelectItem value="long">{t("forge.form.length_long")}</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={isGenerating || !title.trim()} className="w-full" size="lg">
                          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("forge.generating")}</> : <><Sparkles className="mr-2 h-4 w-4" /> {t("forge.generate")} ({CREDIT_COSTS[selectedCategory]} {t("forge.credit_short")})</>}
                        </Button>
                      </CardContent>
                    </Card>
                    {/* Output */}
                    <Card className="border-border/50 backdrop-blur-xl bg-card/80">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">{t("forge.output.title")}</CardTitle><CardDescription>{t("forge.output.subtitle")}</CardDescription></CardHeader>
                      <CardContent>
                        {generatedContent ? (
                          <div className="space-y-3">
                            {previousContent && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => { setGeneratedContent(previousContent); setPreviousContent(null); }}>{t("forge.output.previous_version")}</Button>
                                <Badge variant="secondary" className="flex items-center justify-center text-xs">{t("forge.output.current_version")}</Badge>
                              </div>
                            )}
                            <ScrollArea className="h-[300px] border rounded-xl p-4 bg-muted/20"><pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedContent}</pre></ScrollArea>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)} className="flex-1"><Copy className="mr-1.5 h-3.5 w-3.5" /> {t("forge.output.copy")}</Button>
                              <Button variant="outline" size="sm" onClick={() => downloadContent(generatedContent, `${selectedCategory}-${title}`)} className="flex-1"><Download className="mr-1.5 h-3.5 w-3.5" /> {t("forge.output.download")}</Button>
                              <Button variant="outline" size="sm" onClick={() => shareContent(generatedContent, title)} className="flex-1"><Star className="mr-1.5 h-3.5 w-3.5" /> {t("forge.output.share")}</Button>
                            </div>
                            <div className="pt-2 border-t">
                              <Label className="text-xs">{t("forge.output.request_revision", { count: CREDIT_COSTS.revision })}</Label>
                              <div className="flex gap-2 mt-1">
                                <Input placeholder={t("forge.output.revision_placeholder")} id="revision-notes" className="text-sm" />
                                <Button size="sm" variant="secondary" onClick={() => { const notes = (document.getElementById("revision-notes") as HTMLInputElement)?.value; if (notes) handleRevision(generatedContent, notes); }} disabled={isGenerating}><RefreshCw className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center"><Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" /><p className="text-sm">{t("forge.output.empty_title")}</p><p className="text-xs text-muted-foreground mt-1">{t("forge.output.empty_subtitle")}</p></div>
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
                    <CardTitle>{t("forge.history.title")}</CardTitle><CardDescription>{t("forge.history.subtitle")}</CardDescription>
                    <div className="flex flex-col sm:flex-row gap-3 mt-3">
                      <Input placeholder={t("forge.history.search_placeholder")} value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="flex-1" />
                      <Select value={historyFilter} onValueChange={setHistoryFilter}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={t("forge.history.filter_all")} /></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t("forge.history.filter_all")}</SelectItem>{CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>))}</SelectContent>
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
                                    <Badge variant="secondary" className="text-xs">{project.credits_used} {t("forge.credit_short")}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{new Date(project.created_at).toLocaleDateString()}</p>
                                  <ScrollArea className="h-20 border rounded-lg p-2 bg-muted/20"><pre className="whitespace-pre-wrap text-xs font-mono">{project.generated_content?.substring(0, 500)}...</pre></ScrollArea>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(project.generated_content)}><Copy className="h-3 w-3 mr-1" /> {t("forge.output.copy")}</Button>
                                    <Button size="sm" variant="outline" onClick={() => downloadContent(project.generated_content, project.title)}><Download className="h-3 w-3 mr-1" /> {t("forge.output.download")}</Button>
                                    <Button size="sm" variant="outline" onClick={() => shareContent(project.generated_content, project.title)}><Star className="h-3 w-3 mr-1" /> {t("forge.output.share")}</Button>
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
                        <p className="text-sm mb-4">{historySearch || historyFilter !== "all" ? t("forge.history.no_matching") : t("forge.history.no_projects")}</p>
                        {!(historySearch || historyFilter !== "all") && (
                          <Button onClick={() => openTool("song_lyrics")} className="gap-2">
                            <Sparkles className="h-4 w-4" /> {t("forge.history.start_creating")}
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
                    <CardHeader><CardTitle>{t("forge.credits_view.costs_title")}</CardTitle><CardDescription>{t("forge.credits_view.costs_subtitle")}</CardDescription></CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {CATEGORIES.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-2.5 border border-border/50 rounded-lg">
                            <div className="flex items-center gap-2"><span>{category.emoji}</span><span className="text-sm font-medium">{category.name}</span></div>
                            <Badge variant="secondary">{t("forge.credits", { count: CREDIT_COSTS[category.id as CreativeCategory] })}</Badge>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-2.5 border border-dashed border-border/50 rounded-lg">
                          <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{t("forge.credits_view.revision")}</span></div>
                          <Badge variant="outline">{t("forge.credits", { count: CREDIT_COSTS.revision })}</Badge>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button onClick={() => setStyleOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-700 to-rose-700 shadow-lg group-hover:scale-110 transition-transform">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{t("forge.premium.style_transfer_title")}</h4>
                <p className="text-xs text-amber-200/60">{t("forge.premium.style_transfer_desc")}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setVoiceOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-700 to-amber-700 shadow-lg group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{t("forge.premium.voice_title")}</h4>
                <p className="text-xs text-amber-200/60">{t("forge.premium.voice_desc")}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setRoomsOpen(true)} className="group p-4 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-[hsl(30,15%,9%)]/80 to-[hsl(0,20%,8%)]/80 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100" style={{ fontFamily: "Georgia, serif" }}>{t("forge.premium.rooms_title")}</h4>
                <p className="text-xs text-amber-200/60">{t("forge.premium.rooms_desc")}</p>
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
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> {t("forge.tools.quick_actions")}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveView("history")}><History className="h-4 w-4" /> {t("forge.tools.view_history")}</Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveView("credits")}><CreditCard className="h-4 w-4" /> {t("forge.tools.buy_credits")}</Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setCowriterOpen(true)}><Sparkles className="h-4 w-4" /> {t("forge.tools.ai_cowriter_chat")}</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Remaining tools */}
        {FORGE_TOOLS.length > 6 && (
          <div className="mb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
              <h2 className="text-2xl font-black">{t("forge.hub.more_types")}</h2>
              <p className="text-sm text-muted-foreground">{t("forge.hub.more_types_subtitle")}</p>
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
          <div className="text-center mb-6"><h2 className="text-2xl font-bold">{t("forge.hub.how_it_works")}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: t("forge.hub.step1_title"), desc: t("forge.hub.step1_desc") },
              { step: "2", title: t("forge.hub.step2_title"), desc: t("forge.hub.step2_desc") },
              { step: "3", title: t("forge.hub.step3_title"), desc: t("forge.hub.step3_desc") },
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
