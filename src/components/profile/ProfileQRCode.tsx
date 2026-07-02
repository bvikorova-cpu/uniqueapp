import { QrCode, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Profile Q R Code - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Q R Code section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Q R Code.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
