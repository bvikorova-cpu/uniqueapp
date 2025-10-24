import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StoryVideoPlayer } from '@/components/kids/StoryVideoPlayer';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoryVideoDemo = () => {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [storyData, setStoryData] = useState<{ scenes: string[], images: string[] } | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Please enter a story theme');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-story-video', {
        body: { theme }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setStoryData(data);
      toast.success('Story video generated!');
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
        <div className="flex items-center gap-4 pt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/kids-channel')}
            className="gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
              AI Story Video Generator
            </h1>
            <p className="text-lg text-purple-600">
              Create magical animated bedtime stories in minutes
            </p>
          </div>
        </div>

        {!storyData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
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
            <StoryVideoPlayer scenes={storyData.scenes} images={storyData.images} />
            
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
