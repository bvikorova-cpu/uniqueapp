import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Star, Send, User, Filter, TrendingUp, Award, Sparkles, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : "0.0";

  return (
    <>
      <FloatingHowItWorks title={"Brand Comments - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Comments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Comments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Review stats banner */}
      <Card className="backdrop-blur-xl bg-gradient-to-r from-primary/5 via-card/80 to-accent/5 border-primary/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, value: comments.length, label: "Total Reviews" },
              { icon: Star, value: avgRating, label: "Avg Rating" },
              { icon: ThumbsUp, value: comments.reduce((s, c) => s + c.likes, 0), label: "Total Likes" },
              { icon: Award, value: new Set(comments.map(c => c.brandName)).size, label: "Brands Reviewed" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-3 rounded-xl backdrop-blur-sm bg-background/40 border border-primary/5"
              >
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Write review */}
      {isAuthenticated && (
        <Card className="border border-primary/20 backdrop-blur-xl bg-card/80 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Write a Brand Review
              <Badge variant="secondary" className="text-xs ml-2">+15 credits</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-muted-foreground mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map(r => (
                <motion.button
                  key={r}
                  onClick={() => setSelectedRating(r)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${r <= selectedRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"}`}
                  />
                </motion.button>
              ))}
              <span className="text-sm font-bold ml-2 text-primary">{selectedRating}/5</span>
            </div>
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your detailed experience with a brand... What makes them great? Any improvements?"
              className="min-h-[80px] bg-background/50 resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Min 20 characters for credit reward</span>
              <Button disabled={!newComment.trim() || newComment.length < 10} className="gap-1.5 shadow-lg shadow-primary/10">
                <Send className="h-4 w-4" /> Post Review
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
            <BarChart3 className="h-3 w-3" /> Popular
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
        <Card className="p-12 text-center backdrop-blur-xl bg-card/80">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to review a brand! Share your experience to help the community and earn 15 credits.
            </p>
          </motion.div>
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
              <Card className="hover:shadow-lg transition-all backdrop-blur-xl bg-card/80 border-primary/5 hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground ml-2">• {comment.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{comment.brandName}</Badge>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < comment.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.text}</p>
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
    </>
  );
};