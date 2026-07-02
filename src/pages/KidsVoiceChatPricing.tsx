import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Sparkles, Crown } from "lucide-react";
import { useChatCredits } from "@/hooks/useChatCredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSVOICECHATPRICING_STEPS = [
  { title: 'Pick a pack', desc: 'Packs bundle minutes at a lower per-minute price.' },
  { title: 'Pay securely', desc: 'Stripe checkout — parent-approved via parental gate.' },
  { title: 'Minutes appear instantly', desc: 'Minutes are usable in Voice Chat right away.' }
];
const __HIW_KIDSVOICECHATPRICING = { title: 'Voice Chat Pricing', intro: 'Choose a pack for Kids Voice Chat.', steps: __HIW_KIDSVOICECHATPRICING_STEPS };


interface Pack {
  credits: number;
  price: string;
  badge?: string;
  highlight?: boolean;
}

const PACKS: Pack[] = [
  { credits: 50, price: "€4.99", badge: "Starter" },
  { credits: 150, price: "€12.99", badge: "Most Popular", highlight: true },
  { credits: 500, price: "€39.99", badge: "Best Value" },
];

export default function KidsVoiceChatPricing() {
  const navigate = useNavigate();
  const { credits_remaining, loading, purchaseCredits } = useChatCredits();

  const handleBuy = async (credits: number) => {
    const url = await purchaseCredits(credits);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
    else toast.error("Could not start checkout. Please try again.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-pink-50 to-cyan-100">
      <FloatingHowItWorks title={__HIW_KIDSVOICECHATPRICING.title} intro={__HIW_KIDSVOICECHATPRICING.intro} steps={__HIW_KIDSVOICECHATPRICING.steps} />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/kids-voice-chat")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Character Chat
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-3">
            💬 Chat Credit Packs
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            1 credit = 1 message. Chat with all characters, no subscription needed.
          </p>
          {!loading && (
            <p className="text-sm text-gray-500">
              You currently have <span className="font-bold text-purple-600">{credits_remaining}</span> credits.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKS.map((pack) => (
            <Card
              key={pack.credits}
              className={`p-6 bg-white/85 backdrop-blur-md border-2 shadow-xl flex flex-col ${
                pack.highlight ? "border-purple-400 scale-105" : "border-white/50"
              }`}
            >
              {pack.badge && (
                <div className="flex justify-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pack.highlight ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {pack.highlight && <Crown className="inline h-3 w-3 mr-1" />}
                    {pack.badge}
                  </span>
                </div>
              )}
              <div className="text-center flex-1">
                <MessageCircle className="h-12 w-12 mx-auto text-purple-500 mb-3" />
                <div className="text-4xl font-black text-gray-800 mb-1">{pack.credits}</div>
                <div className="text-sm text-gray-500 mb-4">messages</div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{pack.price}</div>
                <div className="text-xs text-gray-500 mb-6">
                  ≈ €{(parseFloat(pack.price.replace("€", "")) / pack.credits).toFixed(2)} per message
                </div>
              </div>
              <Button
                onClick={() => handleBuy(pack.credits)}
                disabled={loading}
                className={`w-full ${
                  pack.highlight
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : ""
                }`}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Buy {pack.credits} credits
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8 max-w-2xl mx-auto">
          Credits never expire. Safe for kids ages 6–12. All chats use age-appropriate AI safety filters.
          Payments processed securely through Stripe.
        </p>
      </div>
    </div>
  );
}
