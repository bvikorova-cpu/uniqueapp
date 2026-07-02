import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const species = ["Puppy", "Kitten", "Bunny", "Pony", "Unicorn", "Dolphin", "Flamingo", "Butterfly"];
const groomingStyles = ["Glamorous", "Cute & Cozy", "Princess Style", "Sporty", "Boho", "Rainbow", "Fairy", "Rockstar"];

export function PetSalon({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [groomStyle, setGroomStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const { data: pets, refetch } = useQuery({
    queryKey: ["glamour-pets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("glamour_pets").select("*").eq("user_id", user.id);
      return data || [];
    },
  });

  const adoptPet = async () => {
    if (!petName || !petSpecies) return toast({ title: "Name your pet and choose species", variant: "destructive" });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      await supabase.from("glamour_pets").insert({ user_id: user.id, name: petName, species: petSpecies.toLowerCase() });
      toast({ title: "🎉 Pet Adopted!", description: `Welcome ${petName} the ${petSpecies}!` });
      setPetName(""); setPetSpecies("");
      refetch();
    } catch (e: any) {
      const isCoinsErr = e?.context?.status === 402 || (typeof e?.message === "string" && e.message.includes("insufficient_glamour_coins"));
        if (isCoinsErr) {
          toast({ title: "Not enough Glamour Coins ✨", description: "Buy more coins in the Coin Shop to keep creating!", variant: "destructive" });
        } else {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    }
  };

  const groomPet = async (petId: string) => {
    if (!groomStyle) return toast({ title: "Select a grooming style", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "pet_grooming", prompt: `Groom a pet in ${groomStyle} style. Describe the new look, accessories, and how the pet feels.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_pets").update({ grooming_count: (pets?.find(p => p.id === petId)?.grooming_count || 0) + 1, current_outfit: groomStyle }).eq("id", petId);
      refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Pet Salon - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Salon section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Salon.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🐾 Pet Salon</h2>
      <p className="text-muted-foreground">Adopt and groom your virtual pets!</p>

      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 space-y-4">
        <h3 className="font-bold">Adopt a New Pet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Pet name" value={petName} onChange={e => setPetName(e.target.value)} />
          <Select value={petSpecies} onValueChange={setPetSpecies}>
            <SelectTrigger><SelectValue placeholder="Species" /></SelectTrigger>
            <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={adoptPet} className="bg-gradient-to-r from-pink-500 to-purple-500">
          <Heart className="h-4 w-4 mr-2" /> Adopt Pet
        </Button>
      </div>

      {pets && pets.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Your Pets</h3>
          <Select value={groomStyle} onValueChange={setGroomStyle}>
            <SelectTrigger><SelectValue placeholder="Grooming Style" /></SelectTrigger>
            <SelectContent>{groomingStyles.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map(pet => (
              <div key={pet.id} className="bg-card border border-pink-400/20 rounded-xl p-4">
                <p className="font-bold">{pet.name} <span className="text-pink-400 text-sm">({pet.species})</span></p>
                <p className="text-xs text-muted-foreground">Happiness: {pet.happiness}% | Style Lv.{pet.style_level} | Groomed {pet.grooming_count}x</p>
                {pet.current_outfit && <p className="text-xs text-pink-400 mt-1">Current look: {pet.current_outfit}</p>}
                <Button size="sm" onClick={() => groomPet(pet.id)} disabled={loading} className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500">
                  {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Groom (4 coins)
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
