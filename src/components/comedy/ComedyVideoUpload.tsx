import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Video } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ComedyVideoUploadProps {
  comedianId: string;
  onUploadSuccess?: () => void;
}

export function ComedyVideoUpload({ comedianId, onUploadSuccess }: ComedyVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    priceCoins: "50",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error("File too large. Maximum 500MB");
        return;
      }
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoData.title.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", videoData.title);
      formData.append("description", videoData.description);
      formData.append("type", "clip");
      formData.append("priceCoins", videoData.priceCoins);

      // Simulate progress (since we can't track FormData upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("upload-comedy-video", {
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      toast.success("Video uploaded successfully!");
      
      // Reset form
      setVideoData({ title: "", description: "", priceCoins: "50" });
      setSelectedFile(null);
      setProgress(0);
      
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Comedy Video Upload - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedy Video Upload section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedy Video Upload.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Video className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold">Upload Comedy Clip</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="video-file">Video File *</Label>
          <div className="mt-2">
            <input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="title">Clip Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Best Stand-up Moments"
            value={videoData.title}
            onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
            disabled={uploading}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your comedy clip..."
            value={videoData.description}
            onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
            rows={3}
            disabled={uploading}
          />
        </div>

        <div>
          <Label htmlFor="price">Price (coins)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={videoData.priceCoins}
            onChange={(e) => setVideoData({ ...videoData, priceCoins: e.target.value })}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !videoData.title.trim()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Clip"}
        </Button>
      </div>
    </Card>
    </>
  );
}
