import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Image, 
  Video, 
  Smile, 
  MapPin, 
  Users, 
  X, 
  Loader2,
  Sparkles,
  Send,
  Mic
} from "lucide-react";
import { VoiceCommentRecorder } from "@/components/wall/VoiceCommentRecorder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PostTemplatesDialog } from "@/components/wall/PostTemplatesDialog";
import { TagFriendsDialog } from "@/components/wall/TagFriendsDialog";


interface EnhancedCommentInputProps {
  postId: string;
  onCommentAdded: () => void;
  parentCommentId?: string;
  compact?: boolean;
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
  { emoji: "😂", label: "laughing" },
  { emoji: "🥰", label: "in love" },
  { emoji: "😭", label: "crying" },
  { emoji: "😴", label: "sleepy" },
  { emoji: "🤩", label: "amazed" },
  { emoji: "😱", label: "shocked" },
  { emoji: "🤗", label: "hugging" },
  { emoji: "😇", label: "blessed" },
];

export function EnhancedCommentInput({ postId, onCommentAdded, parentCommentId, compact }: EnhancedCommentInputProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (type === "image" && !selectedFile.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
        return;
      }
      if (type === "video" && !selectedFile.type.startsWith("video/")) {
        toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) {
      toast({
        title: "Empty comment",
        description: "Add text or media",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      let videoUrl = null;

      // Upload file if present
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `comments/${user.id}/${Date.now()}.${fileExt}`;
        const fileType = file.type.startsWith("image/") ? "image" : "video";

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);

        if (fileType === "image") {
          imageUrl = publicUrl;
        } else {
          videoUrl = publicUrl;
        }
      }

      const { rateLimit, moderateText } = await import("@/lib/scaleGuards");
      const okRate = await rateLimit("comment.create", 30, 60);
      if (!okRate) throw new Error("Too many comments. Slow down.");
      if (content.trim()) {
        const mod = await moderateText(content.trim());
        if (!mod.allowed && mod.severity === "high") {
          throw new Error("Comment violates community guidelines.");
        }
      }

      const { error: commentError } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
          video_url: videoUrl,
          feeling: feeling,
          location: location || null,
          tagged_friends: taggedFriends.length > 0 ? taggedFriends : null,
          parent_comment_id: parentCommentId || null,
          voice_url: voiceUrl,
          voice_duration: voiceDuration,
        });

      if (commentError) throw commentError;


      toast({ title: "Success!", description: "Comment added" });
      setContent("");
      setFile(null);
      setFeeling(null);
      setLocation("");
      setTaggedFriends([]);
      setVoiceUrl(null);
      setVoiceDuration(null);
      onCommentAdded();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setShowTemplates(false);
  };

  const handleToggleFriend = (friendId: string) => {
    setTaggedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <>
      <FloatingHowItWorks title={"Enhanced Comment Input - How it works"} steps={[{ title: 'Open', desc: 'Access the Enhanced Comment Input section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Enhanced Comment Input.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className={compact ? "space-y-1" : "space-y-2"}>
      <Textarea
        placeholder={parentCommentId ? "Write a reply..." : "Write a comment..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={compact ? "min-h-[40px] text-xs" : "min-h-[60px] text-sm"}
      />

      {/* Preview selected items */}
      {(feeling || location || taggedFriends.length > 0 || file || voiceUrl) && (
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {feeling && (
            <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
              <span>{feeling}</span>
              <button type="button" onClick={() => setFeeling(null)}>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
              <button type="button" onClick={() => setLocation("")}>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {taggedFriends.length > 0 && (
            <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
              <Users className="h-3 w-3" />
              <span>{taggedFriends.length} friend(s)</span>
              <button type="button" onClick={() => setTaggedFriends([])}>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {file && (
            <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
              {file.type.startsWith("image/") ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button type="button" onClick={() => setFile(null)}>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {voiceUrl && (
            <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
              <Mic className="h-3 w-3 text-primary" />
              <span>Voice ({voiceDuration}s)</span>
              <button type="button" onClick={() => { setVoiceUrl(null); setVoiceDuration(null); }}>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="relative w-24 h-24">
          {file.type.startsWith("image/") ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full bg-secondary rounded-lg flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-5 w-5"
            onClick={() => setFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2">
        <TooltipProvider>
          <div className="flex gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => document.getElementById(`comment-image-${postId}`)?.click()}
                >
                  <Image className="h-3.5 w-3.5 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Photo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => document.getElementById(`comment-video-${postId}`)?.click()}
                >
                  <Video className="h-3.5 w-3.5 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video</TooltipContent>
            </Tooltip>

            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Smile className="h-3.5 w-3.5 text-yellow-600" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>Feeling</TooltipContent>
                <PopoverContent className="w-64 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    {feelings.map((f) => (
                      <Button
                        key={f.label}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex-col h-auto py-1"
                        onClick={() => setFeeling(f.emoji + " " + f.label)}
                      >
                        <span className="text-lg">{f.emoji}</span>
                        <span className="text-[10px]">{f.label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>Location</TooltipContent>
                <PopoverContent className="w-48">
                  <input
                    type="text"
                    placeholder="Where are you?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => setShowTagFriends(true)}
                >
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tag friends</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowTemplates(true)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Template</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${showVoiceRecorder ? 'bg-primary/20' : ''}`}
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                >
                  <Mic className="h-3.5 w-3.5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Comment</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <Button 
          onClick={handleSubmit}
          disabled={uploading || (!content.trim() && !file)}
          size="sm"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Send
            </>
          )}
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        id={`comment-image-${postId}`}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
      />
      <input
        type="file"
        id={`comment-video-${postId}`}
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "video")}
      />

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <VoiceCommentRecorder
          onRecordingComplete={(url, duration) => {
            setVoiceUrl(url);
            setVoiceDuration(duration);
            setShowVoiceRecorder(false);
          }}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* Dialogs */}
      <PostTemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={applyTemplate}
      />

      <TagFriendsDialog
        open={showTagFriends}
        onOpenChange={setShowTagFriends}
        selectedFriends={taggedFriends}
        onToggleFriend={handleToggleFriend}
      />
    </div>
    </>
  );
}
