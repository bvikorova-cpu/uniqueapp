import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, FolderPlus, Download, Share2, Printer, Eye, Brush } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ColoringPage {
  id: string;
  processed_image_url: string;
  original_image_url?: string;
  difficulty: string;
  created_at: string;
}

interface ColoringFavoritesProps {
  pages: ColoringPage[];
  onToggleFavorite?: (pageId: string) => void;
  onDelete?: (pageId: string) => void;
  onColorOnline?: (imageUrl: string) => void;
  favoriteIds: Set<string>;
}

export function ColoringFavorites({ pages, onToggleFavorite, onDelete, onColorOnline, favoriteIds }: ColoringFavoritesProps) {
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>(["Animals", "Mandalas", "My Best"]);
  const [newCollection, setNewCollection] = useState("");

  const displayedPages = viewMode === "favorites" ? pages.filter((p) => favoriteIds.has(p.id)) : pages;

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ title: "My Coloring Page", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handlePrint = (url: string) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh"><img src="${url}" style="max-width:100%;max-height:100vh" onload="window.print()"/></body></html>`);
    }
  };

  const addCollection = () => {
    if (newCollection.trim() && !collections.includes(newCollection.trim())) {
      setCollections([...collections, newCollection.trim()]);
      setNewCollection("");
      toast.success(`Collection "${newCollection.trim()}" created!`);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Coloring Favorites - How it works"} steps={[{ title: 'Open', desc: 'Access the Coloring Favorites section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coloring Favorites.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === "all" ? "default" : "outline"} onClick={() => setViewMode("all")}>
            All ({pages.length})
          </Button>
          <Button size="sm" variant={viewMode === "favorites" ? "default" : "outline"} onClick={() => setViewMode("favorites")}>
            <Heart className="h-4 w-4 mr-1 fill-current" /> Favorites ({favoriteIds.size})
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><FolderPlus className="h-4 w-4 mr-1" /> Collections</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>My Collections</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="New collection name..." value={newCollection} onChange={(e) => setNewCollection(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCollection()} />
                <Button onClick={addCollection}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <Badge key={c} variant="secondary" className="text-sm py-1.5 px-3">
                    <FolderPlus className="w-3 h-3 mr-1" /> {c}
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      {displayedPages.length === 0 ? (
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardContent className="py-12 text-center text-muted-foreground">
            {viewMode === "favorites" ? <p>No favorites yet. Click the heart on any page to save it!</p> : <p>No coloring pages yet. Generate your first one!</p>}
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedPages.map((page, i) => (
              <motion.div key={page.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.03 }}>
                <Card className="group overflow-hidden backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="relative">
                    <img src={page.processed_image_url} alt="Coloring page" className="w-full aspect-square object-cover cursor-pointer" onClick={() => setLightboxImage(page.processed_image_url)} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setLightboxImage(page.processed_image_url)}><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onColorOnline?.(page.processed_image_url)}><Brush className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleShare(page.processed_image_url)}><Share2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handlePrint(page.processed_image_url)}><Printer className="h-4 w-4" /></Button>
                    </div>
                    <button className="absolute top-2 right-2 z-10" onClick={() => onToggleFavorite?.(page.id)}>
                      <Heart className={`h-6 w-6 drop-shadow-md transition-all ${favoriteIds.has(page.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
                    <Badge className="absolute bottom-2 left-2 text-xs backdrop-blur-sm" variant="secondary">{page.difficulty}</Badge>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs text-muted-foreground">{new Date(page.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-3xl p-2">
            <img src={lightboxImage} alt="Full size" className="w-full rounded-lg" />
            <div className="flex justify-center gap-2 mt-2">
              <Button size="sm" onClick={() => { const link = document.createElement("a"); link.href = lightboxImage; link.download = "coloring-page.png"; link.click(); }}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePrint(lightboxImage)}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
}
