#!/usr/bin/env node
/**
 * Button audit — finds <Button> usages that have no obvious interaction.
 *
 * A button is considered "wired" if the opening tag has one of:
 *   onClick=, asChild, type="submit", form=, disabled prop won't count as wired.
 * It is also treated as OK when the immediate parent line is one of the
 * shadcn trigger components (DialogTrigger, PopoverTrigger, etc.) — these
 * wire the click via the trigger.
 *
 * Output: docs/BUTTON_AUDIT.md with `path:line` + snippet for manual review.
 *
 * Run:  node scripts/audit-buttons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const TRIGGER_PARENTS = [
  "DialogTrigger",
  "AlertDialogTrigger",
  "PopoverTrigger",
  "DropdownMenuTrigger",
  "SheetTrigger",
  "TooltipTrigger",
  "HoverCardTrigger",
  "MenubarTrigger",
  "ContextMenuTrigger",
  "CollapsibleTrigger",
  "AccordionTrigger",
];

const WIRED_ATTRS = [
  /\sonClick\s*=/,
  /\sonMouseDown\s*=/,
  /\sonPointerDown\s*=/,
  /\sasChild\b/,
  /\stype\s*=\s*["']submit["']/,
  /\sform\s*=/,
  /\sdisabled\b/, // intentionally non-interactive
  /\{\.\.\.\w+\}/, // spread props — assume wired
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(entry.name)) out.push(p);
  }
  return out;
}

function scanFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  const hits = [];
  // Capture the FULL opening tag (may span multiple lines).
  const re = /<Button\b([^>]*?)>/gs;
  let m;
  while ((m = re.exec(src))) {
    const tag = m[0];
    const attrs = m[1];
    // Line number of tag start
    const lineNo = src.slice(0, m.index).split("\n").length;

    if (WIRED_ATTRS.some((r) => r.test(attrs))) continue;

    // Look at up to 6 preceding non-empty lines for a trigger wrapper.
    let context = "";
    for (let i = lineNo - 2; i >= Math.max(0, lineNo - 7); i--) {
      const l = lines[i];
      if (l == null) continue;
      context = l + "\n" + context;
    }
    if (TRIGGER_PARENTS.some((t) => context.includes(`<${t}`))) continue;

    // Same-line or ancestor <a>/<Link> wrapper — link handles nav
    const sameLine = lines[lineNo - 1] ?? "";
    if (/<Link\b|<a\s/.test(sameLine) || /<Link\b|<a\s/.test(context)) continue;

    const snippet = tag.replace(/\s+/g, " ").slice(0, 120);
    hits.push({ file: path.relative(ROOT, file), line: lineNo, snippet });
  }
  return hits;
}

function main() {
  const files = walk(SRC);
  const all = files.flatMap(scanFile);

  const byFile = new Map();
  for (const h of all) {
    const arr = byFile.get(h.file) ?? [];
    arr.push(h);
    byFile.set(h.file, arr);
  }

  const md = ["# Button audit", "", `Scanned **${files.length}** files, flagged **${all.length}** potentially inert \`<Button>\` usages.`, "", "Heuristic: a Button is flagged when its opening tag has no `onClick`, `asChild`, `type=\"submit\"`, `form=`, spread props, or a shadcn trigger parent. False positives are expected — please review each entry.", ""];
  for (const [file, hits] of [...byFile.entries()].sort()) {
    md.push(`## ${file}`, "");
    for (const h of hits) md.push(`- L${h.line}: \`${h.snippet}\``);
    md.push("");
  }

  const outPath = path.join(ROOT, "docs", "BUTTON_AUDIT.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md.join("\n"));
  console.log(`Wrote ${outPath}`);
  console.log(`Flagged ${all.length} candidate buttons across ${byFile.size} files.`);
}

main();
