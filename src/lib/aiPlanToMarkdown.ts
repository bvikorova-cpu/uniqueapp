/**
 * Converts an AI plan payload (string or nested JSON) into clean markdown
 * so it can be rendered with <AiMarkdown /> instead of raw JSON / pre text.
 */
const titleCase = (key: string) =>
  key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const scalarToText = (v: unknown) => {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const render = (value: unknown, depth: number): string => {
  if (value === null || value === undefined || value === "") return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isPlainObject(item)) {
          const label =
            (item.title as string) ||
            (item.name as string) ||
            (item.day as string) ||
            (item.exercise as string) ||
            "";
          const rest = { ...item };
          ["title", "name", "day", "exercise"].forEach((k) => {
            if (label && rest[k] === label) delete rest[k];
          });
          const head = label ? `**${scalarToText(label)}**` : "";
          const body = Object.entries(rest)
            .map(([k, v]) => {
              const inner = render(v, depth + 1);
              if (!inner) return "";
              return inner.includes("\n")
                ? `\n  - ${titleCase(k)}:\n${inner
                    .split("\n")
                    .map((l) => (l ? `  ${l}` : l))
                    .join("\n")}`
                : `\n  - ${titleCase(k)}: ${inner}`;
            })
            .filter(Boolean)
            .join("");
          return `- ${head}${body}`;
        }
        return `- ${scalarToText(item)}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([k, v]) => {
        const inner = render(v, depth + 1);
        if (!inner) return "";
        if (inner.includes("\n") || isPlainObject(v) || Array.isArray(v)) {
          const heading = "#".repeat(Math.min(depth + 2, 4));
          return `${heading} ${titleCase(k)}\n\n${inner}`;
        }
        return `**${titleCase(k)}:** ${inner}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return scalarToText(value);
};

export const aiPlanToMarkdown = (plan: unknown): string => {
  if (typeof plan === "string") return plan;
  return render(plan, 0);
};

export default aiPlanToMarkdown;
