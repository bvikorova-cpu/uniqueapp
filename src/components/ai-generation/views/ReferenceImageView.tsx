import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const ReferenceImageView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [refDesc, setRefDesc] = useState("");
  const [prompt, setPrompt] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Reference Image View - How it works"} steps={[{ title: 'Open', desc: 'Access the Reference Image View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reference Image View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Reference Image (img2img)" emoji="🎯" description="Generate new images that match the style, mood & palette of a reference." cost={4} action="reference_image" buttonLabel="Generate from Reference" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!refDesc.trim() || !prompt.trim()) { toast.error("Fill both fields"); return null; } return { referencePrompt: refDesc, prompt }; }}>
      <label className="text-sm font-bold block">Describe the reference image's style</label>
      <Textarea value={refDesc} onChange={(e) => setRefDesc(e.target.value)} placeholder="e.g., warm cinematic Wes Anderson palette, symmetrical composition, pastel colors" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">New scene to generate</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., a vintage train station interior with two characters" rows={2} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
