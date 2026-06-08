import { useEffect, useState } from "react";

/**
 * Shared parental gate state. Reads sessionStorage at `storageKey`,
 * auto-expires every 30s, and exposes `verify()` to mark as verified.
 *
 * Stored value shape: { expiresAt: number } (ms epoch)
 */
export function useParentalGate(storageKey: string) {
  const read = (): boolean => {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return false;
    try {
      const { expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) return true;
      sessionStorage.removeItem(storageKey);
      return false;
    } catch {
      sessionStorage.removeItem(storageKey);
      return false;
    }
  };

  const [isVerified, setIsVerified] = useState<boolean>(read);

  useEffect(() => {
    const tick = () => {
      const ok = read();
      setIsVerified((prev) => (prev !== ok ? ok : prev));
    };
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const verify = () => setIsVerified(true);
  return { isVerified, verify, storageKey };
}
