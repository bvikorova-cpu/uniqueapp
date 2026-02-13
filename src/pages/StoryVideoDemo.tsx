import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StoryVideoPlayer } from '@/components/kids/StoryVideoPlayer';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoryVideoDemo = () => {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [storyData, setStoryData] = useState<{ scenes: string[], images: string[], audioFiles?: string[] } | null>(null);
  const [sceneCount, setSceneCount] = useState(4);
  const MAX_SCENES = 6;
  const [sceneDuration, setSceneDuration] = useState(5);
  const [language, setLanguage] = useState('english');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Please enter a story theme');
      return;
    }
    if (loading) return; // prevent double clicks

    setLoading(true);
    try {
      toast.info('Generating your story... This may take up to 2 minutes.');
      const { data, error } = await supabase.functions.invoke('generate-story-video', {
        body: { theme, sceneCount, language }
      });

      if (error) {
        if (error.message?.includes('Too Many Requests') || error.message?.includes('ThrottlerException')) {
          throw new Error('Too many requests. Please wait 30 seconds and try again.');
        }
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStoryData(data);
      
      // Save story to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: saveError } = await supabase.from('stories').insert([{
          user_id: user.id,
          title: `Story: ${theme.substring(0, 50)}${theme.length > 50 ? '...' : ''}`,
          theme: theme,
          language: language,
          scenes: data.scenes.map((text: string) => ({ text })),
          images: data.images,
          audio_files: data.audioFiles || null,
          thumbnail: data.images[0] || null,
          scene_count: sceneCount,
          scene_duration: sceneDuration,
        }] as any);
        
        if (saveError) {
          console.error('Error saving story:', saveError);
          toast.error('Story generated but failed to save to gallery');
        }
      }
      
      toast.success('Story video generated and saved!');
    } catch (error: any) {
      console.error('Error generating story video:', error);
      toast.error(error.message || 'Failed to generate story video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/kids-channel')}
            className="gap-2 mt-12"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          
          <div className="flex-1 text-center pt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
              AI Story Video Generator
            </h1>
            <p className="text-lg text-purple-600">
              Create magical animated bedtime stories in minutes
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/story-gallery')}
            className="gap-2 mt-12"
          >
            <BookOpen className="w-5 h-5" />
            My Gallery
          </Button>
        </div>

        {!storyData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-purple-800">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
                className="w-full text-lg p-4 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
              >
                <option value="english">English</option>
                <option value="slovak">Slovenčina</option>
                <option value="czech">Čeština</option>
                <option value="hungarian">Magyar</option>
                <option value="german">Deutsch</option>
                <option value="spanish">Español</option>
                <option value="french">Français</option>
                <option value="italian">Italiano</option>
                <option value="polish">Polski</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-semibold text-purple-800">
                What story would you like to create?
              </label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., A brave little dragon learning to fly..."
                className="text-lg p-6"
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-purple-800">
                  Number of Scenes: {sceneCount}
                </label>
                <input
                  type="range"
                  min="2"
                  max={MAX_SCENES}
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  disabled={loading}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-xs text-purple-600">2-{MAX_SCENES} scenes (max {MAX_SCENES} due to generation time)</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-purple-800">
                  Scene Duration: {sceneDuration}s
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={sceneDuration}
                  onChange={(e) => setSceneDuration(Number(e.target.value))}
                  disabled={loading}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <p className="text-xs text-pink-600">3-10 seconds per scene</p>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="w-full text-lg py-6 gap-2"
            >
              <Sparkles className="w-6 h-6" />
              {loading ? 'Creating Magic...' : 'Generate Story Video'}
            </Button>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🎨</div>
                <div className="font-semibold text-purple-800">AI Art</div>
                <div className="text-sm text-purple-600">Beautiful illustrations</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-3xl mb-2">✨</div>
                <div className="font-semibold text-pink-800">Animations</div>
                <div className="text-sm text-pink-600">Smooth transitions</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📹</div>
                <div className="font-semibold text-blue-800">Export</div>
                <div className="text-sm text-blue-600">Download as video</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          <StoryVideoPlayer 
            scenes={storyData.scenes} 
            images={storyData.images}
            audioFiles={storyData.audioFiles}
            sceneDuration={sceneDuration}
          />
            
            <div className="text-center">
              <Button
                onClick={() => {
                  setStoryData(null);
                  setTheme('');
                }}
                variant="outline"
                size="lg"
              >
                Create Another Story
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryVideoDemo;
