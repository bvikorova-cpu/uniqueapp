import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Trash2, Trophy, Flame } from "lucide-react";
import { TopPremiumBadge } from "@/components/megatalent/TopPremiumBadge";
import { VoteBoostTooltip } from "@/components/megatalent/VoteBoostTooltip";
import MegatalentReactions from "@/components/megatalent/MegatalentReactions";
import MegatalentPinButton from "@/components/megatalent/MegatalentPinButton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SubmissionCardProps {
  submission: any;
  categoryLabel: string;
  isLiked: boolean;
  commentCount: number;
  isOwner: boolean;
  isDeleting: boolean;
  index: number;
  onVote: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (submission: any) => void;
  onDelete: (id: string) => void;
  onMediaClick: (url: string, type: "image" | "video") => void;
}

export default function MegaTalentSubmissionCard({
  submission,
  categoryLabel,
  isLiked,
  commentCount,
  isOwner,
  isDeleting,
  index,
  onVote,
  onComment,
  onShare,
  onDelete,
  onMediaClick,
}: SubmissionCardProps) {
  const isTopPremium = submission.subscriptionTier === "top_premium";
  const displayVotes = (submission.votes_count || 0).toLocaleString();

  return (
    <>
      <FloatingHowItWorks title={"Mega Talent Submission Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Mega Talent Submission Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mega Talent Submission Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card
        className={`overflow-hidden backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/20 transition-all ${
          isTopPremium ? "ring-2 ring-yellow-500/30" : ""
        }`}
      >
        {/* User header */}
        <CardHeader className="pb-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {submission.profiles?.full_name?.[0] || "U"}
                </div>
                {isTopPremium && (
                  <TopPremiumBadge variant="small" className="absolute -bottom-1 -right-1" showIcon={false} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm">{submission.profiles?.full_name || "User"}</p>
                  {isTopPremium && <TopPremiumBadge variant="inline" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(submission.created_at).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {categoryLabel}
              </Badge>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(submission.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-base">{submission.title}</h3>

          {/* Media */}
          <div className="rounded-xl overflow-hidden border border-border/20">
            {submission.media_type === "image" ? (
              <img
                src={submission.media_url}
                alt={submission.title}
                className="w-full aspect-video object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => onMediaClick(submission.media_url, "image")}
              />
            ) : (
              <video
                src={submission.media_url}
                controls
                className="w-full aspect-video"
              />
            )}
          </div>

          {/* Description */}
          {submission.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{submission.description}</p>
          )}

          {/* Reactions + Pin */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <MegatalentReactions submissionId={submission.id} />
            <MegatalentPinButton submissionId={submission.id} isOwner={isOwner} />
          </div>

          {/* Engagement bar */}
          <div className="flex items-center justify-between pt-1 border-t border-border/20">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(submission.id)}
                className={`gap-1.5 h-8 px-3 ${isLiked ? "text-red-500" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-xs font-bold">{displayVotes}</span>
              </Button>
              {isTopPremium && <VoteBoostTooltip isTopPremium={true} />}

              <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3" onClick={() => onComment(submission.id)}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{commentCount}</span>
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="h-8 px-3" onClick={() => onShare(submission)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
