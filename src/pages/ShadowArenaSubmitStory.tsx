import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
      <div className="container mx-auto p-6 max-w-3xl">
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
