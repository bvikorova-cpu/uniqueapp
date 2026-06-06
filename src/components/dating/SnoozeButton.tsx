import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Moon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OPTIONS = [
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
  { label: "Until I turn it off", hours: 24 * 365 },
];

interface Props { userId: string; snoozedUntil?: string | null; onChange: (v: string | null) => void; }

export const SnoozeButton = ({ userId, snoozedUntil, onChange }: Props) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const active = snoozedUntil && new Date(snoozedUntil) > new Date();

  const set = async (hours: number | null) => {
    setBusy(true);
    const value = hours ? new Date(Date.now() + hours * 3600000).toISOString() : null;
    const { error } = await supabase.from("dating_profiles")
      .update({ snoozed_until: value }).eq("user_id", userId);
    setBusy(false);
    if (error) toast({ title: "Could not snooze", description: error.message, variant: "destructive" });
    else { toast({ title: value ? "Profile snoozed" : "Profile active again" }); onChange(value); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={active ? "default" : "outline"} size="sm" disabled={busy}>
          <Moon className="h-4 w-4 mr-2" /> {active ? "Snoozed" : "Snooze"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background z-50">
        <DropdownMenuLabel>Hide profile from deck</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(o => (
          <DropdownMenuItem key={o.hours} onClick={() => set(o.hours)}>{o.label}</DropdownMenuItem>
        ))}
        {active && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => set(null)} className="text-primary"><Check className="h-3 w-3 mr-2" /> Wake up now</DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
