import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const AvatarPackView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(4);
  return (
    <>
      <FloatingHowItWorks title={"Avatar Pack View - How it works"} steps={[{ title: 'Open', desc: 'Access the Avatar Pack View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Avatar Pack View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="AI Avatar Pack" emoji="👤" description="Generate a multi-style avatar pack — corporate, casual, artistic, cinematic." cost={count * 2} action="avatar_pack" buttonLabel={`Generate ${count} Avatars`} onCreditsUsed={onCreditsUsed} resultKey="imageUrls"
      buildBody={() => { if (!prompt.trim()) { toast.error("Person description required"); return null; } return { prompt, count }; }}>
      <label className="text-sm font-bold block">Person description</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 30yo Black man with short beard, glasses, navy suit" rows={3} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Pack size: {count}</label>
      <Slider value={[count]} onValueChange={(v) => setCount(v[0])} min={1} max={4} step={1} />
    </SimpleAITool>
    </>
  );
};
