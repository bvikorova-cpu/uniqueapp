import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FUNDRAISING_CATEGORIES, campaignCreateRoute } from "@/lib/fundraisingRoutes";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  triggerLabel?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
}

/**
 * Replaces the hard-coded "/fundraising/medical/create" button so users can
 * pick which campaign category they want to launch.
 */
export function NewCampaignPicker({ triggerLabel = "New Campaign", size = "lg", variant = "default" }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingHowItWorks title={"New Campaign Picker - How it works"} steps={[{ title: 'Open', desc: 'Access the New Campaign Picker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in New Campaign Picker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <Plus className="mr-2 h-5 w-5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a campaign category</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {FUNDRAISING_CATEGORIES.map((c) => (
            <Button
              key={c.type}
              variant="outline"
              className="h-auto flex-col py-4"
              onClick={() => {
                setOpen(false);
                navigate(campaignCreateRoute(c.type));
              }}
            >
              <span className="text-2xl mb-1">{c.emoji}</span>
              <span className="font-semibold">{c.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
