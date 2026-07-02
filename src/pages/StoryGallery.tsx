import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Trash2, Clock, ArrowLeft, Loader2, Share2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  thumbnail: string | null;
  scene_count: number;
  scene_duration: number;
  created_at: string;
  share_code?: string | null;
  is_shareable?: boolean;
}

export default function StoryGallery() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [playingStory, setPlayingStory] = useState<Story | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareStory, setShareStory] = useState<Story | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to view your stories');
        return;
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setStories((data as any) || []);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (story: Story) => {
    setSelectedStory(story);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStory) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', selectedStory.id);

      if (error) throw error;

      toast.success('Story deleted successfully');
      setStories(stories.filter(s => s.id !== selectedStory.id));
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedStory(null);
    }
  };

  const handlePlayStory = (story: Story) => {
    setPlayingStory(story);
  };

  const handleShareClick = async (story: Story) => {
    setShareStory(story);
    
    // Generate share code if not exists
    if (!story.share_code) {
      try {
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_story_share_code');

        if (codeError) throw codeError;

        const shareCode = codeData;

        const { error: updateError } = await supabase
          .from('stories')
          .update({
            share_code: shareCode,
            is_shareable: true
          } as any)
          .eq('id', story.id);

        if (updateError) throw updateError;

        // Update local story
        setStories(stories.map(s => 
          s.id === story.id 
            ? { ...s, share_code: shareCode, is_shareable: true }
            : s
        ));
        
        setShareStory({ ...story, share_code: shareCode, is_shareable: true });
      } catch (error) {
        console.error('Error generating share code:', error);
        toast.error('Failed to generate share link');
        return;
      }
    }
    
    setShareDialogOpen(true);
  };

  const getShareUrl = (shareCode: string | null) => {
    if (!shareCode) return '';
    return `${window.location.origin}/shared/${shareCode}`;
  };

  const handleCopyLink = () => {
    if (!shareStory?.share_code) return;
    
    navigator.clipboard.writeText(getShareUrl(shareStory.share_code));
    setCopied(true);
    toast.success('Link copied to clipboard!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStopSharing = async () => {
    if (!shareStory) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_shareable: false } as any)
        .eq('id', shareStory.id);

      if (error) throw error;

      setStories(stories.map(s => 
        s.id === shareStory.id 
          ? { ...s, is_shareable: false }
          : s
      ));

      toast.success('Story sharing stopped');
      setShareDialogOpen(false);
    } catch (error) {
      console.error('Error stopping sharing:', error);
      toast.error('Failed to stop sharing');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (playingStory) {
    return (
      <>
        <FloatingHowItWorks title="How Story Gallery works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <Button
            variant="outline"
            onClick={() => setPlayingStory(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-800 mb-2">
              {playingStory.title}
            </h1>
            <p className="text-purple-600">Theme: {playingStory.theme}</p>
          </div>

          <StoryVideoPlayer
            scenes={playingStory.scenes.map(s => s.text)}
            images={playingStory.images}
            audioFiles={playingStory.audio_files || undefined}
            sceneDuration={playingStory.scene_duration}
          />
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-800 mb-2">
              📚 My Story Gallery
            </h1>
            <p className="text-purple-600">
              View and replay your previously generated stories
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/story-video-demo')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Create New Story
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <Card className="border-2 border-dashed border-purple-300">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="text-6xl">📖</div>
              <h3 className="text-2xl font-semibold text-purple-800">
                No stories yet
              </h3>
              <p className="text-purple-600 text-center max-w-md">
                Start creating magical stories for kids! They will be saved here so you can watch them anytime.
              </p>
              <Button
                onClick={() => navigate('/story-video-demo')}
                className="gap-2"
              >
                Create Your First Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-purple-200 hover:border-purple-400"
              >
                <div className="relative aspect-video bg-gradient-to-br from-purple-200 to-pink-200">
                  {story.thumbnail || story.images[0] ? (
                    <img
                      src={story.thumbnail || story.images[0]}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📚
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => handlePlayStory(story)}
                      size="lg"
                      className="gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Play Story
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-purple-800 line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-sm text-purple-600 line-clamp-1">
                      Theme: {story.theme}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-purple-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(story.created_at)}
                    </span>
                    <span>
                      {story.scene_count} scenes
                    </span>
                    <span className="uppercase">
                      {story.language}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handlePlayStory(story)}
                      className="flex-1 gap-2"
                      size="sm"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </Button>
                    <Button
                      onClick={() => handleShareClick(story)}
                      variant="outline"
                      size="sm"
                      title="Share story"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(story)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Story?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedStory?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-600" />
                Share Story
              </DialogTitle>
              <DialogDescription>
                Share this magical story with friends and family!
              </DialogDescription>
            </DialogHeader>
            
            {shareStory?.is_shareable && shareStory?.share_code && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-purple-800">
                    Share Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareStory.share_code}
                      readOnly
                      className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg font-mono text-lg text-center"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600">
                    Anyone with this code can view your story
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-purple-800">
                    Share Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={getShareUrl(shareStory.share_code)}
                      readOnly
                      className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      size="sm"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleStopSharing}
                  variant="outline"
                  className="w-full"
                >
                  Stop Sharing
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
