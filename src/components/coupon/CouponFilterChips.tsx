import { Badge } from "@/components/ui/badge";
import { Truck, Gift, Percent, DollarSign, ShieldCheck } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export type CouponFilterChip = "free_shipping" | "bogo" | "percent_off" | "amount_off" | "verified_only";

const CHIPS: { id: CouponFilterChip; label: string; icon: any }[] = [
  { id: "free_shipping", label: "Free Shipping", icon: Truck },
  { id: "bogo", label: "BOGO", icon: Gift },
  { id: "percent_off", label: "% Off", icon: Percent },
  { id: "amount_off", label: "€ Off", icon: DollarSign },
  { id: "verified_only", label: "Verified Only", icon: ShieldCheck },
];

export function CouponFilterChips({ active, onToggle }: { active: Set<CouponFilterChip>; onToggle: (id: CouponFilterChip) => void }) {
  return (
    <>
      <FloatingHowItWorks title={"Coupon Filter Chips - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Filter Chips section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Filter Chips.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex flex-wrap gap-2 mb-4">
      {CHIPS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onToggle(id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            active.has(id)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}>
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
    </>
  );
}
