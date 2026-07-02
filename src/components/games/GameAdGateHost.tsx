import { useEffect, useState } from "react";
import { _registerAdGateHost } from "@/lib/gameAdGate";
import { GameAdGateModal } from "./GameAdGateModal";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Mount once near the app root. Listens for openGate() calls from anywhere
 * and renders the fullscreen <GameAdGateModal /> on top of the app.
 */
type Phase = "pre" | "post";

export const GameAdGateHost = () => {
  const [state, setState] = useState<{ phase: Phase; done: () => void } | null>(null);

  useEffect(() => {
    _registerAdGateHost((phase, done) => setState({ phase, done }));
    return (
    <>
      <FloatingHowItWorks title={"Game Ad Gate Host - How it works"} steps={[{ title: 'Open', desc: 'Access the Game Ad Gate Host section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Game Ad Gate Host.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => _registerAdGateHost(null);
  }, []);

  if (!state) return null;
  return (
    <GameAdGateModal
      phase={state.phase}
      onClose={() => {
        state.done();
        setState(null);
      }}
    />
  );
};
