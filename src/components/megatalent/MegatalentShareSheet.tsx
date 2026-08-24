import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildMegatalentShare } from "@/lib/megatalentShare";
import { shareLink } from "@/lib/shareLink";

interface Props {
  submission: any | null;
  onClose: () => void;
}

const MegatalentShareSheet = ({ submission, onClose }: Props) => {
  const { toast } = useToast();
  const share = submission ? buildMegatalentShare(submission) : null;

  const copyLink = async () => {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(`${share.text} ${share.url}`);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const nativeShare = async () => {
    if (!share) return;
    const res = await shareLink(share);
    if (res === "copied") toast({ title: "Link copied" });
    if (res === "failed") toast({ title: "Error", variant: "destructive" });
  };

  const openWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <Sheet open={!!submission} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent>
        <SheetHeader><SheetTitle>Share</SheetTitle></SheetHeader>
        {share && (
          <div className="space-y-3 mt-6">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
              <p className="font-medium">{share.text}</p>
              <p className="text-xs text-muted-foreground break-all mt-1">{share.url}</p>
            </div>
            <Button className="w-full justify-start gap-2" onClick={nativeShare}>
              <Share2 className="h-4 w-4" /> Share…
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={copyLink}>
              <Copy className="h-4 w-4" /> Copy link + text
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share.url)}&quote=${encodeURIComponent(share.text)}`)}>
              <Facebook className="h-4 w-4" /> Share on Facebook
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => openWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(share.text)}&url=${encodeURIComponent(share.url)}`)}>
              Share on X (Twitter)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => openWindow(`https://wa.me/?text=${encodeURIComponent(`${share.text} ${share.url}`)}`)}>
              Share via WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MegatalentShareSheet;
