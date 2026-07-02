import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Link as LinkIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SocialShareButtonsProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  variant?: "default" | "compact";
  hashtags?: string[];
}

export const SocialShareButtons = ({
  title,
  description,
  url = window.location.href,
  imageUrl,
  variant = "default",
  hashtags = [],
}: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.join(",");

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    toast.success("Opening Facebook to share! 📘");
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtagString ? `&hashtags=${hashtagString}` : ""}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    toast.success("Opening Twitter to share! 🐦");
  };

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard! 📋");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === "compact") {
    return (
    <>
      <FloatingHowItWorks title={"Social Share Buttons - How it works"} steps={[{ title: 'Open', desc: 'Access the Social Share Buttons section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Social Share Buttons.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFacebookShare}
          className="h-8 w-8 p-0"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTwitterShare}
          className="h-8 w-8 p-0"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 w-8 p-0"
          title="Copy Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">Share on social media</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebookShare}
          className="gap-2"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitterShare}
          className="gap-2"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEmailShare}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
