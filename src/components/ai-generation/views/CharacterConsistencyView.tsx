import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CharacterConsistencyView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [scene, setScene] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Character Consistency View - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Consistency View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Consistency View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Character Consistency" emoji="🧑‍🎨" description="Keep the same character across multiple scenes — face, hair, outfit." cost={5} action="character_consistency" buttonLabel="Generate Scene" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!name.trim() || !desc.trim() || !scene.trim()) { toast.error("Fill all fields"); return null; } return { characterName: name, characterDescription: desc, prompt: scene }; }}>
      <label className="text-sm font-bold block">Character name</label>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Luna" />
      <label className="text-sm font-bold block mt-2">Character description (locked features)</label>
      <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g., 25yo Asian woman, short black bob, hazel eyes, freckles, denim jacket, white tee" rows={3} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Current scene</label>
      <Textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="e.g., reading a book in a Parisian café" rows={2} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
