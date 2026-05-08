import { useEffect } from "react";
import { useLocation, matchRoutes, type RouteObject } from "react-router-dom";

/**
 * Dev-only runtime auditor. Logs a console warning whenever the user lands
 * on a path that does not match any defined route (i.e. would render the
 * 404 page). Pass the same routes array used by <Routes>, or a flat list
 * of patterns. In production this component renders nothing and skips work.
 */
interface Props {
  routes: RouteObject[] | string[];
}

export const RouteAuditor = ({ routes }: Props) => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.PROD) return;
    const routeObjects: RouteObject[] = (routes as unknown[]).every(
      (r) => typeof r === "string"
    )
      ? (routes as string[]).map((path) => ({ path }))
      : (routes as RouteObject[]);

    const match = matchRoutes(routeObjects, location.pathname);
    const hasMatch =
      !!match &&
      match.some(
        (m) => m.route.path && m.route.path !== "*"
      );

    if (!hasMatch) {
      // eslint-disable-next-line no-console
      console.warn(
        `[RouteAuditor] No matching route for "${location.pathname}". ` +
          `Check the link/navigate call that produced this URL.`
      );
    }
  }, [location.pathname, routes]);

  return null;
};
