import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Star, PawPrint, Crown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const mockPosts = [
  { id: 1, user: "PawMaster", pet: "Max (Golden Retriever)", mood: "Happy 😄", score: 95, likes: 234, comments: 18, badge: "Top Pet" },
  { id: 2, user: "CatWhisperer", pet: "Luna (Siamese Cat)", mood: "Playful 🎾", score: 88, likes: 189, comments: 24, badge: "Cat Lover" },
  { id: 3, user: "BirdTalker", pet: "Kiwi (Cockatiel)", mood: "Excited 🎵", score: 92, likes: 156, comments: 12, badge: "Bird Expert" },
  { id: 4, user: "DogTrainer_Pro", pet: "Rex (German Shepherd)", mood: "Calm 😌", score: 97, likes: 312, comments: 45, badge: "Trainer" },
  { id: 5, user: "FluffyLover", pet: "Mochi (Rabbit)", mood: "Content 🥰", score: 83, likes: 98, comments: 7, badge: "Newbie" },
];

export default function PetSocialNetwork() {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title="How Pet Social Network works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🌍 Pet Social Network</h2>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-xs" onClick={() => navigate("/pet-translator?tool=create-post")}>
          <PawPrint className="h-3 w-3 mr-1" /> Share Your Pet
        </Button>
      </div>

      <div className="space-y-3">
        {mockPosts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/80 border-purple-500/10 hover:border-purple-500/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {post.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{post.user}</span>
                      <Badge variant="outline" className="text-[9px]">{post.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{post.pet}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">{post.mood}</Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-500" /> {post.score}/100
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-pink-400 transition-colors">
                        <Heart className="h-3.5 w-3.5" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-400 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-purple-400 transition-colors">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
    );
}
