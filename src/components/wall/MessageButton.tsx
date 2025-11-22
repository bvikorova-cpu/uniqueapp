import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { formatDistanceToNow } from "date-fns";

interface MessageButtonProps {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export const MessageButton = ({ userId, userName, userAvatar }: MessageButtonProps) => {
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage } = useDirectMessages(userId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage({
      receiverId: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
            {userName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === userId ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === userId
                      ? "bg-accent"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2 mt-4">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
