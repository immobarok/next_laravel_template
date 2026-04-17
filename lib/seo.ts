import type { Metadata } from "next";

// ─── Configuration ──────────────────────────────────────
const siteConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || "My Next App",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description: "A professional Next.js application",
    locale: "en_US",
};

// ─── Metadata Helper ────────────────────────────────────
interface CreateMetadataOptions {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
    pathname?: string;
}

export function createMetadata({
    title,
    description = siteConfig.description,
    image = "/og-image.png",
    noIndex = false,
    pathname = "",
}: CreateMetadataOptions = {}): Metadata {
    const fullTitle = title
        ? `${title} | ${siteConfig.name}`
        : siteConfig.name;
    const url = `${siteConfig.url}${pathname}`;

    return {
        title: fullTitle,
        description,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: siteConfig.name,
            locale: siteConfig.locale,
            type: "website",
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [image],
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

// ─── JSON-LD Structured Data ────────────────────────────
interface JsonLdWebSiteOptions {
    name?: string;
    url?: string;
    description?: string;
}

export function generateWebSiteJsonLd({
    name = siteConfig.name,
    url = siteConfig.url,
    description = siteConfig.description,
}: JsonLdWebSiteOptions = {}) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        potentialAction: {
            "@type": "SearchAction",
            target: `${url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };
}

interface JsonLdOrganizationOptions {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
}

export function generateOrganizationJsonLd({
    name = siteConfig.name,
    url = siteConfig.url,
    logo = `${siteConfig.url}/logo.png`,
    description = siteConfig.description,
}: JsonLdOrganizationOptions = {}) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        description,
    };
}

export { siteConfig };
