import { QrCode, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";

interface ProfileQRCodeProps {
  userId: string;
  userName: string;
}

export const ProfileQRCode = ({ userId, userName }: ProfileQRCodeProps) => {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/profile/${userId}`;

  const download = () => {
    const canvas = document.getElementById("profile-qr") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${userName.replace(/\s+/g, "-")}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-card/80 backdrop-blur-md border-amber-400/30">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-amber-400/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Profile QR
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeCanvas id="profile-qr" value={url} size={220} level="H" includeMargin={false} />
          </div>
          <p className="text-xs text-muted-foreground text-center break-all">{url}</p>
          <Button onClick={download} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold">
            <Download className="h-4 w-4 mr-2" /> Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
