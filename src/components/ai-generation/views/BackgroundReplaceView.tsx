import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const BackgroundReplaceView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [subject, setSubject] = useState("");
  const [bg, setBg] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Background Replace View - How it works"} steps={[{ title: 'Open', desc: 'Access the Background Replace View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Background Replace View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Background Replace" emoji="🌅" description="Place any subject into a brand-new environment with realistic lighting." cost={3} action="bg_replace" buttonLabel="Replace Background" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!subject.trim() || !bg.trim()) { toast.error("Fill both fields"); return null; } return { prompt: subject, backgroundPrompt: bg }; }}>
      <label className="text-sm font-bold block">Subject</label>
      <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., a smiling woman holding a coffee cup" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">New Background</label>
      <Textarea value={bg} onChange={(e) => setBg(e.target.value)} placeholder="e.g., snowy mountain peak at golden hour" rows={2} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
