import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpsBrain Finance",
    short_name: "OpsBrain",
    description: "המערכת התפעולית הפיננסית של העסק שלך",
    start_url: "/",
    display: "standalone",
    background_color: "#121820",
    theme_color: "#121820",
    orientation: "portrait-primary",
    dir: "rtl",
    lang: "he",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/brand/brain-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/brain-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
