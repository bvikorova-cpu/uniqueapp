import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const BackgroundRemoveView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [subject, setSubject] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Background Remove View - How it works"} steps={[{ title: 'Open', desc: 'Access the Background Remove View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Background Remove View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Background Remove" emoji="✂️" description="Isolate any subject onto a clean background — perfect for product shots & avatars." cost={2} action="bg_remove" buttonLabel="Remove Background" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!subject.trim()) { toast.error("Describe your subject"); return null; } return { prompt: subject }; }}>
      <label className="text-sm font-bold block">Describe the subject to isolate</label>
      <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., a red leather handbag with gold buckle" rows={3} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
