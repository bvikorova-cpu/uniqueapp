import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, ArrowLeft, Heart, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface BeautyGalleryProps {
  onBack: () => void;
}

export const BeautyGallery = ({ onBack }: BeautyGalleryProps) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("makeup");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGallery(); }, []);

  const loadGallery = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("beauty_gallery")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setEntries(data || []);
    } catch { toast.error("Failed to load gallery"); }
    finally { setLoading(false); }
  };

  const handleFileSelect = (file: File | undefined, type: 'before' | 'after') => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') { setBeforeFile(file); setBeforePreview(reader.result as string); }
      else { setAfterFile(file); setAfterPreview(reader.result as string); }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const fileName = `${session.user.id}/${prefix}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('beauty-photos').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('beauty-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!beforeFile || !afterFile || !title.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const [beforeUrl, afterUrl] = await Promise.all([
        uploadFile(beforeFile, 'before'),
        uploadFile(afterFile, 'after')
      ]);
      if (!beforeUrl || !afterUrl) throw new Error("Upload failed");

      const { error } = await (supabase as any).from("beauty_gallery").insert({
        user_id: session.user.id,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        title, description, category
      });
      if (error) throw error;

      toast.success("Transformation shared!");
      setShowForm(false);
      setTitle(""); setDescription(""); setBeforeFile(null); setAfterFile(null);
      setBeforePreview(""); setAfterPreview("");
      loadGallery();
    } catch (error: any) {
      toast.error(error.message || "Failed to share");
    } finally { setUploading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Beauty Gallery works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Share Transformation"}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
            <h3 className="text-lg font-bold mb-4">Share Your Beauty Transformation</h3>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input placeholder="My Stunning Makeup Look" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Tell us about this transformation..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="makeup">Makeup</SelectItem>
                    <SelectItem value="hair">Hair</SelectItem>
                    <SelectItem value="skincare">Skincare</SelectItem>
                    <SelectItem value="nails">Nails</SelectItem>
                    <SelectItem value="full">Full Makeover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Before Photo *</Label>
                  <Input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files?.[0], 'before')} />
                  {beforePreview && <img src={beforePreview} alt="Before" className="mt-2 rounded-lg w-full aspect-square object-cover" />}
                </div>
                <div>
                  <Label>After Photo *</Label>
                  <Input type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files?.[0], 'after')} />
                  {afterPreview && <img src={afterPreview} alt="After" className="mt-2 rounded-lg w-full aspect-square object-cover" />}
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Share Transformation"}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <h2 className="text-2xl font-bold flex items-center gap-2">
        <ImageIcon className="h-6 w-6 text-pink-500" />
        Beauty Transformations Gallery
      </h2>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading gallery...</p>
      ) : entries.length === 0 ? (
        <Card className="p-10 text-center bg-card/80 backdrop-blur-xl">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transformations yet. Be the first to share!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-xl">
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <img src={entry.before_image_url} alt="Before" className="w-full aspect-square object-cover" />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Before</span>
                  </div>
                  <div className="relative">
                    <img src={entry.after_image_url} alt="After" className="w-full aspect-square object-cover" />
                    <span className="absolute top-2 right-2 bg-pink-500/80 text-white text-xs px-2 py-1 rounded">After</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold">{entry.title}</h4>
                  {entry.description && <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">{entry.category}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" /> {entry.likes_count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
