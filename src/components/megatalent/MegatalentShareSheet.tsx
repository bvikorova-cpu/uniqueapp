import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  submission: any | null;
  onClose: () => void;
}

const MegatalentShareSheet = ({ submission, onClose }: Props) => {
  const { toast } = useToast();
  const copyMediaLink = async (url: string) => {
    try { await navigator.clipboard.writeText(url); toast({ title: "Link copied" }); } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const shareToFacebook = (s: any) => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(s.media_url)}`, '_blank'); };
  const shareToTwitter = (s: any) => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(s.title)}&url=${encodeURIComponent(s.media_url)}`, '_blank'); };
  const shareToWhatsApp = (s: any) => { window.open(`https://wa.me/?text=${encodeURIComponent(`${s.title} - ${s.media_url}`)}`, '_blank'); };

  return (
    <Sheet open={!!submission} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent>
        <SheetHeader><SheetTitle>Share</SheetTitle></SheetHeader>
        {submission && (
          <div className="space-y-4 mt-6">
            <Button variant="outline" className="w-full justify-start" onClick={() => copyMediaLink(submission.media_url)}><Copy className="h-4 w-4 mr-2" /> Copy media link</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => shareToFacebook(submission)}><Facebook className="h-4 w-4 mr-2" /> Share on Facebook</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => shareToTwitter(submission)}>Share on X (Twitter)</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => shareToWhatsApp(submission)}>Share via WhatsApp</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MegatalentShareSheet;
