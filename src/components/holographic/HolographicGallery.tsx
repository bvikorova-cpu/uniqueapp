import { useState } from "react";
import { ArrowLeft, Eye, Heart, Share2, Star, Grid3X3, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const GALLERY_AVATARS = [
  { id: 1, name: "NeonWraith", owner: "Alex M.", style: "Cyberpunk", likes: 847, views: 3200, featured: true, level: 42 },
  { id: 2, name: "CrystalSage", owner: "Maya R.", style: "Crystal", likes: 623, views: 2800, featured: true, level: 38 },
  { id: 3, name: "ShadowKing", owner: "Drake L.", style: "Shadow", likes: 534, views: 2100, featured: false, level: 51 },
  { id: 4, name: "CosmicVoid", owner: "Star K.", style: "Cosmic", likes: 445, views: 1900, featured: false, level: 35 },
  { id: 5, name: "BioHunter", owner: "Leaf J.", style: "Bio-Organic", likes: 389, views: 1600, featured: true, level: 29 },
  { id: 6, name: "MysticOracle", owner: "Luna W.", style: "Mystic", likes: 312, views: 1400, featured: false, level: 44 },
  { id: 7, name: "FlamePhoenix", owner: "Ignis T.", style: "Cyberpunk", likes: 278, views: 1200, featured: false, level: 33 },
  { id: 8, name: "FrostQueen", owner: "Winter S.", style: "Crystal", likes: 256, views: 1100, featured: false, level: 27 },
  { id: 9, name: "VoidWalker", owner: "Nyx P.", style: "Shadow", likes: 234, views: 980, featured: false, level: 46 },
];

const styleGradients: Record<string, string> = {
  "Cyberpunk": "from-cyan-500/20 via-violet-500/10 to-pink-500/20",
  "Crystal": "from-blue-500/20 via-purple-500/10 to-indigo-500/20",
  "Shadow": "from-gray-800/40 via-purple-900/20 to-gray-700/30",
  "Cosmic": "from-indigo-500/20 via-blue-600/10 to-violet-500/20",
  "Bio-Organic": "from-emerald-500/20 via-green-600/10 to-teal-500/20",
  "Mystic": "from-amber-500/20 via-orange-500/10 to-red-500/20",
};

export const HolographicGallery = ({ onBack }: Props) => {
  const [filter, setFilter] = useState("all");
  const [likedAvatars, setLikedAvatars] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedAvatars(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = filter === "featured" ? GALLERY_AVATARS.filter(a => a.featured) : GALLERY_AVATARS;

  return (
    <>
      <FloatingHowItWorks
        title='Holographic Gallery'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Holographic Gallery panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Holographic Gallery</h2>
          <p className="text-sm text-muted-foreground">Browse stunning avatar creations from the community</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}><LayoutGrid className="w-3 h-3 mr-1" /> All</Button>
        <Button size="sm" variant={filter === "featured" ? "default" : "outline"} onClick={() => setFilter("featured")}><Star className="w-3 h-3 mr-1" /> Featured</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((avatar, i) => (
            <motion.div key={avatar.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}>
              <Card className="overflow-hidden group hover:border-primary/40 transition-all">
                <div className={`h-40 bg-gradient-to-br ${styleGradients[avatar.style] || "from-primary/20 to-accent/20"} flex items-center justify-center relative`}>
                  <Sparkles className="w-16 h-16 text-primary/30 group-hover:text-primary/60 transition-colors" />
                  {avatar.featured && <Badge className="absolute top-2 right-2 bg-amber-500/80 text-white text-xs">Featured</Badge>}
                  <Badge className="absolute top-2 left-2 text-xs bg-card/60 backdrop-blur-sm">Lv.{avatar.level}</Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-black text-sm">{avatar.name}</h3>
                      <p className="text-xs text-muted-foreground">by {avatar.owner}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{avatar.style}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <button onClick={() => toggleLike(avatar.id)} className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                        <Heart className={`w-3.5 h-3.5 ${likedAvatars.includes(avatar.id) ? "fill-pink-500 text-pink-500" : ""}`} />
                        {avatar.likes + (likedAvatars.includes(avatar.id) ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{avatar.views}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={async () => {
                      const url = `${window.location.origin}/holographic?avatar=${avatar.id}`;
                      const shareData = { title: avatar.name, text: `Check out ${avatar.name} by ${avatar.owner}`, url };
                      try {
                        if (navigator.share) await navigator.share(shareData);
                        else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
                      } catch {}
                    }}><Share2 className="w-3 h-3" /></Button>
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
