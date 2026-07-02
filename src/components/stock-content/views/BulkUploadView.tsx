import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FolderUp, Upload, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BulkUploadViewProps {
  onBack: () => void;
}

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function BulkUploadView({ onBack }: BulkUploadViewProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...dropped.map(f => ({ file: f, status: "pending" as const, progress: 0 }))]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      setFiles(prev => [...prev, ...selected.map(f => ({ file: f, status: "pending" as const, progress: 0 }))]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Please sign in to upload", variant: "destructive" });
      return;
    }

    setUploading(true);
    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue;
      updated[i].status = "uploading";
      updated[i].progress = 30;
      setFiles([...updated]);

      try {
        const filePath = `uploads/${user.id}/${Date.now()}-${updated[i].file.name}`;
        const { error } = await supabase.storage.from("stock-content").upload(filePath, updated[i].file);

        if (error) throw error;

        const { data: urlData } = supabase.storage.from("stock-content").getPublicUrl(filePath);

        await supabase.from("stock_content" as any).insert({
          user_id: user.id,
          title: updated[i].file.name.replace(/\.[^.]+$/, ""),
          file_url: urlData.publicUrl,
          file_type: "image",
          price: 0,
          status: "draft",
        } as any);

        updated[i].status = "success";
        updated[i].progress = 100;
      } catch (err: any) {
        updated[i].status = "error";
        updated[i].error = err.message;
      }
      setFiles([...updated]);
    }

    const successCount = updated.filter(f => f.status === "success").length;
    const errorCount = updated.filter(f => f.status === "error").length;
    toast({
      title: "Bulk Upload Complete",
      description: `${successCount} uploaded successfully${errorCount ? `, ${errorCount} failed` : ""}`,
    });
    setUploading(false);
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const successCount = files.filter(f => f.status === "success").length;
  const totalProgress = files.length ? Math.round((files.reduce((acc, f) => acc + f.progress, 0)) / files.length) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Bulk Upload View - How it works"} steps={[{ title: 'Open', desc: 'Access the Bulk Upload View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bulk Upload View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><FolderUp className="w-6 h-6 text-indigo-500" /> Bulk Upload Manager</h2>
      </div>

      {/* Drop zone */}
      <Card
        className="p-8 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 transition-colors cursor-pointer"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("bulk-file-input")?.click()}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-indigo-500" />
          <p className="font-semibold text-lg">Drag & drop images here</p>
          <p className="text-sm text-muted-foreground">or click to browse • Supports JPG, PNG, WebP</p>
          <input id="bulk-file-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>
      </Card>

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{files.length} files</Badge>
              <Badge variant="outline" className="text-green-400">{successCount} uploaded</Badge>
              <Badge variant="outline" className="text-yellow-400">{pendingCount} pending</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                <Trash2 className="w-4 h-4 mr-1" /> Clear All
              </Button>
              <Button size="sm" onClick={handleUploadAll} disabled={uploading || pendingCount === 0}
                className="bg-gradient-to-r from-indigo-500 to-violet-600">
                {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-1" />Upload All ({pendingCount})</>}
              </Button>
            </div>
          </div>

          {uploading && <Progress value={totalProgress} className="h-2" />}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((f, i) => (
              <Card key={i} className="relative overflow-hidden group">
                <img src={URL.createObjectURL(f.file)} alt={f.file.name} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {f.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                  {f.status === "uploading" && <Loader2 className="w-6 h-6 animate-spin text-white" />}
                  {f.status === "success" && <CheckCircle className="w-6 h-6 text-green-400" />}
                  {f.status === "error" && <XCircle className="w-6 h-6 text-red-400" />}
                </div>
                {f.status === "pending" && (
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <XCircle className="w-4 h-4 text-white" />
                  </button>
                )}
                <div className="p-1.5">
                  <p className="text-[10px] truncate">{f.file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(f.file.size / 1024).toFixed(0)} KB</p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}
