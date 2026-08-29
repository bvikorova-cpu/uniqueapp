// Safety net for AI payloads that arrive as raw/partial JSON inside a text field.
// Guarantees the UI renders structured, readable content instead of JSON soup.

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
  out = out.replace(/,\s*"[^"]*"\s*:\s*$/, "").replace(/,\s*$/, "").replace(/:\s*$/, ": null");
  while (stack.length) out += stack.pop();
  return out;
}

/** Parse a possibly fenced / prose-wrapped / truncated JSON string. */
export function parseLooseJson<T = Record<string, unknown>>(raw: string): T | null {
  if (!raw || typeof raw !== "string") return null;
  const stripped = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  if (!stripped.includes("{")) return null;
  const start = stripped.indexOf("{");
  const candidates = [stripped, stripped.slice(start)];
  for (const c of candidates) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v === "object") return v as T;
    } catch { /* next */ }
  }
  for (const c of candidates) {
    try {
      const v = JSON.parse(repairTruncatedJson(c));
      if (v && typeof v === "object") return v as T;
    } catch { /* next */ }
  }
  return null;
}

export interface HomeworkResult {
  explanation: string;
  steps?: Array<{ title: string; detail: string }>;
  finalAnswer?: string;
  commonMistakes?: string[];
  funFacts?: string[];
  wasFiltered?: boolean;
  truncated?: boolean;
}

/** Normalize a homework-style AI result: unwrap JSON hidden in `explanation`. */
export function normalizeHomeworkResult(result: HomeworkResult | null): HomeworkResult | null {
  if (!result) return null;
  const text = typeof result.explanation === "string" ? result.explanation : "";
  const looksLikeJson = /^\s*[{`]/.test(text) || /"(explanation|steps|finalAnswer)"\s*:/.test(text);
  if (!looksLikeJson) return result;

  const parsed = parseLooseJson<any>(text);
  if (!parsed) {
    return { ...result, explanation: text.replace(/[{}[\]"]/g, " ").replace(/\s+/g, " ").trim() };
  }
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps
        .filter((s: any) => s && (s.title || s.detail))
        .map((s: any) => ({ title: String(s.title ?? ""), detail: String(s.detail ?? "") }))
    : result.steps;
  return {
    explanation: String(parsed.explanation ?? "").trim() || text,
    steps,
    finalAnswer: parsed.finalAnswer ? String(parsed.finalAnswer) : result.finalAnswer,
    commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes.map(String) : result.commonMistakes,
    funFacts: Array.isArray(parsed.funFacts) ? parsed.funFacts.map(String) : result.funFacts,
    wasFiltered: typeof parsed.wasFiltered === "boolean" ? parsed.wasFiltered : result.wasFiltered,
    truncated: result.truncated,
  };
}
