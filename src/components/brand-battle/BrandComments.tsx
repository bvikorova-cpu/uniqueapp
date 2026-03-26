import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, Star, Send, User } from "lucide-react";
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
        <Card className="border-dashed border-2 border-primary/20">
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
                <button key={r} onClick={() => setSelectedRating(r)}>
                  <Star
                    className={`h-5 w-5 transition-colors ${r <= selectedRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your experience with a brand..."
                className="flex-1"
              />
              <Button disabled={!newComment.trim()} className="gap-1">
                <Send className="h-4 w-4" /> Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Community Reviews</h3>
        <div className="flex gap-2">
          <Button variant={sortBy === "popular" ? "default" : "outline"} size="sm" onClick={() => setSortBy("popular")}>
            Popular
          </Button>
          <Button variant={sortBy === "recent" ? "default" : "outline"} size="sm" onClick={() => setSortBy("recent")}>
            Recent
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        <AnimatePresence>
          {sorted.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
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
                              className={`h-3 w-3 ${i < comment.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
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
