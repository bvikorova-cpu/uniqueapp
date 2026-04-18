import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { StoryNarratorPanel } from '@/components/shadow-arena/StoryNarratorPanel';
import { PatronModeCard } from '@/components/shadow-arena/PatronModeCard';
import { ThumbsUp, Image as ImageIcon, Volume2, ArrowLeft, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ShadowArenaStoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (storyId) fetchStory();
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
    if (!user) { toast.error('Please sign in to vote'); return; }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </SubscriptionGate>
    );
  }

  if (!story) {
    return (
      <SubscriptionGate>
        <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 text-center">
          <p className="text-muted-foreground">Story not found</p>
        </div>
      </SubscriptionGate>
    );
  }

  const images = Array.isArray(story.ai_images) ? story.ai_images : [];
  const readingTime = Math.max(1, Math.ceil((story.content?.length || 0) / 1200));

  return (
    <SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shadow-arena/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Story hero header */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(0,20%,5%)] via-[hsl(280,30%,8%)] to-[hsl(0,0%,3%)] p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-900/15 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {story.is_top_week && (
                  <Badge className="bg-yellow-600/80 text-yellow-100 text-xs">Top of the Week</Badge>
                )}
                <Badge variant="outline" className="border-red-800/40 text-red-400 text-xs">Anonymous</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {readingTime} min read
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {story.votes_count} votes
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {story.title}
              </h1>
            </div>

            <motion.div
              className="flex flex-col items-center gap-2 shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-4xl font-black text-red-400">{story.votes_count}</p>
              <p className="text-xs text-muted-foreground">votes</p>
              <Button
                onClick={handleVote}
                disabled={voting}
                className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40"
                size="sm"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                {voting ? 'Voting...' : 'Vote'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Voice Narrator */}
        <StoryNarratorPanel
          text={story.content || ""}
          storyId={story.id}
          existingAudioUrl={story.ai_sound_url}
        />

        {/* Patron Mode — support this author */}
        {story.user_id && story.user_id !== user?.id && (
          <PatronModeCard authorUserId={story.user_id} authorName="this author" />
        )}

        {/* Story content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 mb-6 border-red-900/15 bg-gradient-to-b from-card/80 to-card/40">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-foreground/90">
                {story.content}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* AI images */}
        {images.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-bold text-purple-300">AI-Generated Atmospheric Images</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {images.map((img: string, index: number) => (
                <motion.div
                  key={index}
                  className="rounded-xl overflow-hidden border border-red-900/20 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={img}
                    alt={`Atmospheric illustration ${index + 1}`}
                    className="w-full h-auto group-hover:brightness-110 transition-all"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audio */}
        {story.ai_sound_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-purple-900/20 bg-purple-950/10">
              <div className="flex items-center gap-2 mb-4">
                <Volume2 className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-300">Ambient Soundtrack</h3>
              </div>
              <audio controls className="w-full">
                <source src={story.ai_sound_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </Card>
          </motion.div>
        )}
      </div>
    </SubscriptionGate>
  );
}
