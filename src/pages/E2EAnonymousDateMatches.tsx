import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ActiveMatches } from "@/components/anonymous-date/ActiveMatches";

/**
 * E2E test harness — renders <ActiveMatches /> with deterministic fixture data
 * driven by URL query params so Playwright can verify partner enrichment
 * (name, age range, interests) without auth, RLS, or Stripe.
 *
 * Only mounts in dev/preview builds (import.meta.env.DEV). In production it
 * renders nothing, so no internal page is exposed to real users.
 *
 * Usage:
 *   /__e2e/anonymous-date-matches?fixture=base64(json([{...match}, ...]))
 */
export default function E2EAnonymousDateMatches() {
  const [params] = useSearchParams();

  const matches = useMemo(() => {
    const raw = params.get("fixture");
    if (!raw) return [];
    try {
      const decoded = atob(raw);
      const parsed = JSON.parse(decoded);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div data-testid="e2e-anon-date-harness" className="container py-10">
      <h1 className="sr-only">E2E Anonymous Dating Matches Harness</h1>
      <ActiveMatches matches={matches} onOpenChat={() => {}} />
    </div>
  );
}
