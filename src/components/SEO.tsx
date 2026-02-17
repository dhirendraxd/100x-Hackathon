import { useEffect } from "react";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: JsonLd;
}

const SITE_NAME = "Form Mitra Smart";
const DEFAULT_BASE_URL = "https://100x-hackathon.vercel.app";
const DEFAULT_OG_IMAGE = "/og-image-thumbnail.png";

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const cleaned = (envUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  return cleaned;
};

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== "content") tag?.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", attrs.content);
};

const upsertLink = (rel: string, href: string) => {
  let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const upsertJsonLd = (jsonLd: JsonLd) => {
  const id = "dynamic-seo-jsonld";
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
};

const removeJsonLd = () => {
  const script = document.getElementById("dynamic-seo-jsonld");
  if (script?.parentNode) {
    script.parentNode.removeChild(script);
  }
};

const SEO = ({ title, description, path = "/", image = DEFAULT_OG_IMAGE, noindex = false, jsonLd }: SEOProps) => {
  useEffect(() => {
    const baseUrl = getBaseUrl();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const canonicalUrl = `${baseUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
    const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;

    document.title = `${title} | ${SITE_NAME}`;

    upsertMeta("meta[name='description']", {
      name: "description",
      content: description,
    });

    upsertMeta("meta[name='robots']", {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });

    upsertLink("canonical", canonicalUrl);

    upsertMeta("meta[property='og:type']", { property: "og:type", content: "website" });
    upsertMeta("meta[property='og:title']", { property: "og:title", content: title });
    upsertMeta("meta[property='og:description']", { property: "og:description", content: description });
    upsertMeta("meta[property='og:url']", { property: "og:url", content: canonicalUrl });
    upsertMeta("meta[property='og:image']", { property: "og:image", content: imageUrl });
    upsertMeta("meta[property='og:image:alt']", { property: "og:image:alt", content: `${title} preview image` });
    upsertMeta("meta[property='og:site_name']", { property: "og:site_name", content: SITE_NAME });

    upsertMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title", content: title });
    upsertMeta("meta[name='twitter:description']", { name: "twitter:description", content: description });
    upsertMeta("meta[name='twitter:image']", { name: "twitter:image", content: imageUrl });
    upsertMeta("meta[name='twitter:image:alt']", { name: "twitter:image:alt", content: `${title} preview image` });

    if (jsonLd) upsertJsonLd(jsonLd);
    else removeJsonLd();
  }, [title, description, path, image, noindex, jsonLd]);

  return null;
};

export default SEO;
