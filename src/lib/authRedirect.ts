/**
 * Origin used in Supabase auth email links.
 * Never emit localhost/127.0.0.1 links — a user opening the confirmation mail
 * on a phone would hit ERR_CONNECTION_REFUSED. Fall back to the live domain.
 */
const PRODUCTION_ORIGIN = "https://uniqueapp.fun";

export function authOrigin(): string {
  if (typeof window === "undefined") return PRODUCTION_ORIGIN;
  const { origin, hostname } = window.location;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local");
  return isLocal ? PRODUCTION_ORIGIN : origin;
}

export function authRedirect(path = "/"): string {
  return `${authOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
