/**
 * PII masking helpers for admin UIs, audit logs, and any place where a
 * full email/phone/IP is unnecessary. Show enough for identification,
 * not enough for harvesting.
 */

export const maskEmail = (email?: string | null): string => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
};

export const maskPhone = (phone?: string | null): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const last = digits.slice(-3);
  const prefix = phone.startsWith("+") ? `+${digits.slice(0, Math.min(3, digits.length - 3))}` : "";
  return `${prefix} *** *** ${last}`.trim();
};

export const maskIP = (ip?: string | null): string => {
  if (!ip) return "";
  if (ip.includes(":")) {
    // IPv6 — keep first 2 segments
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:****`;
  }
  const parts = ip.split(".");
  if (parts.length !== 4) return "***";
  return `${parts[0]}.${parts[1]}.*.*`;
};

export const maskName = (name?: string | null): string => {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= 1) return "*";
  return `${trimmed[0]}${"*".repeat(Math.min(trimmed.length - 1, 5))}`;
};

export const maskUUID = (id?: string | null): string => {
  if (!id) return "";
  return `${id.slice(0, 8)}…`;
};
