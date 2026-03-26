import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, Eye, Ban, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface CategoryControl {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  description: string;
}

export const ContentBlocking = () => {
  const [categories, setCategories] = useState<CategoryControl[]>([
    { id: "stories", label: "Príbehy & Rozprávky", emoji: "📖", enabled: true, description: "AI generované príbehy" },
    { id: "drawing", label: "Kreslenie & Maľovanie", emoji: "🎨", enabled: true, description: "Interaktívne kreslenie" },
    { id: "science", label: "Vedecké experimenty", emoji: "🔬", enabled: true, description: "Virtuálne experimenty" },
    { id: "homework", label: "Domáce úlohy", emoji: "📝", enabled: true, description: "Matematika, jazyk, veda" },
    { id: "games", label: "Vzdelávacie hry", emoji: "🎮", enabled: true, description: "Kvízy a hádanky" },
    { id: "videos", label: "Videá & Animácie", emoji: "🎬", enabled: false, description: "Vzdelávacie videá" },
  ]);

  const [scheduledAccess, setScheduledAccess] = useState({
    enabled: false,
    startTime: "08:00",
    endTime: "18:00",
    weekendExtend: true,
  });

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              Whitelist povolených aktivít
            </CardTitle>
            <CardDescription>Vyberte, ktoré kategórie obsahu sú pre vaše dieťa povolené</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  cat.enabled ? "bg-green-50/50 border-green-200" : "bg-red-50/30 border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{cat.label}</p>
                      {cat.enabled ? (
                        <Badge className="bg-green-500 h-5 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Povolené
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="h-5 text-[10px]">
                          <Ban className="w-3 h-3 mr-0.5" /> Blokované
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
                <Switch checked={cat.enabled} onCheckedChange={() => toggleCategory(cat.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Naplánovaný prístup
            </CardTitle>
            <CardDescription>Nastavte časové okno, kedy dieťa môže používať aplikáciu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Zapnúť časový plán</p>
                <p className="text-xs text-muted-foreground">Prístup len v povolenom čase</p>
              </div>
              <Switch
                checked={scheduledAccess.enabled}
                onCheckedChange={(v) => setScheduledAccess(prev => ({ ...prev, enabled: v }))}
              />
            </div>

            {scheduledAccess.enabled && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Od</label>
                    <Select
                      value={scheduledAccess.startTime}
                      onValueChange={(v) => setScheduledAccess(prev => ({ ...prev, startTime: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["06:00", "07:00", "08:00", "09:00", "10:00"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Do</label>
                    <Select
                      value={scheduledAccess.endTime}
                      onValueChange={(v) => setScheduledAccess(prev => ({ ...prev, endTime: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Predĺžený prístup cez víkend</p>
                    <p className="text-xs text-blue-600">+1 hodina navyše v sobotu a nedeľu</p>
                  </div>
                  <Switch
                    checked={scheduledAccess.weekendExtend}
                    onCheckedChange={(v) => setScheduledAccess(prev => ({ ...prev, weekendExtend: v }))}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              onClick={() => toast.success("Nastavenia uložené!")}
            >
              Uložiť nastavenia
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
