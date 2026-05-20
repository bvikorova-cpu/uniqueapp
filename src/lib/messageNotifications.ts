// Lightweight browser-notification + tab-title-badge helpers for Messenger.
// Works while the Messenger tab is open but hidden/blurred.

let unreadCount = 0;
let originalTitle: string | null = null;

const ensureTitleSaved = () => {
  if (originalTitle === null && typeof document !== "undefined") {
    originalTitle = document.title.replace(/^\(\d+\)\s*/, "");
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
};

export const showMessageNotification = (
  title: string,
  body: string,
  icon?: string
) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  // Only notify when the tab is not focused.
  if (typeof document !== "undefined" && document.visibilityState === "visible") return;
  try {
    const n = new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      tag: "unique-message",
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // ignore – some browsers block constructor outside SW context
  }
};

export const incrementUnreadBadge = () => {
  if (typeof document === "undefined") return;
  if (document.visibilityState === "visible") return;
  ensureTitleSaved();
  unreadCount += 1;
  document.title = `(${unreadCount}) ${originalTitle}`;
};

export const clearUnreadBadge = () => {
  if (typeof document === "undefined") return;
  unreadCount = 0;
  if (originalTitle !== null) {
    document.title = originalTitle;
  }
};

export const installUnreadBadgeAutoClear = () => {
  if (typeof document === "undefined") return () => {};
  const onVisible = () => {
    if (document.visibilityState === "visible") clearUnreadBadge();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", clearUnreadBadge);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", clearUnreadBadge);
  };
};
