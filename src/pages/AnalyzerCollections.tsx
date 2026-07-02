import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Folder, Trash2, Edit, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Collection {
  id: string; name: string; description: string; is_public: boolean; created_at: string; item_count?: number;
}

export default function AnalyzerCollections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: "", description: "" });

  useEffect(() => { loadCollections(); }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase.from('analyzer_collections').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const collectionsWithCounts = await Promise.all(
        (data || []).map(async (c) => {
          const { count } = await supabase.from('vision_analyses').select('*', { count: 'exact', head: true }).eq('collection_id', c.id);
          return { ...c, item_count: count || 0 };
        })
      );
      setCollections(collectionsWithCounts);
    } catch { toast.error("Failed to load collections"); }
    finally { setIsLoading(false); }
  };

  const createCollection = async () => {
    if (!newCollection.name.trim()) { toast.error("Name is required"); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from('analyzer_collections').insert({ user_id: user.id, name: newCollection.name, description: newCollection.description, is_public: false });
      if (error) throw error;
      toast.success("Collection created");
      setIsDialogOpen(false);
      setNewCollection({ name: "", description: "" });
      loadCollections();
    } catch { toast.error("Failed to create collection"); }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase.from('analyzer_collections').delete().eq('id', id);
      if (error) throw error;
      setCollections(collections.filter(c => c.id !== id));
      toast.success("Collection deleted");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <FloatingHowItWorks
        title="Analyzer Collections"
        intro="Organize saved analyses into folders."
        steps={[
          { title: "Open a collection", desc: "Group by topic \u2014 health, receipts, products." },
          { title: "Add analyses", desc: "Move items from History into folders." },
          { title: "Share a folder", desc: "Send read-only links to friends or team." },
          { title: "Export", desc: "Download all reports as PDF." },
          { title: "Clean up", desc: "Delete or archive old collections." }
        ]}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/analyzer')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <Folder className="w-6 h-6 text-cyan-400" /> Collections
              </h1>
              <p className="text-muted-foreground text-sm">Organize your analyses into collections</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" /> New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="border-cyan-500/20">
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>Organize your analyses into collections</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Collection Name</Label>
                  <Input placeholder="e.g., Plants, Fashion, Food..." value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })} className="border-cyan-500/20" />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea placeholder="Add a description" value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })} className="border-cyan-500/20" />
                </div>
                <Button onClick={createCollection} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">Create Collection</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : collections.length === 0 ? (
          <Card className="p-12 text-center border-cyan-500/20">
            <Folder className="w-16 h-16 mx-auto text-cyan-400/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-4">Create your first collection</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Create Collection
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <motion.div key={collection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer border-cyan-500/10 hover:border-cyan-500/30"
                  onClick={() => navigate(`/analyzer/history?collection=${collection.id}`)}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <Folder className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{collection.name}</h3>
                        {collection.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{collection.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        {collection.item_count || 0} {collection.item_count === 1 ? 'item' : 'items'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-cyan-400" onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt("New collection name:", collection.name);
                          if (newName && newName !== collection.name) {
                            supabase.from("analyzer_collections").update({ name: newName }).eq("id", collection.id).then(({ error }) => {
                              if (error) toast.error("Failed"); else {
                                setCollections(collections.map(c => c.id === collection.id ? { ...c, name: newName } : c));
                                toast.success("Updated");
                              }
                            });
                          }
                        }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={(e) => { e.stopPropagation(); deleteCollection(collection.id); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Created {new Date(collection.created_at).toLocaleDateString()}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
