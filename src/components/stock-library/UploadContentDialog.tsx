import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface UploadContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UploadContentDialog = ({ open, onOpenChange, onSuccess }: UploadContentDialogProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "image",
    category: "",
    tags: "",
    price_eur: "5.00",
    license_type: "standard",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stock-content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stock-content')
        .getPublicUrl(fileName);

      // Insert content record
      const { error: insertError } = await supabase
        .from('stock_content_items')
        .insert([{
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          category: formData.category,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          price_eur: parseFloat(formData.price_eur),
          license_type: formData.license_type,
          file_url: publicUrl,
          thumbnail_url: publicUrl,
          file_size_mb: file.size / (1024 * 1024),
        }]);

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Content uploaded successfully!" });
      onSuccess();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        content_type: "image",
        category: "",
        tags: "",
        price_eur: "5.00",
        license_type: "standard",
      });
      setFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Content to Library</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>File *</Label>
            <Input type="file" onChange={handleFileChange} accept="image/*,video/*,audio/*" required />
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sunset Landscape"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your content..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Content Type *</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="3d_model">3D Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Nature, Business"
                required
              />
            </div>
          </div>

          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., sunset, landscape, nature"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (EUR) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.50"
                value={formData.price_eur}
                onChange={(e) => setFormData({ ...formData, price_eur: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">You'll earn 70% (€{(parseFloat(formData.price_eur || "0") * 0.7).toFixed(2)})</p>
            </div>

            <div>
              <Label>License Type *</Label>
              <Select value={formData.license_type} onValueChange={(value) => setFormData({ ...formData, license_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard License</SelectItem>
                  <SelectItem value="extended">Extended License</SelectItem>
                  <SelectItem value="exclusive">Exclusive Rights</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};