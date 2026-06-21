import { useEffect, useState, type ReactNode } from "react";
import { ParentalGate, useParentalGate } from "./ParentalGate";

interface Props {
  featureName: string;
  storageKey?: string;
  children: ReactNode;
}

/**
 * Wrap any Kids Channel page (especially Gold Pass €79 features)
 * with a one-time-per-session parental gate.
 */
export function KidsParentalGateGuard({ featureName, storageKey, children }: Props) {
  const { checkVerification } = useParentalGate(storageKey);
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const ok = checkVerification();
    if (ok) setVerified(true);
    else setOpen(true);
  }, []);

  if (!verified) {
    return (
      <ParentalGate
        isOpen={open}
        featureName={featureName}
        storageKey={storageKey}
        onSuccess={() => { setOpen(false); setVerified(true); }}
        onCancel={() => { setOpen(false); window.location.assign("/"); }}
      />
    );
  }

  return <>{children}</>;
}
