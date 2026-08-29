// Robust JSON extraction/repair for AI responses.
// Models sometimes wrap JSON in code fences, prepend prose, or get truncated
// mid-object when the token budget runs out. This helper recovers a usable
// object in all of those cases so the UI never renders raw JSON to the user.

export function stripJsonFence(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

/** Close unterminated strings/arrays/objects so a truncated JSON string parses. */
function repairTruncatedJson(s: string): string {
  let out = "";
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const ch of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      out += ch;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
    else if (ch === "}" || ch === "]") stack.pop();
    out += ch;
  }

  if (inString) out += '"';
  // Drop a dangling key/comma tail like: ,"steps": or ,
  out = out.replace(/,\s*"[^"]*"\s*:\s*$/, "").replace(/,\s*$/, "").replace(/:\s*$/, ": null");
  while (stack.length) out += stack.pop();
  return out;
}

/**
 * Parse an AI response into an object. Tries: direct parse, fence-stripped,
 * first {...} slice, then truncation repair. Returns null when nothing works.
 */
export function parseAiJson<T = Record<string, unknown>>(raw: string): T | null {
  if (!raw) return null;
  const candidates: string[] = [];
  const stripped = stripJsonFence(raw);
  candidates.push(stripped, raw);

  const start = stripped.indexOf("{");
  if (start > 0) candidates.push(stripped.slice(start));

  for (const c of candidates) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v === "object") return v as T;
    } catch { /* try next */ }
  }
  for (const c of candidates) {
    try {
      const v = JSON.parse(repairTruncatedJson(c));
      if (v && typeof v === "object") return v as T;
    } catch { /* try next */ }
  }
  return null;
}
