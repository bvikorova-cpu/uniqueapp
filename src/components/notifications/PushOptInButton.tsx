import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  enablePushForCurrentUser,
  disablePushForCurrentUser,
  getPushStatus,
  isPushSupported,
} from "@/lib/pushNotifications";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Status = "unsupported" | "denied" | "default" | "granted";

interface Props {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export const PushOptInButton = ({ variant = "outline", size = "sm", className }: Props) => {
  const [status, setStatus] = useState<Status>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushStatus().then(setStatus);
  }, []);

  if (!isPushSupported() || status === "unsupported") return null;

  const enable = async () => {
    setBusy(true);
    const res = await enablePushForCurrentUser();
    setBusy(false);
    if (res.ok) {
      setStatus("granted");
      toast.success("Push notifications enabled");
    } else if (res.reason === "denied") {
      setStatus("denied");
      toast.error("Notifications are blocked. Enable them in your browser settings.");
    } else if (res.reason === "not-authenticated") {
      toast.error("Please sign in first");
    } else {
      toast.error("Couldn't enable push notifications");
    }
  };

  const disable = async () => {
    setBusy(true);
    await disablePushForCurrentUser();
    setBusy(false);
    setStatus("default");
    toast.success("Push notifications disabled");
  };

  if (status === "granted") {
    return (
    <>
      <FloatingHowItWorks title={"Push Opt In Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Push Opt In Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Push Opt In Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button variant={variant} size={size} className={className} onClick={disable} disabled={busy}>
        <BellRing className="h-4 w-4 mr-2" /> Notifications on
      </Button>
    </>
  );
  }
  if (status === "denied") {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <BellOff className="h-4 w-4 mr-2" /> Blocked
      </Button>
    );
  }
  return (
    <Button variant={variant} size={size} className={className} onClick={enable} disabled={busy}>
      <Bell className="h-4 w-4 mr-2" /> Enable notifications
    </Button>
  );
};

export default PushOptInButton;
