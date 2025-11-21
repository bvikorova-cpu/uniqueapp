import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ShadowArenaSubmitStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      toast.info('Enhancing your story with AI...');

      const { data, error } = await supabase.functions.invoke('enhance-shadow-story', {
        body: { title, content }
      });

      if (error) throw error;

      toast.success(`Story submitted! Generated ${data.images_generated} AI images`);
      navigate('/shadow-arena/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SubscriptionGate>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-600 bg-clip-text text-transparent">
            📝 Submit Your Horror Story
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Share your terrifying tale and let our AI enhance it with professional illustrations
          </p>
          
          {/* Instructions Card */}
          <Card className="mb-6 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">📋 Story Submission Guidelines</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✍️ <strong>Be Original:</strong> Share your unique horror stories, experiences, or creative fiction</p>
                <p>🎭 <strong>Set the Mood:</strong> Use descriptive language to create atmosphere and tension</p>
                <p>📖 <strong>Keep it Engaging:</strong> Hook readers from the first sentence to the last</p>
                <p>🎨 <strong>AI Enhancement:</strong> Our AI will automatically generate 2-3 illustrations and format your story</p>
                <p>👥 <strong>Audience:</strong> Your story will be visible to all Shadow Arena subscribers</p>
                <p>⚔️ <strong>Battle Ready:</strong> Quality stories may be selected for monthly creator battles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">📝 Submit Your Horror Story</h1>
          <p className="text-muted-foreground mb-8">
            Share your real-life scary experience. Our AI will enhance it with atmospheric images and sounds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Story Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Shadow in the Basement..."
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Your Story</label>
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us your terrifying experience..."
                rows={12}
                disabled={submitting}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Be as detailed as possible. The more vivid, the better the AI enhancements!
              </p>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="font-semibold">AI Enhancements Included:</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  2-3 atmospheric horror illustrations
                </li>
                <li>🔊 Ambient soundtrack for immersion</li>
                <li>✨ Automatic formatting and styling</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Enhancing Story...' : 'Submit Story'}
            </Button>
          </form>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
