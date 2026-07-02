import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { usePatronCheckout } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";


export function PatronModeCard({ authorUserId, authorName }: { authorUserId: string; authorName: string }) {
  const checkout = usePatronCheckout();

  const TIERS = [
    {
      id: "bronze" as const,
      name: "Bronze",
      price: "€4.99/mo",
      perks: ["Patron badge", "Exclusive stories"],
    },
    {
      id: "silver" as const,
      name: "Silver",
      price: "€9.99/mo",
      perks: ["All Bronze perks", "Voice narrations", "Early access"],
      popular: true,
    },
    {
      id: "gold" as const,
      name: "Gold",
      price: "€19.99/mo",
      perks: ["All Silver perks", "Custom requests", "Direct messages"],
    },
  ];

  return (
    <><FloatingHowItWorks title="PatronModeCard — How it works" steps={[{title:"Open this section",desc:"Access PatronModeCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(45,30%,8%)] via-[hsl(0,30%,7%)] to-[hsl(280,25%,7%)] border-yellow-900/30 mb-6">
      <h3 className="text-xl font-black text-yellow-100 flex items-center gap-2 mb-1">
        <Crown className="w-5 h-5 text-yellow-400" />
        {`Become a Patron of ${authorName}`}
      </h3>
      <p className="text-xs text-yellow-200/60 mb-4">{"Support your favorite horror author. Unlock exclusive content."}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`p-4 rounded-xl border-2 bg-card/40 ${
              tier.popular ? "border-yellow-700/60 shadow-[0_0_25px_rgba(180,140,0,0.3)]" : "border-yellow-900/30"
            }`}
          >
            {tier.popular && <span className="block text-[10px] font-bold text-yellow-400 mb-1">{"POPULAR"}</span>}
            <p className="font-bold text-yellow-100">{tier.name}</p>
            <p className="text-lg font-black text-yellow-200 mb-2">{tier.price}</p>
            <ul className="text-xs text-yellow-100/70 space-y-1 mb-3">
              {tier.perks.map((p) => <li key={p}>• {p}</li>)}
            </ul>
            <Button
              size="sm"
              disabled={checkout.isPending}
              onClick={() => checkout.mutate({ authorUserId, tier: tier.id })}
              className="w-full bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-black font-bold"
            >
              <Lock className="w-3 h-3 mr-1" /> {"Subscribe"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  </>
  );
}
