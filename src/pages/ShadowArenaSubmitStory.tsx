import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, ArrowLeft, Feather, Eye, Skull, Volume2, Pen } from 'lucide-react';
import { motion } from 'framer-motion';
import { GothicPageHeader } from '@/components/shadow-arena/GothicPageHeader';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const guidelines = [
  { icon: Pen, title: "Be Original", desc: "Share your unique horror stories, experiences, or creative fiction" },
  { icon: Skull, title: "Set the Mood", desc: "Use descriptive language to create atmosphere and tension" },
  { icon: Eye, title: "Keep it Engaging", desc: "Hook readers from the first sentence to the last" },
  { icon: ImageIcon, title: "AI Enhancement", desc: "Our AI will generate 2-3 illustrations and format your story" },
  { icon: Feather, title: "Audience", desc: "Your story will be visible to all Shadow Arena subscribers" },
  { icon: Sparkles, title: "Battle Ready", desc: "Quality stories may be selected for monthly creator battles" },
];

const aiFeatures = [
  { icon: ImageIcon, label: "2-3 atmospheric horror illustrations" },
  { icon: Volume2, label: "Ambient soundtrack for immersion" },
  { icon: Sparkles, label: "Automatic formatting and styling" },
];

export default function ShadowArenaSubmitStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const charCount = content.length;

  return (
    <><FloatingHowItWorks title="ShadowArenaSubmitStory — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaSubmitStory from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<SubscriptionGate>
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shadow-arena/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Cinematic gothic hero */}
        <GothicPageHeader
          icon={Feather}
          title="Submit Your Horror Story"
          subtitle="Share your terrifying tale and let our AI enhance it with cinematic illustrations and ambient soundtrack"
        />

        {/* Guidelines grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {guidelines.map((g, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-card/30 border border-red-900/15 hover:border-red-700/30 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <g.icon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{g.title}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 border-red-900/20 bg-gradient-to-b from-card/80 to-card/40">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium mb-2 text-red-200/80">Story Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Shadow in the Basement..."
                  disabled={submitting}
                  className="bg-background/50 border-red-900/20 focus:border-red-700/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-red-200/80">Your Story</label>
                  <span className="text-xs text-muted-foreground">{charCount} characters</span>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us your terrifying experience..."
                  rows={14}
                  disabled={submitting}
                  className="bg-background/50 border-red-900/20 focus:border-red-700/50 font-serif"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Be as detailed as possible. The more vivid, the better the AI enhancements!
                </p>
              </div>

              {/* AI features */}
              <div className="rounded-xl border border-purple-900/20 bg-purple-950/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <p className="font-semibold text-sm text-purple-300">AI Enhancements Included</p>
                </div>
                <div className="space-y-2">
                  {aiFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <f.icon className="h-3.5 w-3.5 text-purple-400/70" />
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40 shadow-lg"
                disabled={submitting || !title.trim() || !content.trim()}
              >
                {submitting ? 'Enhancing Story with AI...' : 'Submit Story'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </SubscriptionGate>
  </>
  );
}
