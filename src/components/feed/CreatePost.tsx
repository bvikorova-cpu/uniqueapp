import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image, Video, X, Loader2 } from "lucide-react";

interface CreatePostProps {
  onPostCreated: () => void;
}

const MAX_CONTENT = 5000;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_FILES = 10;
const ALLOWED_IMG = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VID = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXT = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov",
]);

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const submittingRef = useRef(false);
  const { toast } = useToast();

  // Stable object URLs with cleanup to prevent memory leaks
  const previews = useMemo(
    () =>
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null
      ),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const accepted: File[] = [];
    for (const f of incoming) {
      const okType = ALLOWED_IMG.includes(f.type) || ALLOWED_VID.includes(f.type);
      const okSize = f.size <= MAX_FILE_BYTES;
      if (!okType || !okSize) {
        toast({
          title: "File rejected",
          description: `${f.name}: ${!okType ? "unsupported type" : "exceeds 25 MB"}`,
          variant: "destructive",
        });
        continue;
      }
      accepted.push(f);
    }
    setFiles((prev) => {
      const merged = [...prev, ...accepted];
      if (merged.length > MAX_FILES) {
        toast({
          title: "Too many files",
          description: `Max ${MAX_FILES} per post`,
          variant: "destructive",
        });
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
    // Reset input so the same file can be re-selected if removed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    const trimmed = content.trim();
    if (!trimmed && files.length === 0) {
      toast({
        title: "Empty post",
        description: "Add text or media",
        variant: "destructive",
      });
      return;
    }
    if (trimmed.length > MAX_CONTENT) {
      toast({
        title: "Too long",
        description: `Max ${MAX_CONTENT} characters`,
        variant: "destructive",
      });
      return;
    }

    submittingRef.current = true;
    setUploading(true);

    const uploadedPaths: string[] = [];
    let createdPostId: string | null = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "You must be logged in",
          description: "Please log in to add posts",
          variant: "destructive",
        });
        return;
      }

      // Scale guards
      const { rateLimit, moderateText } = await import("@/lib/scaleGuards");
      const okRate = await rateLimit("post.create", 10, 60);
      if (!okRate) throw new Error("Too many posts. Slow down.");
      if (trimmed) {
        const mod = await moderateText(trimmed);
        if (!mod.allowed && mod.severity === "high") {
          throw new Error("Post violates community guidelines.");
        }
      }

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({ user_id: user.id, content: trimmed })
        .select()
        .single();
      if (postError) throw postError;
      createdPostId = post.id;


      for (const file of files) {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXT.has(ext)) {
          throw new Error(`Rejected extension: .${ext}`);
        }
        const safeName = `${user.id}/${post.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const fileType = ALLOWED_IMG.includes(file.type) ? "image" : "video";

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(safeName, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(safeName);

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(safeName);

        const { error: mediaError } = await supabase.from("media").insert({
          post_id: post.id,
          file_url: publicUrl,
          file_type: fileType,
          file_name: file.name,
        });
        if (mediaError) throw mediaError;
      }

      toast({ title: "Success!", description: "Post created successfully" });
      setContent("");
      setFiles([]);
      onPostCreated();
    } catch (error: any) {
      // Rollback: remove orphan storage objects + post if media failed
      if (uploadedPaths.length) {
        try { await supabase.storage.from("media").remove(uploadedPaths); } catch {}
      }
      if (createdPostId && files.length > 0 && uploadedPaths.length < files.length) {
        try { await supabase.from("posts").delete().eq("id", createdPostId); } catch {}
      }
      toast({
        title: "Error",
        description: error?.message ?? "Failed to create post",
        variant: "destructive",
      });
    } finally {
      submittingRef.current = false;
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
          maxLength={MAX_CONTENT}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end text-xs text-muted-foreground">
          {content.length} / {MAX_CONTENT}
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                  {file.type.startsWith("image/") && previews[index] ? (
                    <img
                      src={previews[index]!}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Video className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("image-upload")?.click()}
              aria-label="Add image"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("video-upload")?.click()}
              aria-label="Add video"
            >
              <Video className="h-5 w-5" />
            </Button>
            <input
              id="image-upload"
              type="file"
              accept={ALLOWED_IMG.join(",")}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              id="video-upload"
              type="file"
              accept={ALLOWED_VID.join(",")}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add post"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePost;
