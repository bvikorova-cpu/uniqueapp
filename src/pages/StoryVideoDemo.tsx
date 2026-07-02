import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CinematicHero } from '@/components/kids/story-video/CinematicHero';
import { StoryWizardForm } from '@/components/kids/story-video/StoryWizardForm';
import { GenerationProgress } from '@/components/kids/story-video/GenerationProgress';
import { StoryTemplates } from '@/components/kids/story-video/StoryTemplates';
import { VideoGallery } from '@/components/kids/story-video/VideoGallery';
import { StoryRemix } from '@/components/kids/story-video/StoryRemix';
import { TheaterPlayer } from '@/components/kids/story-video/TheaterPlayer';

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const StoryVideoDemo = () => {
  const [loading, setLoading] = useState(false);
  const [storyData, setStoryData] = useState<{ scenes: string[]; images: string[]; audioFiles?: string[] } | null>(null);
  const [sceneDuration, setSceneDuration] = useState(5);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [lastTheme, setLastTheme] = useState('');
  const [templateTheme, setTemplateTheme] = useState('');
  const navigate = useNavigate();

  const handleGenerate = useCallback(async (config: { theme: string; language: string; sceneCount: number; sceneDuration: number }) => {
    if (!config.theme.trim()) {
      toast.error('Please enter a story theme');
      return;
    }
    if (loading) return;

    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < 30000 && lastRequestTime > 0) {
      const waitSecs = Math.ceil((30000 - timeSinceLast) / 1000);
      toast.error(`Please wait ${waitSecs} seconds before generating again.`);
      return;
    }

    setLoading(true);
    setLastRequestTime(now);
    setSceneDuration(config.sceneDuration);
    setLastTheme(config.theme);

    try {
      toast.info('Generating your story... This may take up to 2 minutes.');
      const { data, error } = await supabase.functions.invoke('generate-story-video', {
        body: { theme: config.theme, sceneCount: config.sceneCount, language: config.language },
      });

      if (error) {
        if (error.message?.includes('Too Many Requests') || error.message?.includes('rate limited')) {
          throw new Error('Too many requests. Please wait 30 seconds and try again.');
        }
        throw error;
      }
      if (data.error) throw new Error(data.error);

      setStoryData(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('stories').insert([{
          user_id: user.id,
          title: `Story: ${config.theme.substring(0, 50)}${config.theme.length > 50 ? '...' : ''}`,
          theme: config.theme,
          language: config.language,
          scenes: data.scenes.map((text: string) => ({ text })),
          images: data.images,
          audio_files: data.audioFiles || null,
          thumbnail: data.images[0] || null,
          scene_count: config.sceneCount,
          scene_duration: config.sceneDuration,
        }] as any);
      }

      toast.success('Story video generated and saved!');
    } catch (error: any) {
      console.error('Error generating story video:', error);
      toast.error(error.message || 'Failed to generate story video');
    } finally {
      setLoading(false);
    }
  }, [loading, lastRequestTime]);

  const handleSelectGalleryStory = (story: any) => {
    if (story.scenes && story.images) {
      setStoryData({
        scenes: Array.isArray(story.scenes) ? story.scenes.map((s: any) => s.text || s) : [],
        images: story.images,
        audioFiles: story.audio_files || undefined,
      });
      setSceneDuration(story.scene_duration || 5);
      setLastTheme(story.theme || '');
    }
  };

  const handleTemplateSelect = (theme: string) => {
    setTemplateTheme(theme);
  };

  return (
    <>
      <FloatingHowItWorks title="How Story Video Demo works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Nav */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => navigate('/kids-channel')} className="gap-2">
            <ArrowLeft className="w-5 h-5" /> Back
          </Button>
          <Button variant="outline" onClick={() => navigate('/story-gallery')} className="gap-2">
            <BookOpen className="w-5 h-5" /> My Gallery
          </Button>
        </div>

        {/* Hero */}
        <CinematicHero />

        <HeroRewardedAd sectionKey="page_storyvideodemo" />

        {storyData ? (
          <div className="space-y-6">
            <TheaterPlayer
              storyData={storyData}
              sceneDuration={sceneDuration}
              onBack={() => { setStoryData(null); setLastTheme(''); }}
            />
            <StoryRemix currentTheme={lastTheme} onRemix={(theme) => {
              setStoryData(null);
              setTemplateTheme(theme);
            }} />
          </div>
        ) : loading ? (
          <GenerationProgress isGenerating={loading} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StoryWizardForm onGenerate={handleGenerate} loading={loading} initialTheme={templateTheme} />
            </div>
            <div className="space-y-6">
              <StoryTemplates onSelect={handleTemplateSelect} />
              <VideoGallery onSelectStory={handleSelectGalleryStory} />
            </div>
          </div>
        )}
      </div>
    </div>
    </>
    );
};

export default StoryVideoDemo;
