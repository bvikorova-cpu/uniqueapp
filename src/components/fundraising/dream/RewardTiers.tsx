import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, Users, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface RewardTier {
  id: string;
  label: string;
  amount: number;
  description: string;
  perks: string[];
  estimated_delivery?: string;
  limited_quantity?: number;
  claimed_count?: number;
  shipping_required?: boolean;
}

interface Props {
  tiers: RewardTier[];
  selectedTierId?: string;
  onSelect: (tier: RewardTier) => void;
}

export function RewardTiers({ tiers, selectedTierId, onSelect }: Props) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Reward Tiers - How it works"} steps={[{ title: 'Open', desc: 'Access the Reward Tiers section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reward Tiers.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Choose Your Reward</h3>
      </div>
      <div className="space-y-3">
        {tiers.map((tier, i) => {
          const isSelected = selectedTierId === tier.id;
          const soldOut =
            tier.limited_quantity != null &&
            (tier.claimed_count ?? 0) >= tier.limited_quantity;
          const remaining =
            tier.limited_quantity != null
              ? tier.limited_quantity - (tier.claimed_count ?? 0)
              : null;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                disabled={soldOut}
                onClick={() => onSelect(tier)}
                className={cn(
                  "w-full text-left rounded-lg border-2 p-4 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50",
                  soldOut && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <h4 className="font-bold">{tier.label}</h4>
                  </div>
                  <span className="text-lg font-black text-primary shrink-0">
                    €{tier.amount}+
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {tier.description}
                </p>
                {tier.perks?.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {tier.perks.map((perk, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {tier.estimated_delivery && (
                    <Badge variant="secondary" className="gap-1">
                      <Package className="w-3 h-3" />
                      Est. {tier.estimated_delivery}
                    </Badge>
                  )}
                  {tier.shipping_required && (
                    <Badge variant="outline">Shipping required</Badge>
                  )}
                  {tier.limited_quantity != null && (
                    <Badge
                      variant={soldOut ? "destructive" : remaining! < 10 ? "default" : "outline"}
                      className="gap-1"
                    >
                      <Users className="w-3 h-3" />
                      {soldOut
                        ? "Sold out"
                        : `${remaining} of ${tier.limited_quantity} left`}
                    </Badge>
                  )}
                  {tier.claimed_count != null && tier.claimed_count > 0 && !soldOut && (
                    <span className="text-muted-foreground">
                      {tier.claimed_count} backer{tier.claimed_count === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </Card>
    </>
  );
}
