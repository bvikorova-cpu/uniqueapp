import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const DIRECTIONS = [
  { v: "all sides", label: "All sides (panorama)" },
  { v: "the left", label: "Left" },
  { v: "the right", label: "Right" },
  { v: "the top (sky/ceiling)", label: "Top" },
  { v: "the bottom (foreground/ground)", label: "Bottom" },
];

export const OutpaintingView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [region, setRegion] = useState("all sides");
  return (
    <>
      <FloatingHowItWorks title={"Outpainting View - How it works"} steps={[{ title: 'Open', desc: 'Access the Outpainting View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Outpainting View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Outpainting" emoji="🖼️" description="Extend your image beyond its original frame — go widescreen or panoramic." cost={4} action="outpainting" buttonLabel="Expand Image" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!prompt.trim()) { toast.error("Describe the original scene"); return null; } return { prompt, region, aspectRatio: "16:9" }; }}>
      <label className="text-sm font-bold block">Original scene</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., a wooden cabin in a snowy forest at dusk" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Direction to extend</label>
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{DIRECTIONS.map(d => <SelectItem key={d.v} value={d.v}>{d.label}</SelectItem>)}</SelectContent>
      </Select>
    </SimpleAITool>
    </>
  );
};
