import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Image, Film, Music, FileText, Loader2, FolderOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface VaultItem {
  id: string; name: string; type: string; url: string; size: string; uploadedAt: string;
}

export const MemoryVault = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([
    { id: "1", name: "Family Photo 2024.jpg", type: "image", url: "", size: "2.4 MB", uploadedAt: "2024-12-15" },
    { id: "2", name: "Birthday Message.mp4", type: "video", url: "", size: "45 MB", uploadedAt: "2024-11-20" },
    { id: "3", name: "Grandma's Recipe.pdf", type: "document", url: "", size: "0.8 MB", uploadedAt: "2024-10-05" },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-5 h-5 text-blue-500" />;
      case "video": return <Film className="w-5 h-5 text-purple-500" />;
      case "audio": return <Music className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-emerald-500" />;
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const path = `memory-vault/${session.user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      const type = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "document";
      setItems(prev => [{ id: Date.now().toString(), name: file.name, type, url: urlData.publicUrl, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, uploadedAt: new Date().toISOString().split('T')[0] }, ...prev]);
      toast({ title: "File Uploaded!", description: `${file.name} added to your Memory Vault.` });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Memory Vault'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Memory Vault panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Memory Vault</h2>
        <span className="text-xs text-muted-foreground">{items.length} files stored</span>
      </div>
      <p className="text-sm text-muted-foreground">Upload and securely store photos, videos, documents, and audio files to attach to your time capsules.</p>

      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center">
          <Input type="file" className="hidden" id="vault-upload" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <label htmlFor="vault-upload" className="cursor-pointer flex flex-col items-center gap-2">
            {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <Upload className="w-8 h-8 text-primary" />}
            <span className="font-bold text-sm">{uploading ? "Uploading..." : "Click to upload files"}</span>
            <span className="text-xs text-muted-foreground">Photos, videos, audio, documents (max 100MB)</span>
          </label>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 hover:border-primary/30 transition-all">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-card border border-border/40 flex items-center justify-center">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.size} • {item.uploadedAt}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                  if (!confirm(`Remove "${item.name}" from vault?`)) return;
                  setItems(prev => prev.filter(i => i.id !== item.id));
                  toast({ title: "Removed", description: `${item.name} removed from vault.` });
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
