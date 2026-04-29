import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsStoryCreator } from "@/hooks/useKidsStoryCreator";
import { StoryLimitBanner } from "@/components/kids-story/StoryLimitBanner";
import { StoryLibrary } from "@/components/kids-story/StoryLibrary";
import { StorySubscriptionManagement } from "@/components/kids-story/StorySubscriptionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";
import { StoryCreatorHero } from "@/components/kids-story/StoryCreatorHero";
import { StoryQuickTemplates } from "@/components/kids-story/StoryQuickTemplates";
import { StoryWizardFlow } from "@/components/kids-story/StoryWizardFlow";
import { StorybookDisplay } from "@/components/kids-story/StorybookDisplay";
import { useNavigate } from "react-router-dom";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const KidsStoryCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { storiesCreatedThisMonth, isPremium, loading: usageLoading, refreshUsage, manageSubscription } = useKidsStoryCreator();
  const [loading, setLoading] = useState(false);
  const [continuingStory, setContinuingStory] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [templateData, setTemplateData] = useState<{ title: string; characters: string; theme: string; category: string } | undefined>();

  // PARENTAL GATE STATE
  const PARENTAL_GATE_KEY = "parental_gate_verified_kids_story_creator";

  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const stored = sessionStorage.getItem(PARENTAL_GATE_KEY);
    if (!stored) return false;
    try {
      const { expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) return true;
      sessionStorage.removeItem(PARENTAL_GATE_KEY);
      return false;
    } catch {
      sessionStorage.removeItem(PARENTAL_GATE_KEY);
      return false;
    }
  });

  useEffect(() => {
    const tick = () => {
      const stored = sessionStorage.getItem(PARENTAL_GATE_KEY);
      if (!stored) { if (isVerified) setIsVerified(false); return; }
      try {
        const { expiresAt } = JSON.parse(stored);
        if (Date.now() >= expiresAt) {
          sessionStorage.removeItem(PARENTAL_GATE_KEY);
          if (isVerified) setIsVerified(false);
        }
      } catch {
        sessionStorage.removeItem(PARENTAL_GATE_KEY);
        if (isVerified) setIsVerified(false);
      }
    };
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [isVerified]);

  const handleVerificationSuccess = () => setIsVerified(true);

  const handleGenerate = async (data: { title: string; characters: string; theme: string; category: string; illustrationStyle: string }) => {
    if (!data.title.trim() || !data.characters.trim() || !data.theme.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!user) {
      toast.error("Please sign in to create stories");
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('kids-story-creator', {
        body: { title: data.title, characters: data.characters, theme: data.theme, category: data.category, illustrationStyle: data.illustrationStyle }
      });

      if (error) {
        if (error.message?.includes('Monthly limit reached')) {
          toast.error('Monthly limit reached! Upgrade to Premium for unlimited stories.', { duration: 5000 });
          refreshUsage();
          return;
        }
        throw error;
      }

      setStory(result);
      refreshUsage();
      toast.success("Your story is ready! 📖");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async () => {
    if (!story) return;
    setContinuingStory(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('kids-story-creator', {
        body: {
          title: story.title + " — Part 2",
          characters: story.characters || "same characters",
          theme: "Continue the story: " + story.story.slice(-300),
          category: story.category || "adventure",
          continueFrom: story.story.slice(-500),
        }
      });

      if (error) throw error;

      setStory({
        ...story,
        title: story.title,
        story: story.story + "\n\n--- Part 2 ---\n\n" + (result?.story || ""),
      });
      refreshUsage();
      toast.success("Story continued! 📖✨");
    } catch (err: any) {
      console.error('Continue error:', err);
      toast.error(err.message || "Failed to continue story");
    } finally {
      setContinuingStory(false);
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

  const handleTemplateSelect = (template: { title: string; characters: string; theme: string; category: string }) => {
    setTemplateData({ ...template });
    toast.success(`Template "${template.title}" loaded! Customize and create.`);
  };

  // BLOCKING PARENTAL GATE
  if (!isVerified) {
    return (
      <div className="min-h-screen">
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={handleVerificationSuccess}
          onCancel={() => {}}
          featureName="AI Story Creator"
        />
      </div>
    );
  }

  const isLimitReached = !isPremium && storiesCreatedThisMonth >= 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <StoryCreatorHero />

          <HeroRewardedAd sectionKey="page_kidsstorycreator" />

          {user && !usageLoading && (
            <div className="mb-6 space-y-4">
              <StoryLimitBanner storiesCreatedThisMonth={storiesCreatedThisMonth} isPremium={isPremium} />
              {isPremium && (
                <StorySubscriptionManagement subscribed={isPremium} onManageSubscription={manageSubscription} />
              )}
            </div>
          )}

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">✨ Create Story</TabsTrigger>
              <TabsTrigger value="library">📚 My Library</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-8">
              {story ? (
                <div className="space-y-6">
                  <StorybookDisplay
                    story={story}
                    onSave={handleSaveStory}
                    onContinue={handleContinueStory}
                    showContinue={isPremium}
                    continuingStory={continuingStory}
                  />
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setStory(null)} className="gap-2">
                      ✨ Create Another Story
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <StoryQuickTemplates onSelect={handleTemplateSelect} />
                  <StoryWizardFlow
                    onGenerate={handleGenerate}
                    loading={loading}
                    disabled={isLimitReached}
                    initialData={templateData}
                  />
                </>
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

        <div className="max-w-2xl mx-auto mt-8">
          <SafeContentBadge />
        </div>
      </main>
    </div>
  );
};

export default KidsStoryCreator;
