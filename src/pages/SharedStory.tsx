import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StoryVideoPlayer } from '@/components/kids/StoryVideoPlayer';

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Story {
  id: string;
  title: string;
  theme: string;
  language: string;
  scenes: { text: string }[];
  images: string[];
  audio_files: string[] | null;
  scene_duration: number;
  created_at: string;
}

export default function SharedStory() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadSharedStory();
  }, [shareCode]);

  const loadSharedStory = async () => {
    if (!shareCode) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('share_code', shareCode.toUpperCase())
        .eq('is_shareable', true)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setStory(data as any);
    } catch (error) {
      console.error('Error loading shared story:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Shared Story works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
          <p className="text-purple-600 text-lg">Loading shared story...</p>
        </div>
      </div>
      </>
      );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed border-purple-300">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="text-6xl">❌</div>
              <h3 className="text-2xl font-semibold text-purple-800">
                Story Not Found
              </h3>
              <p className="text-purple-600 text-center max-w-md">
                This story doesn't exist or is no longer being shared.
                Please check the share code and try again.
              </p>
              <Button
                onClick={() => navigate('/story-video-demo')}
                className="gap-2"
              >
                Create Your Own Story
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/story-video-demo')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Create Your Own Story
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-800">
            🎬 {story.title}
          </h1>
          <p className="text-purple-600">Theme: {story.theme}</p>
          <p className="text-sm text-purple-500">
            Shared with you • {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }).format(new Date(story.created_at))}
          </p>
        </div>

        <StoryVideoPlayer
          scenes={story.scenes.map(s => s.text)}
          images={story.images}
          audioFiles={story.audio_files || undefined}
          sceneDuration={story.scene_duration}
        />

        <div className="text-center pt-4">
          <p className="text-purple-600 mb-4">
            ✨ Like this story? Create your own magical stories!
          </p>
          <Button
            onClick={() => navigate('/story-video-demo')}
            size="lg"
            className="gap-2"
          >
            Create My Story
          </Button>
        </div>
      </div>
    </div>
  );
}
