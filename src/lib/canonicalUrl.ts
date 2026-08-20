/** Canonical public domain for all shareable / indexable links.
 *  Never use window.location.origin for shares — preview origins expose
 *  the Lovable build domain and show "Internal Lovable project" in previews.
 */
export const CANONICAL_DOMAIN = "https://www.uniqueapp.fun";

export function canonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_DOMAIN}${cleanPath}`;
}
