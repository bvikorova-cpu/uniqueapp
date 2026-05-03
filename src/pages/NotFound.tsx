import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// Legacy / alias paths that should redirect to the canonical premium page
// instead of showing a 404. Keep keys lowercase.
const PREMIUM_ALIASES: Record<string, string> = {
  "/pricing": "/subscription",
  "/price": "/subscription",
  "/prices": "/subscription",
  "/plans": "/subscription",
  "/plan": "/subscription",
  "/upgrade": "/subscription",
  "/subscriptions": "/subscription",
  "/billing": "/subscription",
  "/membership": "/subscription",
  "/memberships": "/subscription",
  "/premium-plans": "/premium",
  "/pro": "/premium",
  "/vip": "/premium",
  "/checkout": "/subscription",
  "/buy": "/subscription",
  "/payment": "/subscription",
  "/payments": "/subscription",
};

// Any path containing one of these tokens (as a path segment) will fall back
// to /subscription instead of showing a 404. This catches nested aliases like
// /pricing/pro, /billing/invoice/123, /plans/annual, etc.
const PREMIUM_TOKENS = [
  "pricing",
  "prices",
  "price",
  "plans",
  "plan",
  "upgrade",
  "subscribe",
  "subscriptions",
  "billing",
  "membership",
  "memberships",
  "checkout",
  "buy",
  "payment",
  "payments",
];

const PREMIUM_PAGE_TOKENS = ["premium", "pro", "vip"];

const NotFound = () => {
  const location = useLocation();

  // Normalize path: lowercase + strip trailing slash (but keep root "/")
  const normalized = useMemo(() => {
    const p = location.pathname.toLowerCase();
    return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  }, [location.pathname]);

  const redirectTo = useMemo(() => {
    // 1. Exact alias hit
    if (PREMIUM_ALIASES[normalized]) return PREMIUM_ALIASES[normalized];

    // 2. Segment-based fallback: scan path segments for known tokens
    const segments = normalized.split("/").filter(Boolean);
    if (segments.some((s) => PREMIUM_PAGE_TOKENS.includes(s))) return "/premium";
    if (segments.some((s) => PREMIUM_TOKENS.includes(s))) return "/subscription";

    return null;
  }, [normalized]);

  useEffect(() => {
    if (redirectTo) {
      console.info(`Redirecting legacy path ${location.pathname} → ${redirectTo}`);
    } else {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname, redirectTo]);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
