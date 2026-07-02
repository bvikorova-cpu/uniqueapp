import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Video } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CreatorMediaUploadProps {
  creatorId: string;
  onUploadComplete: () => void;
}

export function CreatorMediaUpload({ creatorId, onUploadComplete }: CreatorMediaUploadProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${creatorId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('creator-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('creator-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await Promise.all(mediaFiles.map(file => uploadMedia(file)));
      }

      const { error } = await supabase
        .from('creator_exclusive_posts')
        .insert({
          creator_id: creatorId,
          title,
          content,
          media_urls: mediaUrls,
          tier_ids: []
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      setTitle("");
      setContent("");
      setMediaFiles([]);
      onUploadComplete();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Creator Media Upload - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Media Upload section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Media Upload.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
        <CardDescription>
          Share exclusive content with your subscribers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="media">Media (Photos/Videos)</Label>
            <Input
              id="media"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {mediaFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {mediaFiles.length} file(s) selected
              </p>
            )}
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Create Post
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
