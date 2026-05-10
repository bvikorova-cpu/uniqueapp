import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";

export const LogoTextView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [text, setText] = useState("");
  const [brand, setBrand] = useState("");
  const [style, setStyle] = useState("");
  return (
    <SimpleAITool title="Logo & Text Generator" emoji="🔤" description="Generate logos with perfectly legible typography — built for brand work." cost={4} action="logo_text" buttonLabel="Generate Logo" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!text.trim()) { toast.error("Logo text required"); return null; } return { logoText: text, brandName: brand, prompt: style, aspectRatio: "1:1" }; }}>
      <label className="text-sm font-bold block">Text to render</label>
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., NOVA STUDIOS" />
      <label className="text-sm font-bold block mt-2">Brand name (optional)</label>
      <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g., Nova Studios" />
      <label className="text-sm font-bold block mt-2">Visual style (optional)</label>
      <Textarea value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., minimalist black & gold, art-deco serif" rows={2} className="resize-none" />
    </SimpleAITool>
  );
};
