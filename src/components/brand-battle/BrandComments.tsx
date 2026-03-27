import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, Star, Send, User, Filter, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  brandId: string;
  brandName: string;
  text: string;
  rating: number;
  likes: number;
  author: string;
  date: string;
}

interface BrandCommentsProps {
  isAuthenticated: boolean;
}

export const BrandComments = ({ isAuthenticated }: BrandCommentsProps) => {
  const [comments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular");

  const sorted = [...comments].sort((a, b) =>
    sortBy === "popular" ? b.likes - a.likes : 0
  );

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Write review */}
      {isAuthenticated && (
        <Card className="border border-primary/20 backdrop-blur-xl bg-card/80 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Write a Brand Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-muted-foreground mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map(r => (
                <motion.button
                  key={r}
                  onClick={() => setSelectedRating(r)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${r <= selectedRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                  />
                </motion.button>
              ))}
              <span className="text-sm font-medium ml-2 text-muted-foreground">{selectedRating}/5</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your experience with a brand..."
                className="flex-1 bg-background/50"
              />
              <Button disabled={!newComment.trim()} className="gap-1.5">
                <Send className="h-4 w-4" /> Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Community Reviews
        </h3>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
            className="gap-1"
          >
            <Filter className="h-3 w-3" /> Popular
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            Recent
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <Card className="p-8 text-center backdrop-blur-xl bg-card/80">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">No Reviews Yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to review a brand! Share your experience to help the community.
          </p>
        </Card>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        <AnimatePresence>
          {sorted.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all backdrop-blur-xl bg-card/80 border-primary/5 hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">• {comment.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Badge variant="outline" className="text-xs">{comment.brandName}</Badge>
                        <div className="flex ml-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < comment.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1 ${likedIds.has(comment.id) ? "text-primary" : ""}`}
                      onClick={() => toggleLike(comment.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${likedIds.has(comment.id) ? "fill-primary" : ""}`} />
                      <span className="text-xs">{comment.likes + (likedIds.has(comment.id) ? 1 : 0)}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
