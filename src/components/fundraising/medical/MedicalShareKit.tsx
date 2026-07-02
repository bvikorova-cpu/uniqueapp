import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Copy, Check, MessageCircle, Mail, Facebook, Twitter, Instagram, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  campaignTitle: string;
  patientName: string;
  diagnosis: string;
  targetAmount: number;
  currentAmount: number;
  campaignUrl: string;
}

/**
 * Mobile-first share kit: pre-written templates for WhatsApp, IG Stories,
 * Facebook, X/Twitter, Email + a "Copy story" block donors can paste anywhere.
 * Modeled after GoFundMe's mobile share kit.
 */
export function MedicalShareKit({
  campaignTitle,
  patientName,
  diagnosis,
  targetAmount,
  currentAmount,
  campaignUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const remaining = Math.max(targetAmount - currentAmount, 0);
  const pct = Math.round((currentAmount / targetAmount) * 100);

  const shortText = `🙏 Please help ${patientName} — fighting ${diagnosis}. We've raised €${currentAmount.toLocaleString()} of €${targetAmount.toLocaleString()} (${pct}%). Every euro counts.`;
  const longText = `${shortText}\n\n${campaignUrl}\n\nThank you for sharing 💜`;
  const [customText, setCustomText] = useState(longText);

  const encoded = encodeURIComponent(customText);
  const encodedUrl = encodeURIComponent(campaignUrl);

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "bg-emerald-500 hover:bg-emerald-600",
      url: `https://wa.me/?text=${encoded}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: Twitter,
      color: "bg-foreground hover:bg-foreground/80 text-background",
      url: `https://twitter.com/intent/tweet?text=${encoded}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      color: "bg-rose-500 hover:bg-rose-600",
      url: `mailto:?subject=${encodeURIComponent("Please help " + patientName)}&body=${encoded}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customText);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — please copy manually");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: campaignTitle,
          text: shortText,
          url: campaignUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Medical Share Kit - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Share Kit section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Share Kit.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base leading-tight">Share & multiply impact</h3>
          <p className="text-xs text-muted-foreground">
            One share = average €{remaining > 0 ? Math.round(remaining / 25) : 5} more raised
          </p>
        </div>
      </div>

      {/* Native share (mobile) */}
      <Button
        variant="default"
        size="lg"
        className="w-full mb-3 bg-gradient-to-r from-primary to-accent"
        onClick={handleNativeShare}
      >
        <Smartphone className="mr-2 h-4 w-4" /> Share via your phone
      </Button>

      {/* Channel buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {channels.map((c) => (
          <a
            key={c.key}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${c.color} text-white rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95`}
          >
            <c.icon className="w-4 h-4" /> {c.label}
          </a>
        ))}
      </div>

      {/* Instagram Story hint */}
      <a
        href={`https://www.instagram.com/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 pl-2"
      >
        <Instagram className="w-4 h-4" />
        Instagram Stories: copy text below, then paste in your story
      </a>

      {/* Editable message */}
      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
        Customize your message
      </label>
      <Textarea
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        rows={4}
        className="text-sm mb-2 resize-none"
      />
      <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
        {copied ? (
          <>
            <Check className="mr-2 h-3.5 w-3.5" /> Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy message
          </>
        )}
      </Button>
    </Card>
    </>
  );
}
