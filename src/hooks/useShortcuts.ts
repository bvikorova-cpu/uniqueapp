import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getShortcuts,
  subscribeShortcuts,
  toggleShortcut,
  removeShortcut,
  type Shortcut,
} from "@/lib/userShortcuts";

export function useShortcuts() {
  const { user } = useAuth();
  const [shortcuts, setShortcutsState] = useState<Shortcut[]>([]);

  const refresh = useCallback(() => {
    setShortcutsState(getShortcuts(user?.id));
  }, [user?.id]);

  useEffect(() => {
    refresh();
    return subscribeShortcuts(refresh);
  }, [refresh]);

  return {
    shortcuts,
    toggle: (item: Shortcut) => toggleShortcut(user?.id, item),
    remove: (path: string) => removeShortcut(user?.id, path),
  };
}

export type { Shortcut };
