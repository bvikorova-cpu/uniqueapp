import { useEffect, useState } from "react";

/**
 * Small global bus so the mobile bottom nav (and any other surface) can open
 * Uni or the translator, and so the desktop floating buttons can be hidden
 * and restored by the user.
 */

const HIDDEN_KEY = "unique-assistants-hidden-v1";
const VISIBILITY_EVENT = "assistants:visibility";

export const UNI_OPEN_EVENT = "uni:open";
export const TRANSLATE_OPEN_EVENT = "translate:open";

export function openUni() {
  setAssistantsHidden(false);
  window.dispatchEvent(new Event(UNI_OPEN_EVENT));
}

export function openTranslator() {
  setAssistantsHidden(false);
  window.dispatchEvent(new Event(TRANSLATE_OPEN_EVENT));
}

export function getAssistantsHidden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAssistantsHidden(hidden: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(VISIBILITY_EVENT));
}

/** Reactive read of the "assistants hidden" preference. */
export function useAssistantsHidden(): boolean {
  const [hidden, setHidden] = useState(getAssistantsHidden);

  useEffect(() => {
    const sync = () => setHidden(getAssistantsHidden());
    window.addEventListener(VISIBILITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(VISIBILITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return hidden;
}

/** Subscribe to an "open me" request coming from the bottom nav. */
export function useOpenRequest(event: string, onOpen: () => void) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  });
}
