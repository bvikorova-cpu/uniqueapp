import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const themes = ["classic", "modern", "futuristic", "retro", "royal"];

export const StadiumBuilder = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [stadium, setStadium] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("football_stadiums").select("*").eq("user_id", user.id).single().then(async ({ data }) => {
      if (data) setStadium(data);
      else {
        const { data: newStadium } = await supabase.from("football_stadiums").insert({ user_id: user.id }).select().single();
        setStadium(newStadium);
      }
    });
  }, [user]);

  const upgrade = async () => {
    if (!user || !stadium) return;
    const { data: coins } = await supabase.from("football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < stadium.upgrade_cost) { toast.error("Not enough coins!"); return; }
    const newLevel = stadium.upgrade_level + 1;
    const newCapacity = stadium.capacity + 5000;
    const newIncome = stadium.income_per_match + 50;
    const newCost = stadium.upgrade_cost * 2;
    await supabase.from("football_coins").update({ balance: coins.balance - stadium.upgrade_cost, total_spent: coins.total_spent + stadium.upgrade_cost }).eq("user_id", user.id);
    await supabase.from("football_stadiums").update({ upgrade_level: newLevel, capacity: newCapacity, income_per_match: newIncome, upgrade_cost: newCost }).eq("id", stadium.id);
    setStadium({ ...stadium, upgrade_level: newLevel, capacity: newCapacity, income_per_match: newIncome, upgrade_cost: newCost });
    toast.success(`Stadium upgraded to Level ${newLevel}!`);
  };

  const changeTheme = async (theme: string) => {
    if (!stadium) return;
    await supabase.from("football_stadiums").update({ theme }).eq("id", stadium.id);
    setStadium({ ...stadium, theme });
    toast.success(`Theme changed to ${theme}!`);
  };

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in first</p></div>;

  return (
    <><FloatingHowItWorks title="StadiumBuilder — How it works" steps={[{title:"Open this section",desc:"Access StadiumBuilder from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🏟️ Stadium Builder</h2>
      {stadium && (
        <>
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl mb-2">🏟️</p>
              <p className="text-xl font-bold">{stadium.name}</p>
              <p className="text-sm text-muted-foreground">Level {stadium.upgrade_level} • {stadium.theme} theme</p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-muted/50"><p className="font-bold">{stadium.capacity.toLocaleString()}</p><p className="text-xs text-muted-foreground">Capacity</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="font-bold">{stadium.income_per_match}</p><p className="text-xs text-muted-foreground">Income/Match</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="font-bold">Lvl {stadium.upgrade_level}</p><p className="text-xs text-muted-foreground">Level</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Upgrade</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Next upgrade: +5,000 capacity, +50 income per match</p>
              <Button onClick={upgrade} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
                <Building className="h-4 w-4" /> Upgrade ({stadium.upgrade_cost.toLocaleString()} coins)
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Stadium Theme</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {themes.map(t => (
                <Button key={t} variant={stadium.theme === t ? "default" : "outline"} size="sm" onClick={() => changeTheme(t)} className="capitalize">{t}</Button>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  </>
  );
};
