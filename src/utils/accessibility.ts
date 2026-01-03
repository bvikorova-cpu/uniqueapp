// WCAG 2.1 AA Accessibility utilities

/**
 * Check if contrast ratio meets WCAG AA requirements
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function checkContrastRatio(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAALarge: boolean;
  passesAAA: boolean;
} {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAALarge: ratio >= 3,
    passesAAA: ratio >= 7,
  };
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const sRGB = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Focus trap for modals and dialogs
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  container.addEventListener("keydown", handleKeyDown);
  firstFocusable?.focus();
  
  return () => container.removeEventListener("keydown", handleKeyDown);
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.setAttribute("class", "sr-only");
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string = "aria"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Skip link for keyboard navigation
 */
export function handleSkipLink(targetId: string): void {
  const target = document.getElementById(targetId);
  if (target) {
    target.tabIndex = -1;
    target.focus();
    target.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Apply reduced motion preferences
 */
export function applyReducedMotion(reduce: boolean): void {
  if (reduce) {
    document.body.classList.add("reduce-animations");
  } else {
    document.body.classList.remove("reduce-animations");
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardKeys = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
} as const;

/**
 * Check if event is activation key (Enter or Space)
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === KeyboardKeys.ENTER || event.key === KeyboardKeys.SPACE;
}

/**
 * Accessible button handler that works with keyboard
 */
export function handleAccessibleClick(
  event: React.MouseEvent | React.KeyboardEvent,
  callback: () => void
): void {
  if (event.type === "click") {
    callback();
  } else if (event.type === "keydown") {
    const keyEvent = event as React.KeyboardEvent;
    if (isActivationKey(keyEvent.nativeEvent)) {
      event.preventDefault();
      callback();
    }
  }
}

/**
 * ARIA label generator for icons
 */
export function getIconLabel(iconName: string, context?: string): string {
  const labels: Record<string, string> = {
    search: "Search",
    close: "Close",
    menu: "Menu",
    home: "Home",
    settings: "Settings",
    user: "User",
    heart: "Like",
    share: "Share",
    comment: "Comment",
    send: "Send",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    remove: "Remove",
    expand: "Expand",
    collapse: "Collapse",
    next: "Next",
    previous: "Previous",
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    fullscreen: "Fullscreen",
    download: "Download",
    upload: "Upload",
    refresh: "Refresh",
    filter: "Filter",
    sort: "Sort",
  };
  
  const label = labels[iconName.toLowerCase()] || iconName;
  return context ? `${label} ${context}` : label;
}

export default {
  checkContrastRatio,
  createFocusTrap,
  announceToScreenReader,
  generateAriaId,
  handleSkipLink,
  prefersReducedMotion,
  applyReducedMotion,
  KeyboardKeys,
  isActivationKey,
  handleAccessibleClick,
  getIconLabel,
};
