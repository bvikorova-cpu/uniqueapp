import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentReactionPicker } from "./CommentReactionPicker";
import { EnhancedCommentInput } from "./EnhancedCommentInput";
import { VerifiedBadge, getVerifiedRingClass } from "@/components/verified/VerifiedBadge";
import { MapPin, MessageCircle, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRewardsCosmeticsFor } from "@/hooks/useRewardsCosmetics";
import { avatarRingClass, rewardsNameClass } from "@/lib/rewardsCosmeticStyles";
import { enUS } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  const { user } = useAuth();
  const isOwner = !!user && user.id === comment.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content || "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setSaving(true);
    const { error } = await supabase
      .from("post_comments")
      .update({ content: trimmed })
      .eq("id", comment.id)
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    comment.content = trimmed;
    setIsEditing(false);
    toast.success("Comment updated");
    onReplyAdded();
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setConfirmDelete(false);
    toast.success("Comment deleted");
    onReplyAdded();
  };


  const authorCosmetics = useRewardsCosmeticsFor(comment.user_id);
  const authorFrame = avatarRingClass(authorCosmetics);
  const authorName = rewardsNameClass(authorCosmetics.name_color);

  const commentReplies = replies.filter(r => r.parent_comment_id === comment.id);
  const maxDepth = 3;

  return (
    <>
      
      <div className={`${depth > 0 ? "ml-6 border-l-2 border-border/30 pl-2" : ""}`}>
      <div className="flex gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
        <Avatar className={`h-7 w-7 flex-shrink-0 ${authorFrame || getVerifiedRingClass(comment.profiles?.verification_tier)}`}>
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {comment.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold flex items-center gap-1 flex-wrap">
            <span className={`truncate ${authorName}`}>{comment.profiles?.full_name || "User"}</span>
            {comment.profiles?.verification_tier && (
              <VerifiedBadge tier={comment.profiles.verification_tier} size="sm" showLabel={false} />
            )}
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
          
          {isEditing ? (
            <div className="mt-1 space-y-1">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-xs min-h-[60px]"
                maxLength={2000}
              />
              <div className="flex gap-1">
                <Button size="sm" className="h-6 text-[10px]" disabled={saving} onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    setEditValue(comment.content || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
          )}

          
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
          
          {/* Actions row */}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground">
              { formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: enUS })}
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

            {isOwner && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] gap-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] gap-1 text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </>
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

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>

  );
};
