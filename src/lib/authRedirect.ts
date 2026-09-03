/**
 * Origin used in Supabase auth email links.
 * Auth emails must always return to the public site. Deriving this value from
 * window.location would leak preview or localhost origins into emails.
 */
const PRODUCTION_ORIGIN = "https://uniqueapp.fun";

export function authOrigin(): string {
  return PRODUCTION_ORIGIN;
}

export function authRedirect(path = "/"): string {
  return `${authOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
