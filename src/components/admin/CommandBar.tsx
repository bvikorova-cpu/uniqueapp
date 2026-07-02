import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
  Users, ChefHat, Mic2, ShieldCheck, Wallet, BarChart3, Building2, Image as ImageIcon,
  Bell, Coins, FileSearch, CreditCard, Briefcase, Trophy
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const commands = [
  { label: "KitchenStars Payouts", path: "/admin/masterchef-payouts", icon: ChefHat, group: "Finance" },
  { label: "Comedy Club Payouts", path: "/admin/comedy-payouts", icon: Mic2, group: "Finance" },
  { label: "Withdrawals", path: "/admin/withdrawals", icon: Wallet, group: "Finance" },
  { label: "Influencer Payouts", path: "/admin/influencer-payouts", icon: Trophy, group: "Finance" },
  { label: "Platform Earnings", path: "/admin/platform-earnings", icon: BarChart3, group: "Finance" },
  { label: "Payment Dashboard", path: "/admin/payment-dashboard", icon: CreditCard, group: "Finance" },
  { label: "Transactions", path: "/admin/transactions", icon: Coins, group: "Finance" },

  { label: "Verifications", path: "/admin/verifications", icon: ShieldCheck, group: "Trust & Safety" },
  { label: "Tipsters", path: "/admin/tipsters", icon: FileSearch, group: "Trust & Safety" },
  { label: "Corporate Inquiries", path: "/admin/corporate-inquiries", icon: Briefcase, group: "Trust & Safety" },

  { label: "Brand Campaigns", path: "/admin/brand-campaigns", icon: Building2, group: "Content" },
  { label: "Brand Moderation", path: "/admin/brand-moderation", icon: ShieldCheck, group: "Trust & Safety" },
  { label: "Image Editor", path: "/admin/image-editor", icon: ImageIcon, group: "Content" },

  { label: "Back to Command Center", path: "/admin", icon: Users, group: "Navigation" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandBar = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return (
    <>
      <FloatingHowItWorks title={"Command Bar - How it works"} steps={[{ title: 'Open', desc: 'Access the Command Bar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Command Bar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const groups = Array.from(new Set(commands.map(c => c.group)));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to admin section… (try 'payouts', 'verify', 'transactions')" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {commands.filter(c => c.group === g).map((c) => (
              <CommandItem
                key={c.path}
                onSelect={() => { onOpenChange(false); navigate(c.path); }}
                className="gap-2"
              >
                <c.icon className="h-4 w-4 text-primary" />
                {c.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
