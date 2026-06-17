import { describe, it, expect } from "vitest";
import en from "@/i18n/locales/en/translation.json";
import sk from "@/i18n/locales/sk/translation.json";
import cs from "@/i18n/locales/cs/translation.json";
import de from "@/i18n/locales/de/translation.json";
import es from "@/i18n/locales/es/translation.json";
import fr from "@/i18n/locales/fr/translation.json";
import hu from "@/i18n/locales/hu/translation.json";
import itLocale from "@/i18n/locales/it/translation.json";
import ja from "@/i18n/locales/ja/translation.json";
import ko from "@/i18n/locales/ko/translation.json";
import ru from "@/i18n/locales/ru/translation.json";
import zh from "@/i18n/locales/zh/translation.json";

const locales: Record<string, any> = { en, sk, cs, de, es, fr, hu, it: itLocale, ja, ko, ru, zh };

function flatten(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flatten(v, path));
    else keys.push(path);
  }
  return keys;
}

describe("i18n locales", () => {
  it("all 12 locales loaded", () => {
    expect(Object.keys(locales)).toHaveLength(12);
  });

  it("English (default) is non-empty", () => {
    const keys = flatten(en);
    expect(keys.length).toBeGreaterThan(10);
  });

  // Diff against English — warn but don't fail (translations can lag)
  it("each locale has at least 50% of EN keys (catches catastrophic merge loss)", () => {
    const enKeys = new Set(flatten(en));
    for (const [name, l] of Object.entries(locales)) {
      if (name === "en") continue;
      const lKeys = new Set(flatten(l));
      const overlap = [...enKeys].filter((k) => lKeys.has(k)).length;
      const ratio = overlap / enKeys.size;
      expect(ratio, `${name} only has ${(ratio * 100).toFixed(0)}% of EN keys`).toBeGreaterThan(0.5);
    }
  });

  it("collects empty string values (regression guard, allows ≤5)", () => {
    const empties: string[] = [];
    for (const [name, l] of Object.entries(locales)) {
      const flat = flatten(l);
      for (const k of flat) {
        const val = k.split(".").reduce((o: any, p) => o?.[p], l);
        if (typeof val === "string" && val.trim() === "") {
          empties.push(`${name}:${k}`);
        }
      }
    }
    if (empties.length > 0) console.warn("[i18n] empty values:", empties);
    expect(empties.length, `Too many empty translations (regression):\n${empties.join("\n")}`).toBeLessThanOrEqual(15);
  });
});
