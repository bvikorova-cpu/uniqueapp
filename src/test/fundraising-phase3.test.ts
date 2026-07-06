import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "src");

function read(p: string) {
  return readFileSync(join(process.cwd(), p), "utf8");
}

describe("Phase 3 — wired modules", () => {
  it("SkillTree calls education-skill-unlock edge fn", () => {
    const src = read("src/pages/education/SkillTree.tsx");
    expect(src).toMatch(/education-skill-unlock/);
    expect(src).toMatch(/functions\.invoke/);
  });

  it("Healthcare dashboard exposes appointments & referrals panels", () => {
    expect(existsSync(join(root, "components/healthcare/AppointmentsPanel.tsx"))).toBe(true);
    expect(existsSync(join(root, "components/healthcare/ReferralsPanel.tsx"))).toBe(true);
    const dash = read("src/pages/HealthcareProviderDashboard.tsx");
    expect(dash).toMatch(/AppointmentsPanel/);
    expect(dash).toMatch(/ReferralsPanel/);
  });

  it("education-skill-unlock edge function exists", () => {
    expect(existsSync(join(process.cwd(), "supabase/functions/education-skill-unlock/index.ts"))).toBe(true);
  });
});
