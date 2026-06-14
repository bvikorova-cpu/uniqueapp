import { useState, useEffect } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, ArrowLeft, Heart, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props { onBack: () => void; }

interface GalleryItem {
  id: string;
  user_id: string;
  before_url: string;
  after_url: string;
  title: string;
  description: string | null;
  likes: number;
  created_at: string;
}

export const PhotoGallery = ({ onBack }: Props) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadGallery(); }, []);

  const loadGallery = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("photo_gallery").select("*").order("created_at", { ascending: false }).limit(20);
    setItems(data || []);
    setLoading(false);
  };

  const handleLike = async (id: string) => {
    await (supabase as any).from("photo_gallery").update({ likes: items.find(i => i.id === id)!.likes + 1 }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, likes: i.likes + 1 } : i));
  };

  const handleUpload = async () => {
    if (!beforeFile || !afterFile || !title.trim()) { toast.error("Please fill all fields"); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadFile = async (file: File, prefix: string) => {
        const ext = file.name.split('.').pop();
        const name = `gallery/${user.id}/${prefix}-${Date.now()}.${ext}`;
        await supabase.storage.from('old-photos').upload(name, file);
        return (await getReadableUrl('old-photos', name));
      };

      const [beforeUrl, afterUrl] = await Promise.all([uploadFile(beforeFile, 'before'), uploadFile(afterFile, 'after')]);

      await (supabase as any).from("photo_gallery").insert({
        user_id: user.id, before_url: beforeUrl, after_url: afterUrl, title, description: description || null, likes: 0
      });

      toast.success("Added to gallery!");
      setShowUpload(false); setTitle(""); setDescription(""); setBeforeFile(null); setAfterFile(null);
      loadGallery();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6 text-orange-500" />
            Before / After Gallery
          </h2>
          <Button onClick={() => setShowUpload(!showUpload)} variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" /> Share Yours
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Community photo restoration showcase</p>

        {showUpload && (
          <Card className="p-4 mb-6 bg-muted/30 border-dashed">
            <h3 className="font-semibold mb-3">Share Your Restoration</h3>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., My grandparents' wedding, 1952" /></div>
              <div><Label>Description (optional)</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell the story behind this photo..." rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Before Photo</Label>
                  <Input type="file" accept="image/*" onChange={e => setBeforeFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>After Photo</Label>
                  <Input type="file" accept="image/*" onChange={e => setAfterFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Submit to Gallery"}
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading gallery...</p></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No restorations shared yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img src={item.before_url} alt="Before" className="w-full h-32 sm:h-40 object-cover" />
                      <span className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Before</span>
                    </div>
                    <div className="relative">
                      <img src={item.after_url} alt="After" className="w-full h-32 sm:h-40 object-cover" />
                      <span className="absolute top-1 left-1 text-[10px] bg-primary/80 text-white px-1.5 py-0.5 rounded">After</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <button onClick={() => handleLike(item.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                        <Heart className="h-3.5 w-3.5" /> {item.likes}
                      </button>
                      <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
  );
};
