import { siteConfig } from "@/lib/seo";

// ─── Navigation ─────────────────────────────────────────
export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Docs", href: "#docs" },
    { label: "About", href: "#about" },
] as const;

// ─── Site ───────────────────────────────────────────────
export const SITE_NAME = siteConfig.name;
export const SITE_URL = siteConfig.url;

// ─── Feature List (for landing page) ────────────────────
export const FEATURES = [
    {
        title: "Redux Toolkit & RTK Query",
        description:
            "Pre-configured store with typed hooks, example slices, and a full RTK Query API service with CRUD endpoints and cache invalidation.",
        icon: "⚡",
    },
    {
        title: "shadcn/ui Components",
        description:
            "Beautiful, accessible UI components built with Radix UI and Tailwind CSS. Fully customizable and ready to use.",
        icon: "🎨",
    },
    {
        title: "SEO Optimized",
        description:
            "Built-in metadata helpers, Open Graph tags, JSON-LD structured data, sitemap, robots.txt, and PWA manifest.",
        icon: "🔍",
    },
    {
        title: "TypeScript First",
        description:
            "Strict TypeScript configuration with path aliases, typed Redux hooks, and full type safety across the entire codebase.",
        icon: "🛡️",
    },
    {
        title: "Professional Tooling",
        description:
            "Prettier formatting, ESLint with Next.js best practices, environment variable management, and organized folder structure.",
        icon: "🔧",
    },
    {
        title: "Production Ready",
        description:
            "Security headers, image optimization, responsive design, dark mode support, and performance best practices built in.",
        icon: "🚀",
    },
] as const;
