import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, X, Facebook, Twitter, Instagram } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CastleCertificateProps {
  castleName: string;
  completionTime: number;
  unlockedMilestones: number[];
  totalRooms: number;
  isVisible: boolean;
  onClose: () => void;
}

export const CastleCertificate = ({
  castleName,
  completionTime,
  unlockedMilestones,
  totalRooms,
  isVisible,
  onClose,
}: CastleCertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      generateQRCode();
    }
  }, [isVisible]);

  const generateQRCode = async () => {
    try {
      // Generate a shareable URL (you can customize this with actual sharing logic)
      const certificateData = {
        castle: castleName,
        time: completionTime,
        milestones: unlockedMilestones.length,
        rooms: totalRooms,
        date: new Date().toISOString(),
      };
      
      const dataUrl = await QRCode.toDataURL(JSON.stringify(certificateData), {
        width: 200,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      });
      
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${castleName.replace(/\s/g, "-")}-Certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Certificate downloaded successfully! 🎉");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to download certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "certificate.png", { type: "image/png" });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${castleName} Tour Certificate`,
            text: `I completed the magical tour of ${castleName}! 🏰✨`,
            files: [file],
          });
          toast.success("Certificate shared successfully! 🎉");
        } else {
          // Fallback: download instead
          await handleDownload();
          toast.info("Sharing not supported. Certificate downloaded instead.");
        }
      });
    } catch (error) {
      console.error("Error sharing certificate:", error);
      toast.error("Failed to share certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFacebookShare = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageUrl = canvas.toDataURL("image/png");
      
      // Create share text
      const shareText = `I just completed the magical tour of ${castleName}! 🏰✨ Check out my certificate!`;
      const shareUrl = window.location.origin;
      
      // Facebook Share Dialog (requires App ID for image sharing, so we use the sharer.php)
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      
      window.open(facebookUrl, "_blank", "width=600,height=400");
      
      toast.success("Opening Facebook to share! 📘");
      toast.info("Tip: Download the certificate and attach it to your post for the full effect!");
    } catch (error) {
      console.error("Error sharing to Facebook:", error);
      toast.error("Failed to share to Facebook");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTwitterShare = () => {
    const shareText = `I just completed the magical tour of ${castleName}! 🏰✨ #FairyCastles #MagicalTour`;
    const shareUrl = window.location.origin;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(twitterUrl, "_blank", "width=600,height=400");
    
    toast.success("Opening Twitter to share! 🐦");
    toast.info("Tip: Download the certificate and attach it to your tweet!");
  };

  const handleInstagramShare = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "certificate.png", { type: "image/png" });

        // Instagram doesn't have a web sharing API, so we'll download and provide instructions
        const link = document.createElement("a");
        link.download = `${castleName.replace(/\s/g, "-")}-Certificate.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("Certificate downloaded! 📸", {
          description: "Open Instagram app and create a new post with this image!",
          duration: 5000,
        });
      });
    } catch (error) {
      console.error("Error preparing for Instagram:", error);
      toast.error("Failed to prepare for Instagram");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <FloatingHowItWorks title={"Castle Certificate - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Certificate section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Certificate.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Certificate Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <Card className="relative bg-background p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Certificate Content */}
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-amber-50 via-white to-purple-50 p-12 rounded-lg"
          >
            {/* Decorative Border */}
            <div className="border-8 border-double border-amber-400 p-8 rounded-lg">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-4">
                  <Award className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Certificate of Achievement
                </h1>
                <p className="text-xl text-muted-foreground">
                  Fairy Castle Explorer
                </p>
              </div>

              {/* Divider */}
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-8" />

              {/* Main Content */}
              <div className="space-y-6 text-center">
                <p className="text-lg text-foreground">
                  This certifies that
                </p>

                <div className="py-4 px-8 bg-white/50 rounded-lg border-2 border-amber-200">
                  <p className="text-3xl font-bold text-primary">
                    Magical Explorer
                  </p>
                </div>

                <p className="text-lg text-foreground">
                  has successfully completed the enchanting tour of
                </p>

                <div className="py-4 px-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                  <p className="text-3xl font-bold text-purple-700">
                    {castleName}
                  </p>
                </div>

                {/* Tour Details */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-white/80 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Completion Time
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatTime(completionTime)}
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Rooms Explored
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {totalRooms}
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Milestones Unlocked
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {unlockedMilestones.length}
                    </p>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="flex justify-center gap-4 mt-6">
                  {unlockedMilestones.includes(25) && (
                    <div className="text-4xl" title="Explorer">⭐</div>
                  )}
                  {unlockedMilestones.includes(50) && (
                    <div className="text-4xl" title="Adventurer">🏅</div>
                  )}
                  {unlockedMilestones.includes(75) && (
                    <div className="text-4xl" title="Castle Master">🏆</div>
                  )}
                  {unlockedMilestones.includes(100) && (
                    <div className="text-4xl" title="Royal Champion">👑</div>
                  )}
                </div>

                {/* QR Code and Date */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-amber-200">
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">
                      Awarded on
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {completionDate}
                    </p>
                  </div>

                  {qrCodeUrl && (
                    <div className="text-center">
                      <img
                        src={qrCodeUrl}
                        alt="Certificate QR Code"
                        className="w-24 h-24 border-2 border-amber-300 rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Scan to verify
                      </p>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-3xl mb-1">🏰</div>
                    <p className="text-sm font-semibold text-primary">
                      Fairy Castles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mt-6">
            {/* Primary Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleDownload}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                {isGenerating ? "Generating..." : "Download"}
              </Button>

              <Button
                onClick={handleShare}
                disabled={isGenerating}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>

            {/* Social Media Sharing */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Share on social media
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleFacebookShare}
                  disabled={isGenerating}
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30 text-[#1877F2]"
                >
                  <Facebook className="h-5 w-5" />
                  Facebook
                </Button>

                <Button
                  onClick={handleTwitterShare}
                  disabled={isGenerating}
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/30 text-[#1DA1F2]"
                >
                  <Twitter className="h-5 w-5" />
                  Twitter
                </Button>

                <Button
                  onClick={handleInstagramShare}
                  disabled={isGenerating}
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 hover:from-[#F58529]/20 hover:via-[#DD2A7B]/20 hover:to-[#8134AF]/20 border-[#DD2A7B]/30 text-[#DD2A7B]"
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
    </>
  );
};
