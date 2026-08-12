import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface StoryComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function StoryComments({ storyId }: { storyId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('shadow_story_comments')
      .select('id, user_id, content, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Load comments error:', error);
    } else {
      const rows = (data || []) as StoryComment[];
      setComments(rows);
      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (ids.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', ids);
        const map: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          map[p.id] = p.display_name || 'Anonymous';
        });
        setNames(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const submit = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    const body = text.trim();
    if (body.length < 2) {
      toast.error('Comment is too short');
      return;
    }
    setPosting(true);
    const { error } = await supabase
      .from('shadow_story_comments')
      .insert({ story_id: storyId, user_id: user.id, content: body.slice(0, 2000) });
    setPosting(false);
    if (error) {
      console.error('Comment error:', error);
      toast.error(error.message || 'Failed to post comment');
      return;
    }
    setText('');
    toast.success('Comment posted');
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('shadow_story_comments').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete comment');
      return;
    }
    setComments((c) => c.filter((x) => x.id !== id));
  };

  return (
    <Card className="p-5 mt-6 border-red-900/20 bg-gradient-to-b from-card/80 to-card/40">
      <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
        <MessageCircle className="w-5 h-5 text-red-400" />
        Comments ({comments.length})
      </h3>

      <div className="space-y-2 mb-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this story..."
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            onClick={submit}
            disabled={posting}
            className="bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-600 hover:to-purple-700"
          >
            {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Post comment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet — be the first to react.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-red-900/20 bg-background/40 p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold">{names[c.user_id] || 'Anonymous'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  {user?.id === c.user_id && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground/90">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
