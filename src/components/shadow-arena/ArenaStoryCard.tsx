import { motion } from "framer-motion";
import { Clock, ThumbsUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Story {
  id: string;
  title: string;
  content: string;
  votes_count: number;
  is_top_week: boolean;
  created_at: string;
}

const atmosphereTags = ["Psychological", "Supernatural", "Cosmic Horror", "Gothic", "Slasher", "Folk Horror"];

function getReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function getRandomTag(id: string) {
  const idx = id.charCodeAt(0) % atmosphereTags.length;
  return atmosphereTags[idx];
}

export function ArenaStoryCard({ story }: { story: Story }) {
  const navigate = useNavigate();
  const readTime = getReadingTime(story.content);
  const tag = getRandomTag(story.id);

  return (
    <><FloatingHowItWorks title="ArenaStoryCard — How it works" steps={[{title:"Open this section",desc:"Access ArenaStoryCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<motion.div
      className="group relative rounded-xl border border-red-900/20 bg-gradient-to-br from-card/40 to-red-950/10 overflow-hidden cursor-pointer hover:border-red-600/40 transition-all"
      onClick={() => navigate(`/shadow-arena/story/${story.id}`)}
      whileHover={{ y: -2 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground group-hover:text-red-400 transition-colors truncate">
              {story.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
              <Badge variant="outline" className="text-xs border-red-800/30 text-red-400">{tag}</Badge>
            </div>
          </div>
          {story.is_top_week && (
            <Badge className="bg-yellow-600/80 text-yellow-100 text-xs shrink-0">Top Week</Badge>
          )}
        </div>

        {/* Preview text with hover reveal */}
        <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-4 transition-all">
          {story.content.substring(0, 300)}...
        </p>

        {/* Vote bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1 text-sm text-red-400">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-bold">{story.votes_count}</span>
            <span className="text-muted-foreground">votes</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            Read story
          </div>
        </div>
      </div>
    </motion.div>
  </>
  );
}
