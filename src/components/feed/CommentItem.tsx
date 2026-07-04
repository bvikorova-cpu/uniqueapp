import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentReactionPicker } from "./CommentReactionPicker";
import { EnhancedCommentInput } from "./EnhancedCommentInput";
import { VoiceCommentPlayer } from "@/components/wall/VoiceCommentPlayer";
import { MapPin, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";


interface CommentItemProps {
  comment: any;
  postId: string;
  onImageClick: (url: string) => void;
  onReplyAdded: () => void;
  replies?: any[];
  depth?: number;
}

export const CommentItem = ({ 
  comment, 
  postId, 
  onImageClick, 
  onReplyAdded,
  replies = [],
  depth = 0 
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const commentReplies = replies.filter(r => r.parent_comment_id === comment.id);
  const maxDepth = 3;

  return (
    <>
      <FloatingHowItWorks title={"Comment Item - How it works"} steps={[{ title: 'Open', desc: 'Access the Comment Item section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comment Item.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className={`${depth > 0 ? "ml-6 border-l-2 border-border/30 pl-2" : ""}`}>
      <div className="flex gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">
            {comment.profiles?.full_name || "User"}
          </p>
          
          {/* Feeling & Location */}
          {(comment.feeling || comment.location) && (
            <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground my-0.5">
              {comment.feeling && <span>{comment.feeling}</span>}
              {comment.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" /> {comment.location}
                </span>
              )}
            </div>
          )}
          
          <p className="text-xs text-foreground/90 mt-0.5">{comment.content}</p>
          
          {/* Comment Media */}
          {comment.image_url && (
            <img 
              src={comment.image_url} 
              alt="Comment image" 
              className="mt-1 max-w-[200px] rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => onImageClick(comment.image_url)}
            />
          )}
          {comment.video_url && (
            <video 
              src={comment.video_url} 
              controls 
              className="mt-1 max-w-[200px] rounded-lg"
            />
          )}
          
          {/* Voice Comment Player */}
          {comment.voice_url && (
            <VoiceCommentPlayer 
              voiceUrl={comment.voice_url} 
              duration={comment.voice_duration || 0}
              compact
            />
          )}
          
          {/* Actions row */}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: enUS,
              })}
            </p>
            
            <CommentReactionPicker commentId={comment.id} />
            
            {depth < maxDepth && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 px-1.5 text-[10px] gap-1"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageCircle className="h-3 w-3" />
                Reply
              </Button>
            )}
          </div>
          
          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-2">
              <EnhancedCommentInput 
                postId={postId}
                parentCommentId={comment.id}
                onCommentAdded={() => {
                  setShowReplyInput(false);
                  onReplyAdded();
                }}
                compact
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {commentReplies.length > 0 && (
        <div className="mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-[10px] gap-1 text-muted-foreground"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {commentReplies.length} {commentReplies.length === 1 ? "reply" : "replies"}
          </Button>
          
          {showReplies && (
            <div className="space-y-1">
              {commentReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onImageClick={onImageClick}
                  onReplyAdded={onReplyAdded}
                  replies={replies}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};
