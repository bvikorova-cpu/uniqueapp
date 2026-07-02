import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Twitter, Link as LinkIcon, Mail, MessageCircle, Code2, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  campaignType: "medical" | "dream" | "hero" | "crisis" | "pet" | "student" | "talent";
  campaignId: string;
  title: string;
  description: string;
  goalAmount?: number;
  raisedAmount?: number;
  imageUrl?: string;
  referralCode?: string | null;
}

/**
 * Universal share + embed widget for fundraising campaigns.
 * - Social share (FB / X / WhatsApp / email / copy)
 * - Optional referral code appended as ?ref=
 * - Embeddable iframe snippet pointing to /embed/campaign/:type/:id
 * - QR code for offline sharing
 */
export function CampaignShareWidget({
  campaignType, campaignId, title, description,
  goalAmount, raisedAmount, referralCode,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.uniqueapp.fun";
  const baseUrl = `${origin}/fundraising/${campaignType}/${campaignId}`;
  const shareUrl = useMemo(() => {
    if (!referralCode) return baseUrl;
    return `${baseUrl}?ref=${encodeURIComponent(referralCode)}`;
  }, [baseUrl, referralCode]);

  const embedSnippet = useMemo(
    () => `<iframe src="${origin}/embed/campaign/${campaignType}/${campaignId}" width="100%" height="420" frameborder="0" style="border:0;border-radius:12px;max-width:480px" loading="lazy" title="${title.replace(/"/g, "'")}"></iframe>`,
    [origin, campaignType, campaignId, title]
  );

  const shareText = `${title} — ${description.slice(0, 140)}`;
  const enc = encodeURIComponent;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = (network: "facebook" | "twitter" | "whatsapp" | "email" | "native") => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}&hashtags=fundraising,unique`,
      whatsapp: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`,
      email: `mailto:?subject=${enc(title)}&body=${enc(`${description}\n\n${shareUrl}`)}`,
    };
    if (network === "native" && typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, text: shareText, url: shareUrl }).catch(() => {});
      return;
    }
    window.open(urls[network], "_blank", "width=600,height=500,noopener");
  };

  const progressPct = goalAmount && goalAmount > 0
    ? Math.min(100, ((raisedAmount ?? 0) / goalAmount) * 100)
    : null;

  return (
    <>
      <FloatingHowItWorks title={"Campaign Share Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Share Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Share Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-primary" /> Share this campaign
          </CardTitle>
          <CardDescription>
            Every share doubles reach. {referralCode && "Your referral link earns rewards on first donations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="social">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="social"><Share2 className="h-4 w-4 mr-1" />Social</TabsTrigger>
              <TabsTrigger value="qr"><QrCode className="h-4 w-4 mr-1" />QR</TabsTrigger>
              <TabsTrigger value="embed"><Code2 className="h-4 w-4 mr-1" />Embed</TabsTrigger>
            </TabsList>

            <TabsContent value="social" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <Button variant="outline" size="sm" onClick={() => share("facebook")} className="gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => share("twitter")} className="gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" /> X
                </Button>
                <Button variant="outline" size="sm" onClick={() => share("whatsapp")} className="gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => share("email")} className="gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => share("native")} className="gap-2">
                  <Share2 className="h-4 w-4" /> More
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-xs" />
                <Button variant="secondary" size="sm" onClick={() => copy(shareUrl, "Link")}>
                  <LinkIcon className="h-4 w-4 mr-1" />
                  {copied === "Link" ? "Copied" : "Copy"}
                </Button>
              </div>
              {progressPct !== null && (
                <p className="text-xs text-muted-foreground">
                  €{(raisedAmount ?? 0).toFixed(0)} of €{goalAmount?.toFixed(0)} raised ({progressPct.toFixed(0)}%)
                </p>
              )}
            </TabsContent>

            <TabsContent value="qr" className="flex flex-col items-center gap-3 mt-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={shareUrl} size={200} level="H" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Print, post or scan in person. Goes straight to the campaign.
              </p>
            </TabsContent>

            <TabsContent value="embed" className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">
                Paste on any website, blog or community page.
              </p>
              <Textarea value={embedSnippet} readOnly className="font-mono text-xs h-32" />
              <Button variant="secondary" size="sm" onClick={() => copy(embedSnippet, "Embed code")} className="w-full">
                <Code2 className="h-4 w-4 mr-1" />
                {copied === "Embed code" ? "Copied" : "Copy embed code"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
