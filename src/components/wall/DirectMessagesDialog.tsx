import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, MoreHorizontal, ExternalLink, BellOff, Bell, User, Trash2, Flag, Phone, Video, Image, Smile, ThumbsUp, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useDmMutes } from "@/hooks/useDmMutes";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { MessageReactions } from "@/components/wall/MessageReactions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface DirectMessagesDialogProps {
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export const DirectMessagesDialog = ({
  userId,
  userName,
  userAvatar,
}: DirectMessagesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage } = useDirectMessages(userId);
  const messageIds = messages.map((m) => m.id);
  const { reactionsByMessage, toggle: toggleReaction } = useMessageReactions(messageIds);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const EMOJIS = ["😊", "😂", "❤️", "🔥", "👍", "🎉", "😍", "🤔", "🙌", "💯", "🚀", "✨", "😎", "👀", "🙏", "💪"];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id));
  }, []);

  const handleAttachImage = () => fileInputRef.current?.click();

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5 MB.", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Not signed in");
      const path = `${uid}/dm-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      sendMessage({ receiverId: userId, content: urlData.publicUrl });
      toast({ title: "Image sent" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message ?? "Could not upload image.", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertEmoji = (emoji: string) => setMessage((prev) => prev + emoji);

  const handleSend = () => {
    if (!message.trim() || !userId) return;
    sendMessage({ receiverId: userId, content: message });
    setMessage("");
  };

  const handleOpenInMessenger = () => {
    setOpen(false);
    navigate("/messenger");
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Notifications enabled" : "Notifications muted",
      description: isMuted 
        ? `You will receive notifications from ${userName}` 
        : `You won't receive notifications from ${userName}`,
    });
  };

  const handleViewProfile = () => {
    setOpen(false);
    navigate(`/profile/${userId}`);
  };

  const handleDeleteConversation = () => {
    toast({
      title: "Conversation deleted",
      description: "This conversation has been removed",
    });
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for your feedback",
    });
  };

  const handleQuickReaction = () => {
    if (!userId) return;
    sendMessage({ receiverId: userId, content: "👍" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header with options */}
        <DialogHeader className="p-0">
          <div className="flex items-center justify-between p-3 border-b bg-card">
            <DialogTitle className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs text-green-500 font-normal">Active now</p>
              </div>
            </DialogTitle>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleOpenInMessenger}
                title="Open in Messenger to start a call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleOpenInMessenger}
                title="Open in Messenger to start a video call"
              >
                <Video className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleOpenInMessenger} className="cursor-pointer">
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Open in Messenger
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleMute} className="cursor-pointer">
                    {isMuted ? (
                      <>
                        <Bell className="h-4 w-4 mr-3" />
                        Unmute notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4 mr-3" />
                        Mute notifications
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
                    <User className="h-4 w-4 mr-3" />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDeleteConversation} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleReport} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Flag className="h-4 w-4 mr-3" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>
        
        {/* Messages area */}
        <ScrollArea className="h-80 px-4">
          <div className="space-y-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{userName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a conversation with {userName}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === userId ? "justify-start" : "justify-end"
                  }`}
                >
                  {msg.sender_id === userId && (
                    <Avatar className="h-7 w-7 mr-2 flex-shrink-0">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="text-xs">{userName?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`rounded-2xl px-3 py-2 group relative ${
                        msg.sender_id === userId
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <MessageReactions
                      messageId={msg.id}
                      reactions={reactionsByMessage[msg.id] || []}
                      currentUserId={currentUserId}
                      onToggle={(messageId, emoji) => toggleReaction({ messageId, emoji })}
                      align={msg.sender_id === userId ? "start" : "end"}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex items-center gap-2 p-3 border-t bg-card">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary flex-shrink-0"
            onClick={handleAttachImage}
            disabled={uploadingImage}
            title="Send an image"
          >
            {uploadingImage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Image className="h-5 w-5" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary flex-shrink-0"
                title="Add an emoji"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" side="top" align="start">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl hover:bg-muted rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aa"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
          />
          {message.trim() ? (
            <Button onClick={handleSend} size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary flex-shrink-0"
              onClick={handleQuickReaction}
            >
              <ThumbsUp className="h-5 w-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
