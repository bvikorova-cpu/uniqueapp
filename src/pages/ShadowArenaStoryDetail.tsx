import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { ThumbsUp, Image as ImageIcon, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ShadowArenaStoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (error) throw error;
      setStory(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      setVoting(true);
      
      const { error } = await supabase
        .from('shadow_stories')
        .update({ votes_count: story.votes_count + 1 })
        .eq('id', storyId);

      if (error) throw error;

      setStory({ ...story, votes_count: story.votes_count + 1 });
      toast.success('Vote added!');
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <SubscriptionGate>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SubscriptionGate>
    );
  }

  if (!story) {
    return (
      <SubscriptionGate>
        <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 text-center">
          <p>Story not found</p>
        </div>
      </SubscriptionGate>
    );
  }

  const images = Array.isArray(story.ai_images) ? story.ai_images : [];

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/shadow-arena/dashboard')}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {story.is_top_week && (
                  <Badge variant="default">Top of the Week</Badge>
                )}
                <Badge variant="outline">Anonymous</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{story.votes_count}</p>
              <p className="text-sm text-muted-foreground mb-4">votes</p>
              <Button onClick={handleVote} disabled={voting}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                {voting ? 'Voting...' : 'Vote'}
              </Button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-lg whitespace-pre-wrap">{story.content}</p>
          </div>

          {images.length > 0 && (
            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                AI-Generated Atmospheric Images
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {images.map((img: string, index: number) => (
                  <div key={index} className="rounded-lg overflow-hidden border">
                    <img 
                      src={img} 
                      alt={`Atmospheric illustration ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {story.ai_sound_url && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Ambient Soundtrack
              </h3>
              <audio controls className="w-full">
                <source src={story.ai_sound_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </Card>
      </div>
    </SubscriptionGate>
  );
}
