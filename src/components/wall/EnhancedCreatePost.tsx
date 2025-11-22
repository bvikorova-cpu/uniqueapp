import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Image, 
  Video, 
  Smile, 
  MapPin, 
  Users, 
  X, 
  Loader2,
  Globe,
  Lock,
  Users2,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EnhancedCreatePostProps {
  onPostCreated: () => void;
  userProfile: any;
}

const feelings = [
  { emoji: "😊", label: "happy" },
  { emoji: "😍", label: "loved" },
  { emoji: "😢", label: "sad" },
  { emoji: "😡", label: "angry" },
  { emoji: "🎉", label: "celebrating" },
  { emoji: "😎", label: "cool" },
  { emoji: "🤔", label: "thoughtful" },
  { emoji: "💪", label: "motivated" },
];

export function EnhancedCreatePost({ onPostCreated, userProfile }: EnhancedCreatePostProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && files.length === 0) {
      toast({
        title: "Empty post",
        description: "Add text or media",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
          feeling: feeling || undefined,
          location: location || undefined,
          privacy,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const fileType = file.type.startsWith("image/") ? "image" : "video";

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);

          await supabase.from("media").insert({
            post_id: post.id,
            file_url: publicUrl,
            file_type: fileType,
            file_name: file.name,
          });
        }
      }

      toast({ title: "Success!", description: "Post created successfully" });
      setContent("");
      setFiles([]);
      setFeeling(null);
      setLocation("");
      setPrivacy("public");
      onPostCreated();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const privacyIcons = {
    public: <Globe className="h-4 w-4" />,
    friends: <Users2 className="h-4 w-4" />,
    private: <Lock className="h-4 w-4" />,
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback>{userProfile?.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={`What's on your mind, ${userProfile?.full_name?.split(" ")[0] || ""}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-none bg-accent/50 focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Selected feeling, location preview */}
        {(feeling || location) && (
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {feeling && (
              <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                <span>feeling</span>
                <span className="font-semibold">{feeling}</span>
                <button type="button" onClick={() => setFeeling(null)}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" />
                <span>at</span>
                <span className="font-semibold">{location}</span>
                <button type="button" onClick={() => setLocation("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                  {file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
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
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Add to your post</span>
            <Select value={privacy} onValueChange={(v: any) => setPrivacy(v)}>
              <SelectTrigger className="w-[140px] h-8">
                <div className="flex items-center gap-2">
                  {privacyIcons[privacy]}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4" />
                    Friends
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Only me
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Image className="h-5 w-5 text-green-500" />
              <span className="text-xs mt-1">Photo</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2"
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <Video className="h-5 w-5 text-red-500" />
              <span className="text-xs mt-1">Video</span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="flex-col h-auto py-2">
                  <Smile className="h-5 w-5 text-yellow-500" />
                  <span className="text-xs mt-1">Feeling</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-4 gap-2">
                  {feelings.map((f) => (
                    <Button
                      key={f.label}
                      type="button"
                      variant="ghost"
                      className="flex-col h-auto py-2"
                      onClick={() => {
                        setFeeling(f.emoji + " " + f.label);
                      }}
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span className="text-xs mt-1">{f.label}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="flex-col h-auto py-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="text-xs mt-1">Location</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <input
                  type="text"
                  placeholder="Where are you?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </PopoverContent>
            </Popover>

            <Button type="button" variant="ghost" size="sm" className="flex-col h-auto py-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-xs mt-1">Tag</span>
            </Button>
          </div>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </form>
    </Card>
  );
}
