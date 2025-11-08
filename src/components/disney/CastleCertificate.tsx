import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { toast } from "sonner";

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

  if (!isVisible) return null;

  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
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
                  Disney Castle Explorer
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
                      Disney Castles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 justify-center">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? "Generating..." : "Download Certificate"}
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
        </Card>
      </div>
    </>
  );
};
