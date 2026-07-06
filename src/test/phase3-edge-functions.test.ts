import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const FNS = [
  "horse-racing-action",
  "gp-racing-action",
  "lottery-ai-action",
  "phobia-trading-action",
  "education-skill-unlock",
];

describe("Phase 3 edge functions exist and have basic structure", () => {
  for (const fn of FNS) {
    it(`${fn} has index.ts with Deno.serve + CORS`, () => {
      const p = path.join(process.cwd(), "supabase/functions", fn, "index.ts");
      expect(fs.existsSync(p)).toBe(true);
      const src = fs.readFileSync(p, "utf8");
      expect(src).toMatch(/Deno\.serve/);
      expect(src).toMatch(/corsHeaders/);
    });
  }
});
