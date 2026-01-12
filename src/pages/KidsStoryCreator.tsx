import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Wand2, Download, Sparkles, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsStoryCreator } from "@/hooks/useKidsStoryCreator";
import { StoryLimitBanner } from "@/components/kids-story/StoryLimitBanner";
import { StoryLibrary } from "@/components/kids-story/StoryLibrary";
import { StorySubscriptionManagement } from "@/components/kids-story/StorySubscriptionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";

const KidsStoryCreator = () => {
  const { user } = useAuth();
  const { storiesCreatedThisMonth, isPremium, loading: usageLoading, refreshUsage, manageSubscription } = useKidsStoryCreator();
  const [title, setTitle] = useState("");
  const [characters, setCharacters] = useState("");
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState("adventure");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<any>(null);
  
  // Parental Gate
  const { isVerified, checkVerification } = useParentalGate();
  const [showParentalGate, setShowParentalGate] = useState(false);

  useEffect(() => {
    // Check parental gate on mount
    if (!checkVerification()) {
      setShowParentalGate(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (!title.trim() || !characters.trim() || !theme.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-story-creator', {
        body: { title, characters, theme, category }
      });

      if (error) {
        if (error.message?.includes('Monthly limit reached')) {
          toast.error('Monthly limit reached! Upgrade to Premium for unlimited stories.', {
            duration: 5000,
          });
          refreshUsage();
          return;
        }
        throw error;
      }
      
      setStory(data);
      refreshUsage();
      toast.success("Your story is ready! 📖");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = () => {
    if (!story) return;
    
    const storyText = `${story.title}\n\n${story.story}`;
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Story saved! 💾");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Story Creator ✨
            </h1>
            <p className="text-muted-foreground">
              Create your own magical stories with AI illustrations!
            </p>
          </div>

          {/* How It Works Section */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lightbulb className="w-5 h-5 text-primary" />
                How AI Story Creator Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <p className="text-muted-foreground text-sm sm:text-base">
                AI Story Creator is a magical tool that brings your imagination to life! Create personalized 
                children's stories complete with AI-generated illustrations. Perfect for bedtime stories, 
                creative writing, or just for fun!
              </p>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-sm">Choose Your Title</h4>
                    <p className="text-xs text-muted-foreground">Give your story an exciting name that captures the adventure</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-sm">Pick a Category</h4>
                    <p className="text-xs text-muted-foreground">Adventure, Fantasy, Mystery, Space, Fairy Tale and more!</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-sm">Create Characters</h4>
                    <p className="text-xs text-muted-foreground">Describe your heroes - knights, dragons, wizards, animals or anyone!</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-sm">Set the Scene</h4>
                    <p className="text-xs text-muted-foreground">Describe where your story takes place - magical forests, castles, space!</p>
                  </div>
                </div>
              </div>

              <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Illustrations & Story Library
                </h4>
                <p className="text-xs text-muted-foreground">
                  Each story comes with a beautiful AI-generated illustration! Save your stories to your 
                  personal library and download them anytime. Free users get 1 story per month, or upgrade 
                  to Premium for unlimited story creation!
                </p>
              </div>
            </CardContent>
          </Card>

          {user && !usageLoading && (
            <div className="mb-6 space-y-4">
              <StoryLimitBanner
                storiesCreatedThisMonth={storiesCreatedThisMonth}
                isPremium={isPremium}
              />
              {isPremium && (
                <StorySubscriptionManagement
                  subscribed={isPremium}
                  onManageSubscription={manageSubscription}
                />
              )}
            </div>
          )}

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Story</TabsTrigger>
              <TabsTrigger value="library">My Library</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Story Details
              </CardTitle>
              <CardDescription>
                Tell me about the story you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Story Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The Magic Dragon's Adventure"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">🗺️ Adventure</SelectItem>
                    <SelectItem value="fantasy">✨ Fantasy</SelectItem>
                    <SelectItem value="educational">📚 Educational</SelectItem>
                    <SelectItem value="mystery">🔍 Mystery</SelectItem>
                    <SelectItem value="friendship">🤝 Friendship</SelectItem>
                    <SelectItem value="animal">🐾 Animal</SelectItem>
                    <SelectItem value="space">🚀 Space</SelectItem>
                    <SelectItem value="fairy-tale">👑 Fairy Tale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Characters</label>
                <Input
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="e.g., A brave knight, a friendly dragon, a wise wizard"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Theme or Setting</label>
                <Textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., A magical forest where animals can talk"
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleGenerate} className="w-full" disabled={loading || (!isPremium && storiesCreatedThisMonth >= 1)}>
                {loading ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating your story...
                  </>
                ) : (!isPremium && storiesCreatedThisMonth >= 1) ? (
                  'Monthly Limit Reached - Upgrade to Premium'
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create Story!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {story && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {story.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {story.illustration && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={story.illustration} 
                      alt="Story illustration"
                      className="w-full h-auto"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {story.story}
                  </p>
                </div>

                <Button variant="outline" className="w-full" onClick={handleSaveStory}>
                  <Download className="w-4 h-4 mr-2" />
                  Save Story
                </Button>
              </CardContent>
            </Card>
          )}
            </TabsContent>

            <TabsContent value="library">
              {user ? (
                <StoryLibrary />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Sign in to access your story library</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Safe Content Badge */}
        <div className="max-w-2xl mx-auto mt-8">
          <SafeContentBadge />
        </div>
      </main>
      <Footer />
      
      {/* Parental Gate Dialog */}
      <ParentalGate
        isOpen={showParentalGate}
        onSuccess={() => setShowParentalGate(false)}
        onClose={() => {
          // Redirect back if gate not verified
          if (!checkVerification()) {
            window.history.back();
          }
          setShowParentalGate(false);
        }}
        featureName="AI Story Creator"
      />
    </div>
  );
};

export default KidsStoryCreator;