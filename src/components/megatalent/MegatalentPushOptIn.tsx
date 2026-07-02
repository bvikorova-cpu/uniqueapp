import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MegatalentPushOptIn = () => {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
    } else {
      setStatus(Notification.permission);
    }
  }, []);

  const enable = async () => {
    if (status === "unsupported") return;
    const p = await Notification.requestPermission();
    setStatus(p);
    if (p === "granted") {
      toast.success("Notifications enabled", { description: "We'll ping you on vote milestones and contest finales." });
      try { new Notification("Unique MegaTalent", { body: "You're in! 🎉" }); } catch {}
    } else {
      toast.info("Notifications dismissed");
    }
  };

  if (status === "granted") return null;

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Push Opt In - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Push Opt In section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Push Opt In.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          {status === "denied" ? <BellOff className="h-5 w-5 text-destructive" /> : <Bell className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">Get vote alerts & finale pings</div>
          <div className="text-xs text-muted-foreground truncate">
            {status === "denied" ? "Notifications blocked — enable in browser settings." : "Stay updated on milestones in real time."}
          </div>
        </div>
        <Button size="sm" onClick={enable} disabled={status === "unsupported" || status === "denied"}>
          {status === "unsupported" ? "N/A" : "Enable"}
        </Button>
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentPushOptIn;
