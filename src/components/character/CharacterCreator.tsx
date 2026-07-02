import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2, Shield, Zap, Heart, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = [
  { name: "Superhero", icon: "🦸", color: "from-blue-500 to-cyan-500" },
  { name: "Anime", icon: "⚡", color: "from-pink-500 to-rose-500" },
  { name: "Fantasy", icon: "🧙", color: "from-purple-500 to-violet-500" },
  { name: "Sci-Fi", icon: "🚀", color: "from-cyan-500 to-blue-500" },
  { name: "Cartoon", icon: "🎨", color: "from-yellow-500 to-orange-500" },
  { name: "Villain", icon: "💀", color: "from-red-500 to-rose-600" },
];

export const CharacterCreator = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const queryClient = useQueryClient();

  const createCharacter = useMutation({
    mutationFn: async (data: { name: string; category: string; description: string; isPremium: boolean }) => {
      const { data: result, error } = await supabase.functions.invoke('create-character', { body: data });
      if (error) throw error;
      return result;
    },
    onSuccess: async (aiResult) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('characters').insert({
        user_id: user.id, name, category, description,
        backstory: aiResult.backstory, image_url: aiResult.imageUrl,
        hp: aiResult.stats.hp, attack: aiResult.stats.attack,
        defense: aiResult.stats.defense, speed: aiResult.stats.speed,
        is_premium: isPremium,
      });
      if (error) throw error;
      toast.success("Warrior forged successfully!");
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setName(""); setCategory(""); setDescription(""); setIsPremium(false);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to forge warrior"),
  });

  return (
    <>
      <FloatingHowItWorks title={"Character Creator - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Creator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Creator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Forge Your Warrior</h2>
          <p className="text-muted-foreground text-sm">Craft a legendary character with AI-generated powers</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-bold mb-2 block text-foreground">⚔️ Warrior Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your warrior's name..." disabled={createCharacter.isPending} className="bg-card/50 border-border/30" />
        </div>

        <div>
          <label className="text-sm font-bold mb-3 block text-foreground">🛡️ Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !createCharacter.isPending && setCategory(cat.name)}
                className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${
                  category === cat.name ? `border-primary bg-primary/10 shadow-lg shadow-primary/20` : "border-border/30 bg-card/50 hover:border-primary/40"
                }`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-[10px] font-bold">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block text-foreground">📜 Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your warrior's appearance, powers, and personality..." className="min-h-[100px] bg-card/50 border-border/30" disabled={createCharacter.isPending} />
        </div>

        <div>
          <label className="text-sm font-bold mb-3 block text-foreground">✨ Creation Tier</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !createCharacter.isPending && setIsPremium(false)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                !isPremium ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20" : "border-border/30 bg-card/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-bold">Basic</span>
              </div>
              <p className="text-xs text-muted-foreground">Standard AI generation</p>
              <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">5 Credits</Badge>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !createCharacter.isPending && setIsPremium(true)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                isPremium ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20" : "border-border/30 bg-card/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <span className="font-bold">Premium</span>
              </div>
              <p className="text-xs text-muted-foreground">Enhanced AI + detailed backstory</p>
              <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">15 Credits</Badge>
            </motion.div>
          </div>
        </div>

        <Button
          onClick={() => { if (!name || !category || !description) { toast.error("Fill in all fields"); return; } createCharacter.mutate({ name, category, description, isPremium }); }}
          disabled={createCharacter.isPending}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold"
          size="lg"
        >
          {createCharacter.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Forging Warrior...</>
          ) : (
            <><Sparkles className="mr-2 h-5 w-5" /> Forge Warrior ({isPremium ? 15 : 5} Credits)</>
          )}
        </Button>
      </div>
    </Card>
    </>
  );
};
