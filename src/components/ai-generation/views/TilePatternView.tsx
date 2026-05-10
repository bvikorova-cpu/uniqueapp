import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";

const TYPES = [
  { v: "seamless tile", label: "Seamless Tile" },
  { v: "wallpaper repeating pattern", label: "Wallpaper" },
  { v: "fabric textile pattern", label: "Fabric / Textile" },
  { v: "geometric pattern", label: "Geometric" },
  { v: "floral pattern", label: "Floral" },
  { v: "abstract organic pattern", label: "Abstract Organic" },
];

export const TilePatternView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState(TYPES[0].v);
  return (
    <SimpleAITool title="Tile / Seamless Pattern" emoji="🔳" description="Generate seamless tileable patterns for fabrics, wallpapers, textures." cost={3} action="tile_pattern" buttonLabel="Generate Pattern" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!prompt.trim()) { toast.error("Pattern description required"); return null; } return { prompt, patternType: type }; }}>
      <label className="text-sm font-bold block">Pattern description</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., emerald palm leaves with tropical birds" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Type</label>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}</SelectContent>
      </Select>
    </SimpleAITool>
  );
};
