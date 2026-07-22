import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { Collapsible,
  CollapsibleContent,
  CollapsibleTrigger } from "@/components/ui/collapsible";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
}

interface MaterialUploaderProps {
  lessonId: string;
}

export function MaterialUploader({ lessonId }: MaterialUploaderProps) {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "",
    file_url: "",
    file_type: "" });

  useEffect(() => {
    loadMaterials();
  }, [lessonId]);

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("course_materials")
        .select("*")
        .eq("lesson_id", lessonId);

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      console.error("Error loading materials:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();

    if (!formData.title || !formData.file_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("course_materials")
        .insert([{ lesson_id: lessonId,
          title: formData.title,
          file_url: formData.file_url,
          file_type: formData.file_type || "pdf",
          file_size_mb: 0 }]);

      if (error) throw error;

      toast({ title: "Success",
        description: "Material added successfully" });

      setFormData({ title: "", file_url: "", file_type: "" });
      loadMaterials();
    } catch (error: any) { toast({
        title: "Error",
        description: error.message,
        variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from("course_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;

      toast({ title: "Success",
        description: "Material deleted successfully" });
      
      loadMaterials();
    } catch (error: any) { toast({
        title: "Error",
        description: error.message,
        variant: "destructive" });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="ml-8 mt-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Upload className="h-4 w-4 mr-2" />
          Materials ({materials.length})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-3">
        {/* Add Material Form */}
        <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor={`material-title-${lessonId}`} className="text-sm">
              Material Title
            </Label>
            <Input
              id={`material-title-${lessonId}`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Course Notes PDF"
              size={32}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`material-url-${lessonId}`} className="text-sm">
              File URL
            </Label>
            <Input
              id={`material-url-${lessonId}`}
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://example.com/file.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`material-type-${lessonId}`} className="text-sm">
              File Type
            </Label>
            <Input
              id={`material-type-${lessonId}`}
              value={formData.file_type}
              onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              placeholder="pdf, zip, docx, etc."
            />
          </div>

          <Button type="submit" size="sm" disabled={loading}>
            <Upload className="h-3 w-3 mr-2" />
            Add Material
          </Button>
        </form>

        {/* Materials List */}
        {materials.length > 0 && (
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{material.title}</p>
                    <p className="text-xs text-muted-foreground">{material.file_type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(material.file_url, "_blank")}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
