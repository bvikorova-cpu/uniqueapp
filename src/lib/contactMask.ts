/**
 * Contact-info filter for marketplace listings and early chat messages.
 *
 * Mirrors the server-side `public.scrub_contact_info()` trigger so that
 * legacy rows (written before the trigger existed) are also displayed
 * masked. Contact details may only be exchanged after the buyer paid
 * 2 credits to unlock the contact.
 */

export const CONTACT_MASK = "[contact hidden]";

const PATTERNS: RegExp[] = [
  // e-mails, incl. obfuscated "name (at) domain dot com"
  /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\]|\s+at\s+)\s*[a-z0-9.-]+\s*(?:\.|\(dot\)|\[dot\]|\s+dot\s+)\s*[a-z]{2,}/gi,
  // urls
  /(?:https?:\/\/|www\.)\S+/gi,
  // bare domains
  /[a-z0-9-]+\.(?:com|net|org|sk|cz|eu|io|me|info|shop|online|biz|ru|de|at|hu|pl)(?:\/\S*)?/gi,
  // phone numbers
  /(?:\+|00)?\s*(?:\(?\d{1,4}\)?[\s.\-/]*){2,}\d{2,}/g,
  /\d{7,}/g,
  // messaging apps / socials
  /(?:skype|telegram|whats\s*app|whatsapp|wa\.me|viber|signal|messenger|snap\s*chat|snapchat|instagram|insta|facebook|tiktok|discord|imessage|wechat|kik|zalo|threema|icq|e-?mail|mail\s*me|call\s*me|phone|mobil|telefon|tel\.)/gi,
];

// social handles need the leading boundary preserved
const HANDLE = /(^|[^a-z0-9])@[a-z0-9._]{3,}/gi;

export const maskContactInfo = (text?: string | null): string => {
  if (!text) return "";
  let out = text;
  for (const re of PATTERNS) out = out.replace(re, CONTACT_MASK);
  out = out.replace(HANDLE, (_m, p1) => `${p1}${CONTACT_MASK}`);
  // collapse repeated masks
  return out.replace(/(\[contact hidden\][\s,;:.–-]*){2,}/g, `${CONTACT_MASK} `).trim();
};

export const hasContactInfo = (text?: string | null): boolean =>
  !!text && maskContactInfo(text) !== text.trim();
