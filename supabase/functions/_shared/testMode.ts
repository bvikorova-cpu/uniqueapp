// Shared test-mode helper. When request carries  X-Test-Mode: <TEST_MODE_SECRET>,
// the router short-circuits with a stub response: no auth/credit deduction,
// no OpenAI call. Used by E2E to validate every action's request/response
// shape after consolidation without burning credits.
//
// Returns null when the request is NOT in test mode.

export function checkTestMode(req: Request): null | { stub: (action: string, spec?: { cost?: number }) => Response } {
  const secret = Deno.env.get("TEST_MODE_SECRET");
  if (!secret) return null;
  const provided = req.headers.get("x-test-mode");
  if (!provided || provided !== secret) return null;

  return {
    stub: (action: string, spec?: { cost?: number }) => {
      const body = {
        success: true,
        test_mode: true,
        action,
        cost_would_be: spec?.cost ?? 1,
        // Canned shape that matches what each AI handler returns.
        result: { stub: true, action },
        data: { stub: true, action },
        text: `[test-mode] ${action}`,
        reply: `[test-mode] ${action}`,
        message: `[test-mode] ${action}`,
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Test-Mode": "true",
        },
      });
    },
  };
}
