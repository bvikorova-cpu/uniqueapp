import { useState } from "react";
import { AudienceSelector } from "@/components/wall/AudienceSelector";
import { supabase } from "@/integrations/supabase/client";
import { trackChallengeAction } from "@/lib/trackChallenge";
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
  ChevronDown,
  Clock,
  Sparkles,
  BarChart3,
  Mic
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { PostTemplatesDialog } from "./PostTemplatesDialog";
import { SchedulePostDialog } from "./SchedulePostDialog";
import { CreatePollDialog } from "./CreatePollDialog";
import { BackgroundStylePicker } from "./BackgroundStylePicker";
import { getPostBackground } from "@/lib/postBackgrounds";
import { cn } from "@/lib/utils";
import { HashtagInput } from "./HashtagInput";
import { TagFriendsDialog } from "./TagFriendsDialog";
import { VoiceRecorder } from "./VoiceRecorder";
import { EphemeralPostToggle, type PostVisibility } from "./EphemeralPostToggle";
import { DraftsManager } from "./DraftsManager";
import { CollaborativePostEditor } from "./CollaborativePostEditor";
import { MusicShareInput } from "./MusicShareCard";
import { AIContentAssistant } from "./AIContentAssistant";
import { AnimatePresence } from "framer-motion";
import { useHashtags } from "@/hooks/useHashtags";
import { usePolls } from "@/hooks/usePolls";

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
  { emoji: "😂", label: "laughing" },
  { emoji: "🥰", label: "in love" },
  { emoji: "😭", label: "crying" },
  { emoji: "😴", label: "sleepy" },
  { emoji: "🤩", label: "amazed" },
  { emoji: "😱", label: "shocked" },
  { emoji: "🤗", label: "hugging" },
  { emoji: "😇", label: "blessed" },
  { emoji: "🥳", label: "party" },
  { emoji: "😌", label: "peaceful" },
  { emoji: "🤪", label: "crazy" },
  { emoji: "😏", label: "smirking" },
  { emoji: "🙏", label: "grateful" },
  { emoji: "❤️", label: "loving" },
  { emoji: "💔", label: "heartbroken" },
  { emoji: "✨", label: "sparkly" },
  { emoji: "🔥", label: "on fire" },
  { emoji: "⭐", label: "special" },
  { emoji: "🌟", label: "shining" },
  { emoji: "💯", label: "perfect" },
  { emoji: "🎊", label: "festive" },
  { emoji: "🌈", label: "colorful" },
];

