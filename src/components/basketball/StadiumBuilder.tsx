import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const UPGRADES = [
  { name: "Expand Seating", field: "capacity", add: 2000, cost: 1000, desc: "+2,000 seats" },
  { name: "Upgrade Facilities", field: "facilities_level", add: 1, cost: 1500, desc: "+1 facility level" },
  { name: "Premium Court", field: "court_type", add: 0, cost: 2000, desc: "Upgrade court surface" },
  { name: "Revenue Boost", field: "revenue_per_match", add: 50, cost: 800, desc: "+50 coins/match" },
];
const COURT_TYPES = ["standard", "hardwood", "premium", "championship"];

export function StadiumBuilder({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [stadium, setStadium] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("basketball_stadiums").select("*").eq("user_id", user.id).single().then(async ({ data }) => {
      if (data) { setStadium(data); } else {
        const { data: created } = await supabase.from("basketball_stadiums").insert({ user_id: user.id }).select().single();
        setStadium(created);
      }
    });
  }, [user]);

  const upgrade = async (upg: typeof UPGRADES[0]) => {
    if (!user || !stadium) return;
    const spendRes = await spendSportCoins("basketball_coins", upg.cost);
    if (!spendRes.ok) { toast.error("Not enough coins!"); return; }

    let updates: any = { total_upgrades: stadium.total_upgrades + 1 };
    if (upg.field === "court_type") {
      const idx = COURT_TYPES.indexOf(stadium.court_type);
      updates.court_type = COURT_TYPES[Math.min(idx + 1, COURT_TYPES.length - 1)];
    } else {
      updates[upg.field] = (stadium[upg.field] || 0) + upg.add;
    }
    await supabase.from("basketball_stadiums").update(updates).eq("id", stadium.id);
    setStadium({ ...stadium, ...updates });
    toast.success(`Stadium upgraded! (-${upg.cost} coins)`);
  };

  return (
    <><FloatingHowItWorks title="StadiumBuilder — How it works" steps={[{title:"Open this section",desc:"Access StadiumBuilder from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" />Stadium Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {stadium && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 grid grid-cols-2 gap-3 text-sm">
              <div>🏟️ {stadium.name}</div><div>👥 Capacity: {stadium.capacity?.toLocaleString()}</div>
              <div>🏀 Court: {stadium.court_type}</div><div>⭐ Facilities: Lv.{stadium.facilities_level}</div>
              <div>💰 Revenue: {stadium.revenue_per_match}/match</div><div>🔧 Upgrades: {stadium.total_upgrades}</div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {UPGRADES.map(upg => (
              <Button key={upg.name} variant="outline" className="justify-between h-auto py-3" onClick={() => upgrade(upg)}>
                <div className="text-left"><div className="text-sm font-semibold">{upg.name}</div><div className="text-xs text-muted-foreground">{upg.desc}</div></div>
                <span className="text-xs text-primary ml-2">{upg.cost}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
}
