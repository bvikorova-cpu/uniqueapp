import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { usePatronCheckout } from "@/hooks/useShadowArenaFeatures";
import { useTranslation } from "react-i18next";

export function PatronModeCard({ authorUserId, authorName }: { authorUserId: string; authorName: string }) {
  const { t } = useTranslation();
  const checkout = usePatronCheckout();

  const TIERS = [
    {
      id: "bronze" as const,
      nameKey: "shadow.patron.bronze",
      price: "€4.99/mo",
      perks: [t("shadow.patron.perk_badge"), t("shadow.patron.perk_exclusive")],
    },
    {
      id: "silver" as const,
      nameKey: "shadow.patron.silver",
      price: "€9.99/mo",
      perks: [t("shadow.patron.perk_all_bronze"), t("shadow.patron.perk_voice"), t("shadow.patron.perk_early")],
      popular: true,
    },
    {
      id: "gold" as const,
      nameKey: "shadow.patron.gold",
      price: "€19.99/mo",
      perks: [t("shadow.patron.perk_all_silver"), t("shadow.patron.perk_custom"), t("shadow.patron.perk_dm")],
    },
  ];

  return (
    <Card className="p-5 bg-gradient-to-br from-[hsl(45,30%,8%)] via-[hsl(0,30%,7%)] to-[hsl(280,25%,7%)] border-yellow-900/30 mb-6">
      <h3 className="text-xl font-black text-yellow-100 flex items-center gap-2 mb-1">
        <Crown className="w-5 h-5 text-yellow-400" />
        {t("shadow.patron.title", { name: authorName })}
      </h3>
      <p className="text-xs text-yellow-200/60 mb-4">{t("shadow.patron.subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`p-4 rounded-xl border-2 bg-card/40 ${
              tier.popular ? "border-yellow-700/60 shadow-[0_0_25px_rgba(180,140,0,0.3)]" : "border-yellow-900/30"
            }`}
          >
            {tier.popular && <span className="block text-[10px] font-bold text-yellow-400 mb-1">{t("shadow.patron.popular")}</span>}
            <p className="font-bold text-yellow-100">{t(tier.nameKey)}</p>
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
              <Lock className="w-3 h-3 mr-1" /> {t("shadow.patron.subscribe")}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
