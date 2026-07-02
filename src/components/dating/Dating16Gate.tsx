import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STORAGE_KEY = "dating_age_gate_v1";

/**
 * 16+ age gate for Dating. One-time confirmation persisted in localStorage.
 * Users under 16 are redirected to the Kids Channel.
 */
export const Dating16Gate = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const confirm = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  const deny = () => {
    try { localStorage.setItem(STORAGE_KEY, "0"); } catch {}
    navigate("/kids-academy", { replace: true });
  };

  return (
    <>
      <FloatingHowItWorks title={"Dating16 Gate - How it works"} steps={[{ title: 'Open', desc: 'Access the Dating16 Gate section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dating16 Gate.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) deny(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Are you 16 or older?</DialogTitle>
          <DialogDescription className="text-center">
            Dating is restricted to users aged 16 and over. If you are younger, please use the Kids Channel.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={deny}>I'm under 16</Button>
          <Button className="flex-1" onClick={confirm}>I'm 16+</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Dating16Gate;
