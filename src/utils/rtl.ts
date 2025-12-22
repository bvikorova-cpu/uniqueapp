// RTL (Right-to-Left) support utilities for Arabic and other RTL languages

export const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "sd", "ckb", "dv", "ks", "ku", "ug", "yi"];

/**
 * Check if a language code is RTL
 */
export function isRTLLanguage(languageCode: string): boolean {
  const lang = languageCode.split("-")[0].toLowerCase();
  return RTL_LANGUAGES.includes(lang);
}

/**
 * Get the text direction for a language
 */
export function getDirection(languageCode: string): "ltr" | "rtl" {
  return isRTLLanguage(languageCode) ? "rtl" : "ltr";
}

/**
 * Apply RTL direction to the document
 */
export function applyRTLToDocument(languageCode: string): void {
  const direction = getDirection(languageCode);
  document.documentElement.dir = direction;
  document.documentElement.lang = languageCode;
  
  // Add or remove RTL class for custom styling
  if (direction === "rtl") {
    document.body.classList.add("rtl");
    document.body.classList.remove("ltr");
  } else {
    document.body.classList.add("ltr");
    document.body.classList.remove("rtl");
  }
}

/**
 * Get logical CSS property based on direction
 * Converts start/end to left/right based on RTL
 */
export function getLogicalProperty(property: "start" | "end", isRTL: boolean): "left" | "right" {
  if (property === "start") {
    return isRTL ? "right" : "left";
  }
  return isRTL ? "left" : "right";
}

/**
 * Mirror a value for RTL (e.g., for transforms, margins)
 */
export function mirrorForRTL<T extends number>(value: T, isRTL: boolean): T {
  return (isRTL ? -value : value) as T;
}

/**
 * Get text alignment based on direction
 */
export function getTextAlign(isRTL: boolean): "left" | "right" {
  return isRTL ? "right" : "left";
}

/**
 * Flip horizontal icon for RTL
 */
export function shouldFlipIcon(iconName: string): boolean {
  const iconsToFlip = [
    "arrow-left",
    "arrow-right",
    "chevron-left", 
    "chevron-right",
    "arrow-right-circle",
    "arrow-left-circle",
    "skip-back",
    "skip-forward",
    "undo",
    "redo",
    "reply",
    "forward",
  ];
  return iconsToFlip.includes(iconName.toLowerCase());
}

/**
 * CSS classes for RTL-aware layouts
 */
export const rtlClasses = {
  // Flex direction
  flexRowReverse: "rtl:flex-row-reverse",
  
  // Spacing
  marginStart: "ltr:ml-2 rtl:mr-2",
  marginEnd: "ltr:mr-2 rtl:ml-2",
  paddingStart: "ltr:pl-2 rtl:pr-2",
  paddingEnd: "ltr:pr-2 rtl:pl-2",
  
  // Positioning  
  start: "ltr:left-0 rtl:right-0",
  end: "ltr:right-0 rtl:left-0",
  
  // Text alignment
  textStart: "ltr:text-left rtl:text-right",
  textEnd: "ltr:text-right rtl:text-left",
  
  // Border radius
  roundedStart: "ltr:rounded-l rtl:rounded-r",
  roundedEnd: "ltr:rounded-r rtl:rounded-l",
  
  // Transforms
  flipX: "rtl:-scale-x-100",
};

export default {
  isRTLLanguage,
  getDirection,
  applyRTLToDocument,
  getLogicalProperty,
  mirrorForRTL,
  getTextAlign,
  shouldFlipIcon,
  rtlClasses,
};
