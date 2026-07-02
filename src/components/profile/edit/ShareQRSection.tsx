import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  userId: string;
  username: string;
  onUsernameChange: (v: string) => void;
  onCheckAvailability: (v: string) => Promise<boolean>;
}

export const ShareQRSection = ({ userId, username, onUsernameChange, onCheckAvailability }: Props) => {
  const { toast } = useToast();
  const [local, setLocal] = useState(username);
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => setLocal(username), [username]);

  const slug = (local || "").trim().toLowerCase();
  const valid = /^[a-z0-9_-]{3,24}$/.test(slug);
  const profileUrl = useMemo(
    () => slug ? `https://uniqueapp.fun/u/${slug}` : `https://uniqueapp.fun/profile/${userId}`,
    [slug, userId]
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0f0f1a&color=fefefe&qzone=1&data=${encodeURIComponent(profileUrl)}`;

  useEffect(() => {
    if (!slug) { setStatus("idle"); return; }
    if (!valid) { setStatus("invalid"); return; }
    if (slug === username) { setStatus("ok"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      const available = await onCheckAvailability(slug);
      setStatus(available ? "ok" : "taken");
    }, 400);
    return (
    <>
      <FloatingHowItWorks title={"Share Q R Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Share Q R Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Share Q R Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearTimeout(t);
  }, [slug, valid, username, onCheckAvailability]);

  const apply = () => {
    if (status !== "ok") return;
    onUsernameChange(slug);
    toast({ title: "Username reserved", description: "Save your profile to publish it." });
  };

  const copy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Share & QR</p>
          <p className="text-base font-black bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Your personal mini-link
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Username (3–24 chars: a–z, 0–9, _ -)</Label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1 flex items-center rounded-md border border-input bg-background overflow-hidden">
                <span className="px-3 text-xs text-muted-foreground border-r border-border/40 bg-muted/30 py-2">uniqueapp.fun/u/</span>
                <Input
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="yourname"
                  className="border-0 focus-visible:ring-0 h-9"
                  maxLength={24}
                />
              </div>
              <Button onClick={apply} disabled={status !== "ok"} variant="outline">
                Reserve
              </Button>
            </div>
            <p className={`text-[11px] mt-1 ${
              status === "ok" ? "text-emerald-400" :
              status === "taken" ? "text-destructive" :
              status === "invalid" ? "text-destructive" :
              "text-muted-foreground"
            }`}>
              {status === "checking" && "Checking availability…"}
              {status === "ok" && "✓ Available"}
              {status === "taken" && "✗ Taken — try another"}
              {status === "invalid" && local && "Use 3–24 lowercase letters, numbers, _ or -"}
              {status === "idle" && "Pick a memorable handle"}
            </p>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-1.5"><Link2 className="h-3 w-3" /> Profile link</Label>
            <div className="flex gap-2 mt-1">
              <Input value={profileUrl} readOnly className="text-xs" />
              <Button onClick={copy} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30 shadow-lg">
            <img src={qrUrl} alt="QR" className="w-40 h-40 rounded-lg bg-background" />
          </div>
          <a href={qrUrl} download={`profile-qr-${slug || userId}.png`} className="text-[10px] text-muted-foreground hover:text-foreground mt-2 underline">
            Download QR
          </a>
        </div>
      </div>
    </div>
  );
};
