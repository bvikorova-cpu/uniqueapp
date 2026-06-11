import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { savePendingAction } from "@/lib/pendingAction";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, Video, Briefcase, Image as ImageIcon, Copy, Loader2,
  Star, Zap, Clock, CheckCircle, PenTool, ArrowLeft, LayoutTemplate,
  Brain, Calendar, Shield, Download, Recycle, BarChart3, FlaskConical, Layers, Search,
} from "lucide-react";
import ContentStudioHero from "@/components/content-studio/ContentStudioHero";
import AIContentTemplates from "@/components/content-studio/AIContentTemplates";
import BrandVoiceTraining from "@/components/content-studio/BrandVoiceTraining";
import ContentCalendar from "@/components/content-studio/ContentCalendar";
import PlagiarismChecker from "@/components/content-studio/PlagiarismChecker";
import ContentRepurposer from "@/components/content-studio/ContentRepurposer";
import ContentAnalytics from "@/components/content-studio/ContentAnalytics";
import ABABTesting from "@/components/content-studio/ABABTesting";
import BulkContentGenerator from "@/components/content-studio/BulkContentGenerator";
import SEOKeywordOptimizer from "@/components/content-studio/SEOKeywordOptimizer";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "main" | "templates" | "brand-voice" | "calendar" | "plagiarism" | "generate" | "repurpose" | "analytics" | "ab-test" | "bulk" | "seo";

const CONTENT_TYPES = [
  { id: "social_post", name: "Social Media Post", icon: Sparkles, description: "Engaging posts with hashtags", credits: 1, placeholder: "Topic: Travel tips for summer vacation..." },
  { id: "blog_article", name: "Blog Article", icon: FileText, description: "SEO-optimized articles", credits: 3, placeholder: "Title and key points for article..." },
  { id: "video_script", name: "Video Script", icon: Video, description: "Engaging video scripts", credits: 2, placeholder: "Video topic and key messages..." },
  { id: "cv", name: "CV/Resume", icon: Briefcase, description: "Professional CV content", credits: 2, placeholder: "Your experience, skills, education..." },
  { id: "cover_letter", name: "Cover Letter", icon: FileText, description: "Compelling cover letters", credits: 1, placeholder: "Job position and your qualifications..." },
  { id: "business_document", name: "Business Document", icon: Briefcase, description: "Professional documents", credits: 2, placeholder: "Document purpose and key points..." },
];

const TOOL_CARDS = [
  { id: "generate" as const, name: "Content Generator", icon: Sparkles, description: "Generate any content type with AI", gradient: "from-purple-600 to-indigo-600", credits: "1-3" },
  { id: "templates" as const, name: "AI Templates", icon: LayoutTemplate, description: "Pre-built templates for emails, ads, posts", gradient: "from-blue-600 to-cyan-600", credits: "1-5" },
  { id: "brand-voice" as const, name: "Brand Voice", icon: Brain, description: "Train AI on your brand's tone & style", gradient: "from-pink-600 to-rose-600", credits: "5" },
  { id: "calendar" as const, name: "Content Calendar", icon: Calendar, description: "Plan & schedule content across platforms", gradient: "from-emerald-600 to-teal-600", credits: "Free" },
  { id: "plagiarism" as const, name: "Plagiarism Checker", icon: Shield, description: "AI-powered originality verification", gradient: "from-amber-600 to-orange-600", credits: "3" },
  { id: "repurpose" as const, name: "Content Repurposer", icon: Recycle, description: "Transform content into multiple formats", gradient: "from-violet-600 to-purple-600", credits: "3/fmt" },
  { id: "analytics" as const, name: "Performance Analytics", icon: BarChart3, description: "Track content creation patterns & insights", gradient: "from-sky-600 to-blue-600", credits: "Free" },
  { id: "ab-test" as const, name: "AI A/B Testing", icon: FlaskConical, description: "Generate & compare content variations", gradient: "from-red-600 to-rose-600", credits: "5" },
  { id: "bulk" as const, name: "Bulk Generator", icon: Layers, description: "Generate multiple posts from one prompt", gradient: "from-lime-600 to-green-600", credits: "2/post" },
  { id: "seo" as const, name: "SEO Optimizer", icon: Search, description: "AI keyword density & optimization analysis", gradient: "from-fuchsia-600 to-pink-600", credits: "4" },
];

const ContentStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>("main");
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("social_post");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [savedContent, setSavedContent] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { savePendingAction({ key: "content-studio:open", returnTo: "/content-studio" }); navigate("/auth"); return; }
    setUser(user);
    await loadCredits(user.id);
    await loadSavedContent(user.id);
  };

  const loadCredits = async (userId: string) => {
    const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
    setCredits(data?.credits_remaining || 0);
  };

  const loadSavedContent = async (userId: string) => {
    const { data } = await supabase.from("ai_generated_content").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
    setSavedContent(data || []);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast({ title: "Missing information", description: "Please provide both title and prompt", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", { body: { contentType: selectedType, title, prompt, metadata: {} } });
      if (error) throw error;
      setGeneratedContent(data.content);
      setCredits(data.creditsRemaining);
      await loadSavedContent(user.id);
      toast({ title: "Content generated!", description: `${data.content.credits_used} credits used. ${data.creditsRemaining} remaining.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    setImageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-image", { body: { prompt: title, contentId: generatedContent.id } });
      if (error) throw error;
      setGeneratedContent({ ...generatedContent, generated_image_url: data.imageUrl });
      setCredits(data.creditsRemaining);
      toast({ title: "Image generated!", description: `2 credits used. ${data.creditsRemaining} remaining.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate image", variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const selectedTypeData = CONTENT_TYPES.find(t => t.id === selectedType);

  // Sub-view rendering
  if (activeView === "templates") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><AIContentTemplates onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "brand-voice") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><BrandVoiceTraining onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "calendar") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><ContentCalendar onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "plagiarism") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><PlagiarismChecker onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "repurpose") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><ContentRepurposer onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "analytics") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><ContentAnalytics onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "ab-test") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><ABABTesting onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "bulk") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><BulkContentGenerator onBack={() => setActiveView("main")} /></div></div>;
  if (activeView === "seo") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-7xl"><SEOKeywordOptimizer onBack={() => setActiveView("main")} /></div></div>;

  if (activeView === "generate") {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveView("main")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h2 className="text-2xl font-black">Content Generator</h2>
              <p className="text-muted-foreground">Generate professional content with AI</p>
            </div>
            <Badge variant="outline" className="ml-auto text-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" /> {credits} Credits
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Content Type</CardTitle>
                  <CardDescription>Select what to generate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button key={type.id} variant={selectedType === type.id ? "default" : "outline"} className="w-full justify-start" onClick={() => setSelectedType(type.id)}>
                        <Icon className="h-4 w-4 mr-2" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs opacity-70">{type.credits} credit{type.credits > 1 ? "s" : ""}</div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate {selectedTypeData?.name}</CardTitle>
                  <CardDescription>{selectedTypeData?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your content a title..." disabled={loading} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prompt</label>
                    <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={selectedTypeData?.placeholder} rows={6} disabled={loading} />
                  </div>
                  <Button onClick={handleGenerate} disabled={loading || !title.trim() || !prompt.trim()} className="w-full">
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate ({selectedTypeData?.credits} credits)</>}
                  </Button>
                </CardContent>
              </Card>

              {generatedContent && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{generatedContent.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedContent.generated_text)}><Copy className="h-4 w-4" /></Button>
                          {!generatedContent.generated_image_url && (
                            <Button size="sm" variant="outline" onClick={handleGenerateImage} disabled={imageLoading}>
                              {imageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedContent.generated_image_url && <img src={generatedContent.generated_image_url} alt={generatedContent.title} className="w-full rounded-lg" />}
                      <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">{generatedContent.generated_text}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {savedContent.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Recent Content</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedContent.map((content) => (
                        <div key={content.id} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition active:scale-[0.97]" onClick={() => setGeneratedContent(content)}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium line-clamp-1">{content.title}</h3>
                            <Badge variant="outline" className="text-xs">{content.content_type.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{content.generated_text}</p>
                          <div className="text-xs text-muted-foreground mt-2">{new Date(content.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main hub dashboard
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <ContentStudioHero />

        <HeroRewardedAd sectionKey="page_contentstudio" />

        {/* Credits Bar */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" /> {credits} Credits
          </Badge>
          <Button variant="outline" onClick={() => navigate("/ai-credits")}>Buy Credits</Button>
        </div>

        {/* Description Card */}
        <Card className="max-w-4xl mx-auto mb-8 text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              What is Content Studio?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Premium Content Studio</strong> is your AI-powered content generation platform designed for creators,
              marketers, and professionals. Generate high-quality, professional content instantly using advanced AI technology.
              From social media posts to professional CVs, create compelling content in seconds.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant AI-powered generation</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> SEO-optimized content</div>
              <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> AI image generation</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Content history & reuse</div>
              <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Brand voice training</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Plagiarism checking</div>
              <div className="flex items-center gap-2"><Recycle className="h-4 w-4 text-primary" /> Content repurposing</div>
              <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /> A/B testing variants</div>
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Bulk content generation</div>
              <div className="flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> SEO keyword optimization</div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {TOOL_CARDS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 active:scale-[0.97] overflow-hidden group"
                  onClick={() => setActiveView(tool.id)}
                >
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${tool.gradient} p-4 text-white`}>
                      <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-black text-lg">{tool.name}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-xs">{tool.credits} credits</Badge>
                        <span className="text-xs text-primary font-medium">Open →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Content Quick View */}
        {savedContent.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Content</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveView("generate")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {savedContent.slice(0, 3).map((content) => (
                  <div key={content.id} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition active:scale-[0.97]" onClick={() => { setGeneratedContent(content); setActiveView("generate"); }}>
                    <h3 className="font-medium line-clamp-1 mb-1">{content.title}</h3>
                    <Badge variant="outline" className="text-xs mb-2">{content.content_type.replace("_", " ")}</Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2">{content.generated_text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentStudio;
