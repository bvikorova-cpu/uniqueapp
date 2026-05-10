import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  code: string;
}

export function ReferralQRDialog({ open, onOpenChange, url, code }: Props) {
  const downloadQR = () => {
    const svg = document.getElementById("referral-qr-svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `referral-${code}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan to join with my code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG id="referral-qr-svg" value={url} size={220} level="H" includeMargin={false} />
          </div>
          <p className="font-mono text-sm text-muted-foreground break-all text-center">{code}</p>
          <Button onClick={downloadQR} variant="secondary" className="w-full">
            <Download className="h-4 w-4 mr-2" /> Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
