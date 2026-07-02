import { useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ProfileJsonLdProps {
  profile: {
    id?: string;
    full_name?: string | null;
    username?: string | null;
    headline?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    location?: string | null;
    occupation?: string | null;
    company?: string | null;
    website?: string | null;
    social_links?: Record<string, string | undefined> | null;
  };
}

/**
 * Injects schema.org Person JSON-LD into <head> + sets <title> / meta description.
 * Cleans itself up on unmount.
 */
export const ProfileJsonLd = ({ profile }: ProfileJsonLdProps) => {
  useEffect(() => {
    const name = profile.full_name || profile.username || "Profile";
    const description = (profile.headline || profile.bio || "").slice(0, 160);
    const url = typeof window !== "undefined" ? window.location.href : "";

    const sameAs = profile.social_links
      ? Object.values(profile.social_links).filter((v): v is string => !!v && /^https?:\/\//.test(v))
      : [];

    const data: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      url,
    };
    if (description) data.description = description;
    if (profile.avatar_url) data.image = profile.avatar_url;
    if (profile.occupation) data.jobTitle = profile.occupation;
    if (profile.company) data.worksFor = { "@type": "Organization", name: profile.company };
    if (profile.location) data.address = { "@type": "PostalAddress", addressLocality: profile.location };
    if (sameAs.length) data.sameAs = sameAs;

    // Title
    const prevTitle = document.title;
    document.title = profile.headline ? `${name} — ${profile.headline}` : name;

    // Meta description
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    let createdMeta = false;
    const prevMetaContent = meta?.getAttribute("content") || "";
    if (!meta && description) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
      createdMeta = true;
    }
    if (meta && description) meta.setAttribute("content", description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let createdCanonical = false;
    const prevCanonical = canonical?.getAttribute("href") || "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    canonical.setAttribute("href", url);

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.setAttribute("data-profile-jsonld", profile.id || name);
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      if (createdMeta && meta) meta.remove();
      else if (meta && prevMetaContent) meta.setAttribute("content", prevMetaContent);
      if (createdCanonical && canonical) canonical.remove();
      else if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      script.remove();
    };
  }, [profile]);

  return null;
};
