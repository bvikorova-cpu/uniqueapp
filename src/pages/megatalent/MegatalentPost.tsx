import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, Loader2, Share2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TalentCommentsSheet } from "@/components/megatalent/TalentCommentsSheet";
import MegatalentReactions from "@/components/megatalent/MegatalentReactions";
import { buildMegatalentShare } from "@/lib/megatalentShare";
import { shareLink } from "@/lib/shareLink";
import { extractVideoFirstFrame } from "@/lib/videoThumbnail";

const MegatalentPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [comments, setComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("talent_submissions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", (data as any).user_id)
          .maybeSingle();
        setSubmission({ ...data, profiles: profile });
      } else {
        setSubmission(null);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !userId) return;
    supabase
      .from("talent_votes")
      .select("id")
      .eq("submission_id", id)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setVoted(!!data));
  }, [id, userId]);

  // Auto-generate a first-frame thumbnail for videos so social previews show an image.
  useEffect(() => {
    if (!submission?.media_url || submission.media_type !== "video" || submission.thumbnail_url) return;

    const generateThumbnail = async () => {
      try {
        const blob = await extractVideoFirstFrame(submission.media_url);
        const fileName = `thumbnails/${submission.user_id}/${submission.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);
        await supabase.from("talent_submissions").update({ thumbnail_url: publicUrl }).eq("id", submission.id);
        setSubmission((s: any) => ({ ...s, thumbnail_url: publicUrl }));
      } catch (error) {
        console.error("Thumbnail generation failed:", error);
      }
    };

    generateThumbnail();
  }, [submission?.media_url, submission?.media_type, submission?.thumbnail_url, submission?.id, submission?.user_id]);

  const handleVote = async () => {
    if (!userId) {
      toast.error("Sign in to vote", { description: "Only registered users can vote." });
      navigate("/auth");
      return;
    }
    if (voted) {
      toast.info("You already voted for this submission");
      return;
    }
    const { error } = await supabase
      .from("talent_votes")
      .insert({ submission_id: id, user_id: userId, vote_type: "like" });
    if (error) {
      toast.error("Vote failed", { description: error.message });
      return;
    }
    setVoted(true);
    setSubmission((s: any) => ({ ...s, votes_count: (s?.votes_count || 0) + 1 }));
    toast.success("Thanks for voting! 🏆");
  };

  const handleShare = async () => {
    if (!submission) return;
    const payload = buildMegatalentShare(submission);
    const res = await shareLink(payload);
    if (res === "copied") toast.success("Link copied — paste it anywhere!");
    if (res === "failed") toast.error("Sharing failed");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">This submission is no longer available.</p>
        <Button onClick={() => navigate("/megatalent")}>Go to MegaTalent</Button>
      </div>
    );
  }

  const isVideo = submission.media_type === "video";
  const share = buildMegatalentShare(submission);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <Helmet>
        <title>{`${submission.title} — MegaTalent | Unique`}</title>
        <meta name="description" content={share.text} />
        <meta property="og:title" content={`${submission.title} — MegaTalent`} />
        <meta property="og:description" content={share.text} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={share.url} />
        {submission.media_url && !isVideo && <meta property="og:image" content={submission.media_url} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/megatalent")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to MegaTalent
        </Button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/40">
                  <AvatarImage src={submission.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{(submission.profiles?.full_name || "U").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{submission.profiles?.full_name || "User"}</p>
                  <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">
                    {String(submission.category || "").replace(/_/g, " ")}
                  </Badge>
                </div>
                <Badge className="gap-1">
                  <Trophy className="h-3 w-3" /> {submission.votes_count || 0}
                </Badge>
              </div>

              <div className="bg-black/95 flex items-center justify-center">
                {isVideo ? (
                  <video src={submission.media_url} controls playsInline className="w-full max-h-[70vh]" />
                ) : (
                  <img src={submission.media_url} alt={submission.title} className="w-full max-h-[70vh] object-contain" />
                )}
              </div>

              <div className="p-4 space-y-3">
                <h1 className="text-xl font-bold">{submission.title}</h1>
                {submission.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{submission.description}</p>
                )}

                <MegatalentReactions submissionId={submission.id} />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button onClick={handleVote} variant={voted ? "secondary" : "default"} className="gap-2">
                    <Heart className={`h-4 w-4 ${voted ? "fill-current" : ""}`} />
                    {voted ? "Voted" : "Vote"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setComments(true)}>
                    <MessageCircle className="h-4 w-4" /> {commentCount || ""} Comments
                  </Button>
                  <Button variant="ghost" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <TalentCommentsSheet
        submissionId={comments ? submission.id : null}
        open={comments}
        onOpenChange={(o) => setComments(o)}
        onCountChange={(_sid: string, n: number) => setCommentCount(n)}
      />
    </div>
  );
};

export default MegatalentPost;
