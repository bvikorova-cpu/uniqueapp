import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  FileText,
  Video,
  Briefcase,
  Image as ImageIcon,
  Download,
  Copy,
  Loader2,
} from "lucide-react";

const CONTENT_TYPES = [
  {
    id: "social_post",
    name: "Social Media Post",
    icon: Sparkles,
    description: "Engaging posts with hashtags",
    credits: 1,
    placeholder: "Topic: Travel tips for summer vacation...",
  },
  {
    id: "blog_article",
    name: "Blog Article",
    icon: FileText,
    description: "SEO-optimized articles",
    credits: 3,
    placeholder: "Title and key points for article...",
  },
  {
    id: "video_script",
    name: "Video Script",
    icon: Video,
    description: "Engaging video scripts",
    credits: 2,
    placeholder: "Video topic and key messages...",
  },
  {
    id: "cv",
    name: "CV/Resume",
    icon: Briefcase,
    description: "Professional CV content",
    credits: 2,
    placeholder: "Your experience, skills, education...",
  },
  {
    id: "cover_letter",
    name: "Cover Letter",
    icon: FileText,
    description: "Compelling cover letters",
    credits: 1,
    placeholder: "Job position and your qualifications...",
  },
  {
    id: "business_document",
    name: "Business Document",
    icon: Briefcase,
    description: "Professional documents",
    credits: 2,
    placeholder: "Document purpose and key points...",
  },
];

const ContentStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await loadCredits(user.id);
    await loadSavedContent(user.id);
  };

  const loadCredits = async (userId: string) => {
    const { data } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();
    
    setCredits(data?.credits_remaining || 0);
  };

  const loadSavedContent = async (userId: string) => {
    const { data } = await supabase
      .from("ai_generated_content")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    setSavedContent(data || []);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentType: selectedType,
          title,
          prompt,
          metadata: {},
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setCredits(data.creditsRemaining);
      await loadSavedContent(user.id);

      toast({
        title: "Content generated!",
        description: `${data.content.credits_used} credits used. ${data.creditsRemaining} remaining.`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    
    setImageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-image", {
        body: {
          prompt: title,
          contentId: generatedContent.id,
        },
      });

      if (error) throw error;

      setGeneratedContent({ ...generatedContent, generated_image_url: data.imageUrl });
      setCredits(data.creditsRemaining);

      toast({
        title: "Image generated!",
        description: `2 credits used. ${data.creditsRemaining} remaining.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const selectedTypeData = CONTENT_TYPES.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Content Studio
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Professional AI-powered content generation
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              {credits} Credits
            </Badge>
            <Button variant="outline" onClick={() => navigate("/ai-credits")}>
              Buy Credits
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Type Selection */}
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
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? "premium" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedType(type.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.credits} credit{type.credits > 1 ? "s" : ""}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Generation Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate {selectedTypeData?.name}</CardTitle>
                <CardDescription>{selectedTypeData?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your content a title..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedTypeData?.placeholder}
                    rows={6}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !title.trim() || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate ({selectedTypeData?.credits} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedContent && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{generatedContent.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedContent.generated_text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!generatedContent.generated_image_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateImage}
                          disabled={imageLoading}
                        >
                          {imageLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedContent.generated_image_url && (
                    <img
                      src={generatedContent.generated_image_url}
                      alt={generatedContent.title}
                      className="w-full rounded-lg"
                    />
                  )}
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {generatedContent.generated_text}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Saved Content */}
        {savedContent.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedContent.map((content) => (
                  <div
                    key={content.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition"
                    onClick={() => setGeneratedContent(content)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium line-clamp-1">{content.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {content.content_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.generated_text}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(content.created_at).toLocaleDateString()}
                    </div>
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