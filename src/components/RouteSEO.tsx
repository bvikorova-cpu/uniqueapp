import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { getAIToolSeo } from "@/lib/aiToolsSeoMap";

/**
 * Router-level SEO wrapper. Mounted once inside <Routes> parent, it watches
 * the current pathname and injects per-route <SEO /> meta for any path in the
 * AI Tools & Studios map — without touching the 24 individual page components.
 *
 * Falls back to inline English copy when the i18n key is missing in the active
 * locale, so we never blank the head while translations roll out progressively.
 */
export function RouteSEO() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const entry = getAIToolSeo(pathname);
  if (!entry) return null;

  const title = t(`${entry.key}.title`, { defaultValue: entry.title });
  const description = t(`${entry.key}.description`, { defaultValue: entry.description });

  return (
    <SEO
      title={title}
      description={description}
      canonical={pathname}
      type="website"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: title,
        description,
        applicationCategory: "MultimediaApplication",
        inLanguage: i18n.language,
        offers: { "@type": "Offer", priceCurrency: "EUR" },
      }}
    />
  );
}

export default RouteSEO;