export function EnhancedCreatePost({ onPostCreated, userProfile }: EnhancedCreatePostProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "friends" | "close_friends" | "private">("public");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [postVisibility, setPostVisibility] = useState<PostVisibility>("normal");
  const [pollData, setPollData] = useState<{ question: string; options: string[]; endsAt: Date } | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [sensitiveReason, setSensitiveReason] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState<string | null>(null);
  const { toast } = useToast();
  const { createHashtagsForPost } = useHashtags();
  const { createPoll } = usePolls();
  const activeBackground = getPostBackground(backgroundStyle);
  const useBackground = !!activeBackground && files.length === 0;

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

      // Scale guards: 10 posts/min + AI text moderation
      const { rateLimit, moderateText } = await import("@/lib/scaleGuards");
      const okRate = await rateLimit("post.create", 10, 60);
      if (!okRate) throw new Error("Too many posts. Slow down.");
      if (content.trim()) {
        const mod = await moderateText(content.trim());
        if (!mod.allowed && mod.severity === "high") {
          throw new Error("Post violates community guidelines.");
        }
      }

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
          feeling: feeling || undefined,
          location: location || undefined,
          privacy: privacy === "close_friends" ? "friends" : privacy,
          audience: privacy,
          is_sensitive: isSensitive,
          sensitive_reason: isSensitive ? (sensitiveReason.trim() || null) : null,
          background_style: useBackground ? backgroundStyle : null,
        })
        .select()
        .single();

      if (postError) throw postError;


      // Create hashtags
      await createHashtagsForPost(post.id, content);

      // Create poll if added
      if (pollData) {
        createPoll({
          postId: post.id,
          question: pollData.question,
          options: pollData.options,
          endsAt: pollData.endsAt,
        });
      }

      // Add tagged friends
      if (taggedFriends.length > 0) {
        for (const friendId of taggedFriends) {
          await supabase.from("post_tags").insert({
            post_id: post.id,
            tagged_user_id: friendId,
          });
        }
      }

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

          if (fileType === "image") {
            const { moderateImage } = await import("@/lib/scaleGuards");
            const mod = await moderateImage(publicUrl);
            if (!mod.allowed) {
              try { await supabase.storage.from("media").remove([fileName]); } catch {}
              throw new Error(`Image blocked: ${mod.reason || mod.categories.join(", ") || "policy violation"}`);
            }
          }

          await supabase.from("media").insert({
            post_id: post.id,
            file_url: publicUrl,
            file_type: fileType,
            file_name: file.name,
          });
        }
      }

      // +20 XP + challenge tracking (toast for completion handled inside helper)
      trackChallengeAction("post", 20);

      toast({ title: "Success!", description: "Post created successfully" });
      setContent("");
      setFiles([]);
      setFeeling(null);
      setLocation("");
      setPrivacy("public");
      setPollData(null);
      setBackgroundStyle(null);
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
    <div className="glass-post-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/10">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
              {userProfile?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {useBackground ? (
              <div
                className={cn(
                  "min-h-[180px] rounded-xl p-6 flex items-center justify-center",
                  activeBackground!.className
                )}
              >
                <Textarea
                  placeholder={`What's on your mind?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={cn(
                    "min-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-white/60",
                    activeBackground!.textClassName
                  )}
                />
              </div>
            ) : (
              <Textarea
                placeholder={`What's on your mind, ${userProfile?.full_name?.split(" ")[0] || ""}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-2 border-violet-600/50 bg-violet-50 dark:bg-violet-950/30 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-600 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-violet-600"
              />
            )}
            <HashtagInput text={content} />
          </div>
        </div>

        {/* Selected feeling, location, tagged friends preview */}
        {(feeling || location || taggedFriends.length > 0) && (
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
            {taggedFriends.length > 0 && (
              <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                <Users className="h-3 w-3" />
                <span>with</span>
                <span className="font-semibold">{taggedFriends.length} {taggedFriends.length === 1 ? 'friend' : 'friends'}</span>
                <button type="button" onClick={() => setTaggedFriends([])}>
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

        <div className="border-2 border-violet-600/50 rounded-xl p-4 bg-violet-50 dark:bg-violet-950/30 transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:border-violet-600 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
              <span className="truncate">Add to post</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <AudienceSelector value={privacy} onChange={setPrivacy} />
              <Button
                type="button"
                variant={isSensitive ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 text-xs whitespace-nowrap"
                onClick={() => setIsSensitive((v) => !v)}
                title="Mark as sensitive — will be blurred for viewers"
              >
                ⚠️ Sensitive
              </Button>
            </div>
          </div>

          {isSensitive && (
            <input
              type="text"
              placeholder="Reason (optional, e.g. 'graphic content')"
              value={sensitiveReason}
              onChange={(e) => setSensitiveReason(e.target.value)}
              maxLength={120}
              className="w-full text-xs px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/40 placeholder:text-amber-300/60"
            />
          )}

          <TooltipProvider>
            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide touch-scroll gap-0.5 pb-2 w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-green-500/10 rounded-lg transition-all group"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <div className="p-1 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all">
                      <Image className="h-3.5 w-3.5 text-green-600" />
                    </div>
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
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-red-500/10 rounded-lg transition-all group"
                    onClick={() => document.getElementById("video-upload")?.click()}
                  >
                    <div className="p-1 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-all">
                      <Video className="h-3.5 w-3.5 text-red-600" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video</TooltipContent>
              </Tooltip>

              <Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-yellow-500/10 rounded-lg transition-all group">
                        <div className="p-1 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all">
                          <Smile className="h-3.5 w-3.5 text-yellow-600" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Feeling</TooltipContent>
                  <PopoverContent className="w-full max-w-[90vw] sm:w-80 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5 sm:gap-2 p-2">
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
              </Tooltip>

              <Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-red-500/10 rounded-lg transition-all group">
                        <div className="p-1 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-all">
                          <MapPin className="h-3.5 w-3.5 text-red-600" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Location</TooltipContent>
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
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-blue-500/10 rounded-lg transition-all group"
                    onClick={() => setShowTagFriends(true)}
                  >
                    <div className="p-1 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                    </div>
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
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-purple-500/10 rounded-lg transition-all group"
                    onClick={() => setShowTemplates(true)}
                  >
                    <div className="p-1 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    </div>
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
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-orange-500/10 rounded-lg transition-all group"
                    onClick={() => setShowSchedule(true)}
                  >
                    <div className="p-1 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-all">
                      <Clock className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Schedule</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-cyan-500/10 rounded-lg transition-all group"
                    onClick={() => setShowPoll(true)}
                  >
                    <div className="p-1 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all">
                      <BarChart3 className="h-3.5 w-3.5 text-cyan-600" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Poll</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-pink-500/10 rounded-lg transition-all group"
                    onClick={() => setShowVoiceRecorder(true)}
                  >
                    <div className="p-1 rounded-full bg-pink-500/10 group-hover:bg-pink-500/20 transition-all">
                      <Mic className="h-3.5 w-3.5 text-pink-600" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice Note</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <AIContentAssistant
                    content={content}
                    onInsertContent={(text) => setContent((prev) => prev + " " + text)}
                  />
                </TooltipTrigger>
                <TooltipContent>AI Asistent</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Ephemeral + Collab + Drafts row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <EphemeralPostToggle visibility={postVisibility} onVisibilityChange={setPostVisibility} />
              <CollaborativePostEditor />
              <BackgroundStylePicker
                value={backgroundStyle}
                onChange={setBackgroundStyle}
                disabled={files.length > 0}
              />
            </div>
            <DraftsManager onSelectDraft={(draft: any) => setContent(draft.content || "")} />
          </div>

          {/* Poll preview */}
          {pollData && (
            <div className="mt-4 p-3 bg-accent/30 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">Poll: {pollData.question}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPollData(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {pollData.options.map((opt, i) => (
                  <div key={i}>• {opt}</div>
                ))}
              </div>
            </div>
          )}

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

        {/* Voice Recorder */}
        <AnimatePresence>
          {showVoiceRecorder && (
            <VoiceRecorder
              onRecorded={(file) => {
                setVoiceFile(file);
                setShowVoiceRecorder(false);
                toast({ title: "🎙️ Voice note added!" });
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          )}
        </AnimatePresence>

        {/* Voice file preview */}
        {voiceFile && !showVoiceRecorder && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/20 border border-white/5">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium flex-1">🎙️ Voice note attached</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setVoiceFile(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={uploading} 
          className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publishing...
            </>
          ) : (
            "Share Post"
          )}
        </Button>
      </form>

      <PostTemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={setContent}
      />

      <SchedulePostDialog
        open={showSchedule}
        onOpenChange={setShowSchedule}
      />

      {showPoll && (
        <CreatePollDialog
          onCreatePoll={(question, options, endsAt) => {
            setPollData({ question, options, endsAt });
            setShowPoll(false);
            toast({ title: "Poll added to post!" });
          }}
        />
      )}

      <TagFriendsDialog
        open={showTagFriends}
        onOpenChange={setShowTagFriends}
        selectedFriends={taggedFriends}
        onToggleFriend={(friendId) => {
          setTaggedFriends((prev) =>
            prev.includes(friendId)
              ? prev.filter((id) => id !== friendId)
              : [...prev, friendId]
          );
        }}
      />
    </div>
  );
}
