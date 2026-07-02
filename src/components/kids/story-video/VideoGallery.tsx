import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Clock, Loader2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface VideoGalleryProps {
  onSelectStory: (story: any) => void;
}

export const VideoGallery = ({ onSelectStory }: VideoGalleryProps) => {
  const [expanded, setExpanded] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['story-gallery-preview'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      return data || [];
    },
  });

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Video Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    </>
  );
  }

  if (stories.length === 0) return null;

  const displayStories = expanded ? stories : stories.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-purple-800">Recent Stories</h3>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{stories.length}</span>
        </div>
        {stories.length > 3 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'View all'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AnimatePresence>
          {displayStories.map((story: any, i: number) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectStory(story)}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden border-2 border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-video bg-purple-100">
                {story.thumbnail ? (
                  <img src={story.thumbnail} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-5 h-5 text-purple-600 ml-1" />
                  </motion.div>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-purple-800 line-clamp-1">{story.title}</h4>
                <div className="flex items-center gap-3 text-xs text-purple-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                  <span>{story.scene_count || '?'} scenes</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
